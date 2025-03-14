import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate

load_dotenv()

api_key = os.environ['OPENAI_API_KEY']
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini", openai_api_key=api_key)

CHROMA_PATH = "app/chromaSummary"
DATA_PATH = "app/data"


def main():
    documents = load_documents('pdf')

    print("Number of documents: ", len(documents))

    # Split documents into chunks
    docs = create_documents(documents)
    num_docs = len(docs)

    num_tokens_first_doc = llm.get_num_tokens(docs[0].page_content)

    print (f"Now we have {num_docs} documents and the first one has {num_tokens_first_doc} tokens")

    summary_chain = load_summarize_chain(llm=llm, chain_type='map_reduce',
                                         verbose=False # Set verbose=True if you want to see the prompts being used
                                    )
    
    map_prompt = """
    Write a somewhat comprehensive summary of the following:
    "{text}"
    CONCISE SUMMARY:
    """
    map_prompt_template = PromptTemplate(template=map_prompt, input_variables=["text"])

    combine_prompt = """
    Write a comprehensive and detailed summary of the following text delimited by triple backquotes.
    The summary should be comprehensive and seperated into sections.
    ```{text}```
    SECTIONED SUMMARY:
    """
    combine_prompt_template = PromptTemplate(template=combine_prompt, input_variables=["text"])

    summary_chain = load_summarize_chain(llm=llm, chain_type='map_reduce',
                                         verbose=True,
                                         map_prompt=map_prompt_template,
                                         combine_prompt=combine_prompt_template
                                        )

    output = summary_chain.run(docs)
    print(output)
    


def load_documents(file_type: str):
    if file_type == 'pdf':
        document_loader = PyPDFDirectoryLoader(path=DATA_PATH, mode="single")
    elif file_type == 'text':
        document_loader = TextLoader(path=DATA_PATH)
    elif file_type == 'markdown':
        document_loader = UnstructuredMarkdownLoader(path=DATA_PATH, mode="single")
    return document_loader.load()


def create_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=500)
    return text_splitter.split_documents(documents)


if __name__ == "__main__":
    main()