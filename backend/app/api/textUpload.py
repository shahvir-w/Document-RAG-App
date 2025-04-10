from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
import os
from ..tasks.chroma_tasks import create_chroma_db, create_document_summary
import redis
import json
from .documentUpload import ensure_user_directories

router = APIRouter()
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

class TextRequest(BaseModel):
    content: str
    userId: str

@router.post("/upload-text")
async def upload_text(request: TextRequest):
    try:
        # Setup user directories
        user_data_dir, user_chroma_dir = ensure_user_directories(request.userId)
        
        document_id = str(uuid.uuid4())
        task_id = str(uuid.uuid4())
        
        # Create filename and save content
        filename = f"{document_id}_text.txt"
        file_location = os.path.join(user_data_dir, filename)
        
        with open(file_location, "w", encoding='utf-8') as f:
            f.write(request.content)

        # Trigger Celery tasks
        create_chroma_db.apply_async(args=[filename, "txt", task_id, request.userId])
        create_document_summary.apply_async(args=[filename, "txt", task_id, request.userId])

        return {
            "documentId": document_id,
            "userId": request.userId,
            "filename": filename,
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
