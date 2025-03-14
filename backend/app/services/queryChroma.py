from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set OpenAI API key
api_key = os.environ['OPENAI_API_KEY']
CHROMA_PATH = "app/chroma"
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini", openai_api_key=api_key)
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# Define prompt template
PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_chroma(query_text: str, k=5):
    """
    Query the Chroma database and return an answer.
    
    Args:
        query_text (str): The query text
        k (int): Number of results to retrieve
        
    Returns:
        dict: Response with answer and sources
    """
    # Prepare the DB
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    
    # Search the DB
    results = db.similarity_search_with_score(query_text, k=k)
    
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    
    response_text = llm.predict(prompt)
    
    sources = [doc.metadata.get("id", None) for doc, _score in results]
    
    return {
        "response": response_text,
        "sources": sources
    }
