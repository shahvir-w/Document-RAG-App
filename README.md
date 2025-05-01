# Document RAG Application

A modern document processing and retrieval application built with React, FastAPI, and ChromaDB. This application allows users to upload, process, and query documents using RAG (Retrieval-Augmented Generation).

## Features

- 📄 document upload and processing
- 📊 pdf and text view support
- 🎯 text highlighting and navigation
- 🔄 real-time document processing
- 💬 interactive chat interface
- 📝 document summarization (compartmentalization)

## Demo

https://github.com/shahvir-w/Document-RAG-App/blob/main/media/demo.mp4

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React PDF Viewer for PDF rendering

### Backend
- FastAPI (Python)
- ChromaDB for vector storage
- Celery for asynchronous task processing
- Redis for caching and message broker
- Docker for containerization

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Docker and Docker Compose
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shahvir-w/Document-RAG-App.git
cd Document-RAG-App
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Set up the backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

4. Start the services using Docker Compose:
```bash
docker-compose up -d
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

2. Start the Celery worker(s) for processing tasks:
```bash
# open new terminal window
cd backend
celery -A app.tasks.celery_config worker --loglevel=info -P gevent
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Project Structure

```
Document-RAG-App/
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── ...
│   ├── public/           # Static assets
│   └── ...
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── services/     # Chromadb and RAG services
│   │   ├── tasks/        # Celery tasks
│   │   └── ...
│   └── requirements.txt
├── chromadb/             # ChromaDB data storage
└── docker-compose.yml    # Docker services configuration
```

