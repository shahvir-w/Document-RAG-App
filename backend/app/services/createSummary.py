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

def get_user_data_path(user_id: str) -> str:
    """Get the path for user's data directory"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "data", user_id)

def create_title(summary: str):
    prompt = f"""
    Give me the title of the following text as output. Do not include any markdown formatting, just a string.

    For example, if the text is:
    "# Heading: The Intricacies of AI. ## Subheading: Understanding the Basics....."
    Your output should be "Understanding Intricacies of AI".

    text:
    {summary}
    """
    title = llm.invoke(prompt)
    return title.content

def create_documents(documents: list[Document], chunk_size=10000, chunk_overlap=500):
    """Split documents into chunks for summarization."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_documents(documents)

def create_document_summary(file_type: str, user_id: str):
    """Create a summarized version of the documents."""
    print(f"Creating document summary for {file_type}")
    try:
        data_path = get_user_data_path(user_id)
        documents = load_documents(file_type, data_path)
        print(f"Loaded {len(documents)} documents")
        
        if not documents:
            return "No documents found to summarize."
        
        num_tokens_total = llm.get_num_tokens(documents[0].page_content)
        print(f"Total document size: {num_tokens_total} tokens")
        
        # Check document size - use the same limit as createChroma.py
        if num_tokens_total > 100000:
            raise ValueError("Document is too large to process")
            
        
        if num_tokens_total < 15000:
            prompt = f"""
            Write a comprehensive and detailed summary of the following text delimited by triple backquotes.
            The summary should be comprehensive and separated into sections/subsections (compartments). It should be in markdown format.
            Main compartments should have a #heading. Subcompartments should have a ##heading. Do not include ###heading. Only # and ## for headings, - for lists, and ** for bold text. 
            Do not say that this is a summary. Do not include a title. Only the compartments. Example output structure:

            # Abstract 
            This document presents a detailed examination of a meta-analysis article published in the Iranian Journal of Public Health, which investigates the efficacy and side effects of two antiepileptic drugs: levetiracetam (LEV) and carbamazepine (CBZ). 
            The study aims to provide insights into the treatment of epilepsy, a condition affecting millions worldwide.
            
            # Background on Epilepsy
            - **Prevalence**: Epilepsy is a common neurological disorder, with an estimated 70 million individuals affected globally. The incidence varies significantly between high-income and low- to middle-income countries.
            - **Treatment Gap**: Approximately 85% of patients with epilepsy do not receive adequate treatment, despite many having forms of the condition that are manageable with medication.

            # Drugs Compared
            ## Levetiracetam
            A widely used antiepileptic drug known for its effectiveness in controlling seizures.
            ## Carbamazepine
            Another commonly prescribed antiepileptic medication with a similar mechanism of action.

            Here is the text to compartmentalize.:
            ```{documents[0].page_content}```
            """
            summary = llm.invoke(prompt)
            return summary.content

        chunk_size = num_tokens_total // 1 # creates 4 chunks for the summary
        chunk_overlap = chunk_size // 10
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
        Give a fundemntal overview of the following text:
        "{text}":
        """
        map_prompt_template = PromptTemplate(template=map_prompt, input_variables=["text"])
    
        combine_prompt = """
        Write a comprehensive and detailed summary of the following text delimited by triple backquotes.
        The summary should be comprehensive and separated into sections/subsections (compartments). It should be in markdown format.
        Main compartments should have a #heading. Subcompartments should have a ##heading. Do not include ###heading. Only # and ## for headings, - for lists, and ** for bold text. 
        Do not say that this is a summary. Do not include a title. Only the compartments. Example output structure:

        # Abstract 
        This document presents a detailed examination of a meta-analysis article published in the Iranian Journal of Public Health, which investigates the efficacy and side effects of two antiepileptic drugs: levetiracetam (LEV) and carbamazepine (CBZ). 
        The study aims to provide insights into the treatment of epilepsy, a condition affecting millions worldwide.
        
        # Background on Epilepsy
        - **Prevalence**: Epilepsy is a common neurological disorder, with an estimated 70 million individuals affected globally. The incidence varies significantly between high-income and low- to middle-income countries.
        - **Treatment Gap**: Approximately 85% of patients with epilepsy do not receive adequate treatment, despite many having forms of the condition that are manageable with medication.

        # Drugs Compared
        ## Levetiracetam
        A widely used antiepileptic drug known for its effectiveness in controlling seizures.
        ## Carbamazepine
        Another commonly prescribed antiepileptic medication with a similar mechanism of action.

        Here is the text to compartmentalize.:
        ```{text}```
        
        COMPARTMENTS:
        """
        combine_prompt_template = PromptTemplate(template=combine_prompt, input_variables=["text"])
    
        # Create and run summary chain
        summary_chain = load_summarize_chain(
            llm=llm, 
            chain_type='map_reduce',
            verbose=False,
            map_prompt=map_prompt_template,
            combine_prompt=combine_prompt_template,
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
        summary = create_document_summary('txt', 'test_user')
        print("\nSummary:")
        print(summary)
    except Exception as e:
        print(f"Error in main function: {e}")

if __name__ == "__main__":
    main()