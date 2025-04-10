from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..tasks.chroma_tasks import query_chroma

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    userId: str
    
@router.post("/get-response")
async def get_response(request: ChatRequest):
    try:
        if not request.userId:
            return {"response": "Unable to process request", "sources": []}
        
        result = query_chroma(request.question, request.userId)

        if result["answer"] == "I don't have enough information in the document to answer this question.":
            sources = []
        else:
            sources = result["sources"]

        return {
            "response": result["answer"],
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))