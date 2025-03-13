import os
import argparse
from langchain.document_loaders import PyPDFLoader, UnstructuredMarkdownLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
from langchain.schema import Document
from langchain.vectorstores import Chroma
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from unstructured.partition.pdf import partition_pdf
import shutil

load_dotenv()

# Initialize OpenAI embeddings
openai_api_key = os.getenv('OPENAI_API_KEY')
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002", openai_api_key=openai_api_key)

CHROMA_PATH = "chroma"
DATA_PATH = "../data"

def main():
    clear_database()
    documents = load_documents()
    chunks = split_documents(documents)
    add_to_chroma(chunks)

def load_documents():
    documents = []
    for filename in os.listdir(DATA_PATH):
        filepath = os.path.join(DATA_PATH, filename)
        if filename.lower().endswith('.pdf'):
            documents.extend(load_pdf(filepath))
        elif filename.lower().endswith('.md'):
            loader = UnstructuredMarkdownLoader(filepath)
            documents.extend(loader.load())
        elif filename.lower().endswith('.txt'):
            loader = TextLoader(filepath)
            documents.extend(loader.load())
    return documents

def load_pdf(filepath):
    elements = partition_pdf(
        filename=filepath,
        strategy="hi_res",
        infer_table_structure=True,
        model_name="yolox"
    )
    documents = []
    for element in elements:
        if hasattr(element, 'text'):
            documents.append(Document(page_content=element.text, metadata={"source": filepath}))
        elif hasattr(element, 'text_as_html'):
            documents.append(Document(page_content=element.text_as_html, metadata={"source": filepath, "format": "html"}))
    return documents

def split_documents(documents):
    split_docs = []
    for doc in documents:
        if doc.metadata.get("format") == "html":
            split_docs.append(doc)
        elif doc.metadata.get("source", "").lower().endswith('.md'):
            headers_to_split_on = [("#", "Header 1"), ("##", "Header 2")]
            splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on, is_separator_regex=False)
            split_docs.extend(splitter.split_text(doc.page_content))
        else:
            splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=80, length_function=len, is_separator_regex=False)
            split_docs.extend(splitter.split_text(doc.page_content))
    return [Document(page_content=chunk, metadata=doc.metadata) for chunk in split_docs]

def add_to_chroma(chunks):
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    chunk_ids = [f"{chunk.metadata.get('source')}:{i}" for i, chunk in enumerate(chunks)]
    db.add_documents(chunks, ids=chunk_ids)

def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)

if __name__ == "__main__":
    main()