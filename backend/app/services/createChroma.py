import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader, UnstructuredMarkdownLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

load_dotenv()

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
CHROMA_PATH = "app/chroma"
DATA_PATH = "app/data"


def create_chroma_db(file_type='pdf', clear_existing=True):
    """
    Create a Chroma database from document files.
    """
    if clear_existing:
        clear_database()
    
    documents = load_documents(file_type)
    chunks = split_documents(documents, 800, 80)
    add_to_chroma(chunks)
    return documents[0].page_content

def load_documents(file_type: str):
    """Load documents from the data directory."""
    if file_type == 'pdf':
        document_loader = PyPDFDirectoryLoader(path=DATA_PATH, mode="single")
    elif file_type == 'text':
        document_loader = TextLoader(path=DATA_PATH)
    elif file_type == 'markdown':
        document_loader = UnstructuredMarkdownLoader(path=DATA_PATH, mode="single")
    return document_loader.load()

def split_documents(documents: list[Document], chunk_size=800, chunk_overlap=80):
    """Split documents into smaller chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def add_to_chroma(chunks: list[Document]):
    """Add document chunks to Chroma database."""
    # Load the existing database.
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    
    # Calculate Page IDs.
    chunks_with_ids = calculate_chunk_ids(chunks)
    
    # Add or Update the documents.
    existing_items = db.get(include=[])  # IDs are always included by default
    existing_ids = set(existing_items["ids"])
    
    # Only add documents that don't exist in the DB.
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)
    
    if len(new_chunks):
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
        return len(new_chunks)
    else:
        return 0

def calculate_chunk_ids(chunks):
    """Calculate unique IDs for each document chunk."""
    # This will create IDs like "data/monopoly.pdf:6:2"
    # Page Source : Page Number : Chunk Index
    
    last_page_id = None
    current_chunk_index = 0
    
    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"
        
        # If the page ID is the same as the last one, increment the index.
        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0
        
        # Calculate the chunk ID.
        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id
        
        # Add it to the page meta-data.
        chunk.metadata["id"] = chunk_id
    
    return chunks

def clear_database():
    """Clear the existing Chroma database."""
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
