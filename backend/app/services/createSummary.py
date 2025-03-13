import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain.chains.summarize import load_summarize_chain
from agentic_chunker import AgenticChunker
from langchain_community.vectorstores import Chroma

load_dotenv()

api_key = os.environ['OPENAI_API_KEY']
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = OpenAI(temperature=0, model_name="gpt-4o-mini", openai_api_key=api_key)

CHROMA_PATH = "app/chromaSummary"
DATA_PATH = "app/data"


def main():
    clear_database()
    documents = load_documents('pdf')

    print("Number of documents: ", len(documents))

    # Split documents into chunks
    chunks = create_documents(documents)
    print(f"Number of chunks created: {len(chunks)}")

    # Initialize AgenticChunker
    agentic_chunker = AgenticChunker()

    # Feed chunks into the agentic chunker to categorize them into sections
    for chunk in chunks:
        agentic_chunker.add_proposition(chunk.page_content)

    # Get the categorized chunks
    categorized_chunks = agentic_chunker.get_chunks(get_type='dict')

    # Summarize each section
    section_summaries = {}
    for chunk_id, chunk_data in categorized_chunks.items():
        section_title = chunk_data['title']
        section_propositions = chunk_data['propositions']

        # Combine propositions into a single text for summarization
        section_text = " ".join(section_propositions)

        # Summarize the section
        summary_chain = load_summarize_chain(llm=llm, chain_type='map_reduce')
        section_summary = summary_chain.run([Document(page_content=section_text)])

        section_summaries[section_title] = section_summary

    # Print section summaries
    print("\nSection Summaries:")
    for title, summary in section_summaries.items():
        print(f"### {title} ###")
        print(summary)
        print("\n")

    # Add chunks to Chroma (optional, if you want to store them)
    add_to_chroma(chunks)


def load_documents(file_type: str):
    if file_type == 'pdf':
        document_loader = PyPDFDirectoryLoader(path=DATA_PATH, mode="single")
    elif file_type == 'text':
        document_loader = TextLoader(path=DATA_PATH)
    elif file_type == 'markdown':
        document_loader = UnstructuredMarkdownLoader(path=DATA_PATH, mode="single")
    return document_loader.load()


def create_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=80)
    return text_splitter.split_documents(documents)


def add_to_chroma(chunks: list[Document]):
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    chunks_with_ids = calculate_chunk_ids(chunks)

    existing_items = db.get(include=[])
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing documents in DB: {len(existing_ids)}")

    new_chunks = [chunk for chunk in chunks_with_ids if chunk.metadata["id"] not in existing_ids]

    if new_chunks:
        print(f"👉 Adding new documents: {len(new_chunks)}")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
    else:
        print("✅ No new documents to add")


def calculate_chunk_ids(chunks):
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id
        chunk.metadata["id"] = chunk_id

    return chunks


def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)


if __name__ == "__main__":
    main()