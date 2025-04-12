import chromadb
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from app.config import embeddings, llm

chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def query_chroma(question: str, user_id: str):
    """Query the user's Chroma database with a question."""
    try:
        collection_name = f"user_{user_id}_docs"
        
        try:
            collection = chroma_client.get_collection(name=collection_name)
        except Exception:
            return {
                "answer": "Sorry, your session has expired or no documents were found. Please upload a new document.",
                "sources": []
            }

        
        db = Chroma(
            client=chroma_client,
            collection_name=collection_name,
            embedding_function=embeddings
        )

        retriever = db.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 3, "fetch_k": 10, "lambda_mult": 0.7}
        )

        
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

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

        result = qa_chain({"query": question})

        sources = []
        seen = set()
        for doc in result.get("source_documents", []):
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })

        return {
            "answer": result["result"],
            "sources": sources
        }

    except Exception as e:
        print(f"Error querying Chroma: {str(e)}")
        return {
            "answer": "I encountered an error while searching for information. Please try rephrasing your question.",
            "sources": []
        }
