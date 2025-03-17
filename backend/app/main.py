from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.document import router as document_router
from app.api.text import router as text_router
from app.api.chat import router as chat_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can restrict to specific domains instead of "*"
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


app.include_router(document_router, prefix="/document")
app.include_router(text_router, prefix="/text")
app.include_router(chat_router, prefix="/chat")

