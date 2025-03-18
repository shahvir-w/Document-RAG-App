import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

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
        
        db = Chroma(
            persist_directory=chroma_path, 
            embedding_function=embeddings,
            collection_metadata={"hnsw:space": "cosine"}  
        )
        
        # MMR search
        retriever = db.as_retriever(
            search_type="mmr", 
            search_kwargs={
                "k": 3, 
                "fetch_k": 10, 
                "lambda_mult": 0.7  
            }
        )
        
        # Create a custom prompt template with improved instructions
        template = """
        You are an AI assistant answering questions about specific documents.
        
        Answer the user's question based ONLY on the following context. If the context doesn't contain the information needed to answer the question, say "I don't have enough information in the document to answer this question." DO NOT make up or infer information not present in the context.
        
        Context:
        {context}
        
        Question: {question}
        
        The Question may not be spelled correctly so infer to the correct spelling.
        Answer in a clear, direct manner. If quoting from the document, make it clear which part you're referencing. Only include information relevant to the question.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )
        
        # Create the QA chain with improved parameters
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff", 
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={
                "prompt": prompt,
                "verbose": True  
            }
        )
        
        # Get the answer
        result = qa_chain({"query": question})
        
        # Extract source information and deduplicate
        sources = []
        seen_contents = set()
        
        for doc in result.get("source_documents", []):
            # Skip duplicate content
            if doc.page_content in seen_contents:
                continue
                
            seen_contents.add(doc.page_content)
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
            "answer": f"I encountered an error while searching for information. Please try rephrasing your question.",
            "sources": []
        }
