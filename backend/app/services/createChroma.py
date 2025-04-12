import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
import chromadb
from app.config import embeddings, llm

chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def get_user_paths(user_id: str) -> tuple[str, str]:
    """Get the paths for user's data directory"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", user_id)
    return data_path, None

def create_chroma_db(file_type: str, user_id: str):
    """Create a Chroma database from document files."""
    data_path, _ = get_user_paths(user_id)
    
    try:
        documents = load_documents(file_type, data_path)
        if not documents:
            raise ValueError("No documents found to process")
        
        # Check document size
        num_tokens_total = llm.get_num_tokens(documents[0].page_content)
        if num_tokens_total > 100000:
            raise ValueError("Document is too large to process")
        
        chunks = split_documents(documents, 500, 150)
        add_to_chroma(chunks, user_id)

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

def split_documents(documents: list[Document], chunk_size=500, chunk_overlap=150):
    """Split documents into smaller chunks with more overlap."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def clean_metadata(meta):
    """Sanitize metadata dict to avoid ChromaDB API issues."""
    return {
        k: (str(v) if v is not None and not isinstance(v, (str, int, float, bool)) else v)
        for k, v in meta.items()
        if k != "_type"
    }

def add_to_chroma(chunks: list[Document], user_id: str):
    """Add document chunks to user's Chroma database using native ChromaDB API."""
    collection_name = f"user_{user_id}_docs"
    
    try:
        try:
            collection = chroma_client.get_collection(name=collection_name)
            print(f"Using existing collection: {collection_name}")
        except Exception as e:
            print(f"Creating new collection: {collection_name}")
            collection = chroma_client.create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        
        chunk_ids, chunk_texts, chunk_metadatas = [], [], []

        for chunk in chunks:
            source = chunk.metadata.get("source", "unknown")
            page = chunk.metadata.get("page", "0")
            chunk_id = f"{user_id}_{source.replace('/', '_')}_{page}_{len(chunk_texts)}"
            chunk_text = chunk.page_content
            metadata = clean_metadata(chunk.metadata)
            chunk_ids.append(chunk_id)
            chunk_texts.append(chunk_text)
            chunk_metadatas.append(metadata)

        if not chunk_texts:
            print("No chunks to add to ChromaDB")
            return 0

        try:
            existing_ids = collection.get()["ids"]
        except:
            existing_ids = []

        new_chunk_indices = [i for i, id in enumerate(chunk_ids) if id not in existing_ids]

        if not new_chunk_indices:
            print("All chunks already exist in the collection")
            return 0

        new_ids = [chunk_ids[i] for i in new_chunk_indices]
        new_texts = [chunk_texts[i] for i in new_chunk_indices]
        new_metadatas = [chunk_metadatas[i] for i in new_chunk_indices]

        # 👉🏽 Embed using OpenAI embeddings directly here
        new_embeddings = embeddings.embed_documents(new_texts)

        print(f"Adding {len(new_ids)} new chunks to ChromaDB")
        collection.add(
            documents=new_texts,
            metadatas=new_metadatas,
            ids=new_ids,
            embeddings=new_embeddings  # 👈🏽 Pass this!
        )
        
        return len(new_ids)

    except Exception as e:
        print(f"Error in add_to_chroma: {str(e)}")
        raise Exception(f"Failed to add documents to ChromaDB: {str(e)}")
