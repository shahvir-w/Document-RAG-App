from fastapi import APIRouter, HTTPException
#from app.services.document_service import process_document

router = APIRouter()

@router.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    try:
        document_data = await file.read()
        #result = process_document(document_data)
        return {"message": "Document processed", "data": "result"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))