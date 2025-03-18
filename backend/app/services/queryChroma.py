import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini")

def get_user_chroma_path(user_id: str) -> str:
    """Get the path for user's chroma directory"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "chroma", user_id)

def query_chroma(question: str, user_id: str):
    """Query the user's Chroma database with a question"""
    try:
        chroma_path = get_user_chroma_path(user_id)
        
        # Check if the user's Chroma directory exists
        if not os.path.exists(chroma_path):
            return {
                "answer": "Sorry, your session has expired. Please upload a new document.",
                "sources": []
            }
        
        # Load the Chroma database
        db = Chroma(persist_directory=chroma_path, embedding_function=embeddings)
        retriever = db.as_retriever(
            search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.6}
        )
        
        # Create a custom prompt template
        template = """
        You are an AI assistant helping with document questions.
        Use the following context to answer the question. If you don't know the answer, say you don't know.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer the question based only on the provided context. Be concise and accurate. Start your answer with based on source...
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )
        
        # Create the QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )
        
        # Get the answer
        result = qa_chain({"query": question})
        
        # Extract source information
        sources = []
        for doc in result.get("source_documents", []):
            source_info = {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            sources.append(source_info)
        
        return {
            "answer": result["result"],
            "sources": sources
        }
        
    except Exception as e:
        print(f"Error querying Chroma: {str(e)}")
        return {
            "answer": f"Sorry, an error occurred: {str(e)}",
            "sources": []
        }
