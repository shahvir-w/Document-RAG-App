from fastapi import FastAPI
from app.api.document import router as document_router

app = FastAPI()

app.include_router(document_router, prefix="/document")

