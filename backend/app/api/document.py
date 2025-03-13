from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import uuid
import os

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    documentId = str(uuid.uuid4())
    
    # Define the file path where the file will be saved
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_location = os.path.join(base_dir, "../data", f"{documentId}_{file.filename}")
    os.makedirs(os.path.dirname(file_location), exist_ok=True)

    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    # Return a success response (you can return additional info like documentId)
    return {"documentId": documentId, "filename": file.filename}


class TextRequest(BaseModel):
    content: str

@router.post("/upload-text")
async def upload_text(request: TextRequest):
    document_id = str(uuid.uuid4())
    print(request.content)
    return {"documentId": document_id, "content": request.content}