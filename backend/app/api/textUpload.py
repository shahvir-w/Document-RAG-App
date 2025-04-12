from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
import redis
import json
from ..tasks.chroma_tasks import create_chroma_db, create_document_summary

router = APIRouter()
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

class TextRequest(BaseModel):
    content: str
    userId: str

@router.post("/upload-text")
async def upload_text(request: TextRequest):
    try:
        document_id = str(uuid.uuid4())
        task_id = str(uuid.uuid4())
        
        # Use the content string directly
        content = request.content
        
        # Trigger Celery tasks with in-memory content
        create_chroma_db.apply_async(args=[content, "txt", task_id, request.userId])
        create_document_summary.apply_async(args=[content, "txt", task_id, request.userId])

        return {
            "documentId": document_id,
            "userId": request.userId,
            "filename": f"{document_id}_text.txt",
            "taskId": task_id,
        }
    except Exception as e:
        redis_client.publish(f"progress_channel:{task_id}", 
            json.dumps({"status": "error", "message": str(e)}))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/{task_id}")
async def get_progress(task_id: str):
    """
    SSE endpoint that streams progress updates to the frontend.
    """
    def event_stream():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"progress_channel:{task_id}")
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                
                yield f"data: {message['data'].decode()}\n\n"

    return StreamingResponse(event_stream(), media_type='text/event-stream')
