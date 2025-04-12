from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.documentUpload import router as document_router
from app.api.textUpload import router as text_router
from app.api.chat import router as chat_router
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

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

