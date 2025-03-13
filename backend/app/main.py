from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.document import router as document_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can restrict to specific domains instead of "*"
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


app.include_router(document_router, prefix="/document")

