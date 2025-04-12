from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from ..tasks.chroma_tasks import query_chroma
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ChatRequest(BaseModel):
    question: str
    userId: str
    
@router.post("/get-response")
@limiter.limit("30/hour")
async def get_response(request: Request, chat_request: ChatRequest):
    try:
        if not chat_request.userId:
            return {"response": "Unable to process request", "sources": []}
        
        result = query_chroma(chat_request.question, chat_request.userId)

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