from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
import uuid
import redis
import json
from ..tasks.chroma_tasks import create_chroma_db, create_document_summary
from slowapi import Limiter
from slowapi.util import get_remote_address

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/upload")
@limiter.limit("10/hour")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    userId: str = Form(...),
):
    try:
        document_id = str(uuid.uuid4())
        task_id = str(uuid.uuid4())

        # Read the file content into memory
        content = await file.read()

        content_type = file.filename.split(".")[-1].lower()
        if content_type not in ['txt', 'md', 'pdf']:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Trigger Celery tasks with in-memory content
        create_chroma_db.apply_async(args=[content, content_type, task_id, userId])
        create_document_summary.apply_async(args=[content, content_type, task_id, userId])

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
