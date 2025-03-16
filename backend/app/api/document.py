from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
import os
from app.tasks import create_chroma_db, create_document_summary
import shutil
import redis

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data")
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)

    documentId = str(uuid.uuid4())
    
    # Define the file path where the file will be saved
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_location = os.path.join(base_dir, "../data", f"{documentId}_{file.filename}")
    os.makedirs(os.path.dirname(file_location), exist_ok=True)

    content_type = file.filename.split(".")[1]

    # Save the uploaded file
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    # Generate a unique task_id for tracking progress
    task_id = str(uuid.uuid4())

    # Trigger Celery tasks for Chroma DB and Summary creation
    chroma_db_task = create_chroma_db.apply_async(args=[file.filename, content_type, task_id])
    summary_task = create_document_summary.apply_async(args=[file.filename, content_type, task_id])

    # Return a success response with task_ids
    return {
        "documentId": documentId,
        "filename": file.filename,
        "taskId": task_id,
    }


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



class TextRequest(BaseModel):
    content: str

@router.post("/upload-text")
async def upload_text(request: TextRequest):
    document_id = str(uuid.uuid4())
    print(request.content)
    return {"documentId": document_id, "content": request.content}