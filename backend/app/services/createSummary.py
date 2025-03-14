import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate
from app.services.createChroma import load_documents

load_dotenv()


api_key = os.environ.get('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set or is empty")

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini") 

CHROMA_PATH = "app/chromaSummary"
DATA_PATH = "app/data"

def determine_optimal_chunk_size(documents):
    """
    Determine optimal chunk size based on document size.
    """
    try:
        # Get the total content of all documents
        combined_content = ""
        for doc in documents:
            combined_content += doc.page_content
            
        # Get token count of the combined content
        num_tokens_total = llm.get_num_tokens(combined_content)
        print(f"Total document size: {num_tokens_total} tokens")
        
        chunk_size = num_tokens_total // 2
        chunk_overlap = chunk_size // 10
        return chunk_size, chunk_overlap
    
    except Exception as e:
        print(f"Error determining optimal chunk size: {e}")
        # Return default values if there's an error
        return 2000, 200

def create_documents(documents: list[Document], chunk_size=10000, chunk_overlap=500):
    """Split documents into chunks for summarization."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_documents(documents)

def create_document_summary(file_type='pdf'):
    """
    Create a summarized version of the documents.
    """
    try:
        # Load documents
        documents = load_documents(file_type)
        print(f"Loaded {len(documents)} documents")
        
        if not documents:
            return "No documents found to summarize."
        
        # Determine optimal chunk size
        chunk_size, chunk_overlap = determine_optimal_chunk_size(documents)
        print(f"Using chunk size: {chunk_size}, chunk overlap: {chunk_overlap}")
        
        # Split documents into chunks
        docs = create_documents(documents, chunk_size, chunk_overlap)
        print(f"Split into {len(docs)} chunks")
        
        # Get token count of first document
        if docs:
            first_doc_tokens = llm.get_num_tokens(docs[0].page_content)
            print(f"First chunk token count: ~{first_doc_tokens}")
        
        # Create prompts
        map_prompt = """
        Write a quicky with key points summary of the following:
        "{text}"
        CONCISE SUMMARY:
        """
        map_prompt_template = PromptTemplate(template=map_prompt, input_variables=["text"])
    
        combine_prompt = """
        Write a comprehensive and detailed summary of the following text delimited by triple backquotes.
        The summary should be comprehensive and separated into sections/subsections (compartments).
        ```{text}```
        COMPARTMENTS:
        """
        combine_prompt_template = PromptTemplate(template=combine_prompt, input_variables=["text"])
    
        # Create and run summary chain
        summary_chain = load_summarize_chain(
            llm=llm, 
            chain_type='map_reduce',
            verbose=True,
            map_prompt=map_prompt_template,
            combine_prompt=combine_prompt_template
        )
    
        # Use invoke instead of run (which is deprecated)
        output = summary_chain.invoke(docs)
        
        # Check if the output is a dictionary (newer versions of langchain)
        if isinstance(output, dict):
            return output.get("output_text", str(output))
        return output
        
    except Exception as e:
        print(f"Error creating document summary: {e}")
        return f"Error creating summary: {str(e)}"

def main():
    try:
        summary = create_document_summary()
        print("\nSummary:")
        print(summary)
    except Exception as e:
        print(f"Error in main function: {e}")

if __name__ == "__main__":
    main()