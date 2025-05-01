import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate
from typing import Union, List
from app.config import llm

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

def create_document_summary(file_type: str, content: Union[bytes, str]):
    """Create a summarized version of the document from in-memory content."""
    print(f"Creating document summary for {file_type}")
    try:
        # Import here to avoid circular imports
        from app.services.createChroma import load_document_from_memory
        
        # Use the common document loading function for all file types
        documents = load_document_from_memory(file_type, content)
        print(f"Loaded document")
        
        if not documents:
            return "No documents found to summarize."
        
        # Combine all pages' content
        full_text = "\n\n".join(doc.page_content for doc in documents)
        num_tokens_total = llm.get_num_tokens(full_text)
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
            ```{full_text}```
            """
            summary = llm.invoke(prompt)
            return summary.content

        chunk_size = num_tokens_total // 1 # creates 4 chunks for the summary
        chunk_overlap = chunk_size // 10
        print(f"Using chunk size: {chunk_size}, chunk overlap: {chunk_overlap}")
        
        # Create a single document with all content for chunking
        full_document = Document(page_content=full_text, metadata={"source": "full_document"})
        docs = create_documents([full_document], chunk_size, chunk_overlap)
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
