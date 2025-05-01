import os
import io
import tempfile
from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
import chromadb
from app.config import embeddings, llm
from typing import Union, List, Optional

chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def create_chroma_db(file_type: str, user_id: str, content: Union[bytes, str]):
    """Create a Chroma database from document content in memory."""
    try:
        documents = load_document_from_memory(file_type, content)
        if not documents:
            raise ValueError("No documents found to process")
        
        # Combine all pages' content
        full_text = "\n\n".join(doc.page_content for doc in documents)
        
        # Check document size
        num_tokens_total = llm.get_num_tokens(full_text)
        if num_tokens_total > 100000:
            raise ValueError("Document is too large to process")
        
        chunks = split_documents(documents, 500, 150)
        add_to_chroma(chunks, user_id)

        return full_text
    except Exception as e:
        raise Exception(f"Error in create_chroma_db: {str(e)}")

def load_document_from_memory(file_type: str, content: Union[bytes, str]) -> list[Document]:
    """Load documents from in-memory content."""
    documents = []
    
    try:
        if file_type == 'pdf':
            # For PDFs: use a temporary file
            if isinstance(content, str):
                raise ValueError("PDF content must be provided as bytes")
                
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(content)
                temp_path = temp_file.name
            
            try:
                loader = PyPDFLoader(file_path=temp_path)
                documents = loader.load()
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
        elif file_type in ['txt', 'text']:
            # For text: create Document directly from the string content
            if isinstance(content, bytes):
                content = content.decode('utf-8')
                
            documents = [Document(page_content=content, metadata={"source": "text_upload"})]
            
        elif file_type in ['markdown', 'md']:
            # For markdown: create Document directly with the markdown content
            if isinstance(content, bytes):
                content = content.decode('utf-8')
                
            documents = [Document(page_content=content, metadata={"source": "markdown_upload"})]
            
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

        # Using OpenAI embeddings directly here
        new_embeddings = embeddings.embed_documents(new_texts)

        print(f"Adding {len(new_ids)} new chunks to ChromaDB")
        collection.add(
            documents=new_texts,
            metadatas=new_metadatas,
            ids=new_ids,
            embeddings=new_embeddings
        )
        
        return len(new_ids)

    except Exception as e:
        print(f"Error in add_to_chroma: {str(e)}")
        raise Exception(f"Failed to add documents to ChromaDB: {str(e)}")
