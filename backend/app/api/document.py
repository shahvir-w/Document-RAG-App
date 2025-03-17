from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
import os
from ..tasks.chroma_tasks import create_chroma_db, create_document_summary
from ..tasks.cleanup_tasks import schedule_user_cleanup
import redis
import json

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
router = APIRouter()

def ensure_user_directories(user_id: str) -> tuple[str, str]:
    """Create and return paths for user's data and chroma directories"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create user-specific data directory
    user_data_dir = os.path.join(base_dir, "../data", user_id)
    if os.path.exists(user_data_dir):
        # Clean up old user files but keep the directory
        for file in os.listdir(user_data_dir):
            os.remove(os.path.join(user_data_dir, file))
    else:
        os.makedirs(user_data_dir, exist_ok=True)
    
    # Create user-specific chroma directory
    user_chroma_dir = os.path.join(base_dir, "../chroma", user_id)
    os.makedirs(user_chroma_dir, exist_ok=True)
    
    return user_data_dir, user_chroma_dir

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    userId: str = Form(...)
):
    try:
        # Setup user directories
        user_data_dir, user_chroma_dir = ensure_user_directories(userId)
        
        document_id = str(uuid.uuid4())
        task_id = str(uuid.uuid4())
        
        # Save the uploaded file
        file_location = os.path.join(user_data_dir, f"{document_id}_{file.filename}")
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        content_type = file.filename.split(".")[-1].lower()
        if content_type not in ['txt', 'md', 'pdf']:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Schedule cleanup for this user's data
        schedule_user_cleanup.delay(userId)

        # Trigger Celery tasks
        create_chroma_db.apply_async(args=[file.filename, content_type, task_id, userId])
        create_document_summary.apply_async(args=[file.filename, content_type, task_id, userId])

        return {
            "documentId": document_id,
            "userId": userId,
            "filename": file.filename,
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


