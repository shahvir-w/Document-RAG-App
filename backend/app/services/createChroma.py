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

def get_user_paths(user_id: str) -> tuple[str, str]:
    """Get the paths for user's data and chroma directories"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", user_id)
    chroma_path = os.path.join(base_dir, "chroma", user_id)
    return data_path, chroma_path

def create_chroma_db(file_type: str, user_id: str):
    """Create a Chroma database from document files."""
    data_path, chroma_path = get_user_paths(user_id)
    
    try:
        documents = load_documents(file_type, data_path)
        if not documents:
            raise ValueError("No documents found to process")
            
        chunks = split_documents(documents, 800, 80)
        add_to_chroma(chunks, chroma_path)
        return documents[0].page_content
    except Exception as e:
        raise Exception(f"Error in create_chroma_db: {str(e)}")

def load_documents(file_type: str, data_path: str) -> list[Document]:
    """Load documents from the user's data directory."""
    documents = []
    
    try:
        if file_type == 'pdf':
            loader = PyPDFDirectoryLoader(path=data_path, mode="single")
            documents = loader.load()
        elif file_type in ['txt', 'text']:
            for filename in os.listdir(data_path):
                if filename.endswith('.txt'):
                    file_path = os.path.join(data_path, filename)
                    try:
                        loader = TextLoader(file_path=file_path, encoding='utf-8')
                        documents.extend(loader.load())
                    except Exception as e:
                        print(f"Failed to load {file_path}: {e}")
        elif file_type in ['markdown', 'md']:
            for filename in os.listdir(data_path):
                if filename.endswith(('.md', '.markdown')):
                    file_path = os.path.join(data_path, filename)
                    loader = UnstructuredMarkdownLoader(file_path)
                    documents.extend(loader.load())
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
            
        return documents
    except Exception as e:
        raise Exception(f"Error loading documents: {str(e)}")

def split_documents(documents: list[Document], chunk_size=800, chunk_overlap=80):
    """Split documents into smaller chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)

def add_to_chroma(chunks: list[Document], chroma_path: str):
    """Add document chunks to user's Chroma database."""
    db = Chroma(persist_directory=chroma_path, embedding_function=embeddings)
    
    chunks_with_ids = calculate_chunk_ids(chunks)
    existing_items = db.get(include=[])
    existing_ids = set(existing_items["ids"])
    
    new_chunks = [chunk for chunk in chunks_with_ids 
                 if chunk.metadata["id"] not in existing_ids]
    
    if new_chunks:
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
        return len(new_chunks)
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
