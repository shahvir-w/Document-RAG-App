import redis
import json
from .celery_config import celery_app
from app.services.createChroma import create_chroma_db as create_chroma_db_service
from app.services.createSummary import create_document_summary as create_document_summary_service
from app.services.createSummary import create_title
from app.services.queryChroma import query_chroma as query_chroma_service

# Redis setup
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

@celery_app.task(bind=True, name='app.tasks.chroma_tasks.create_chroma_db')
def create_chroma_db(self, file_name: str, file_type: str, task_id: str, user_id: str):
    """Task to create Chroma DB and notify frontend on progress"""
    try:
        redis_client.publish(f"progress_channel:{task_id}", "Splitting text into vectors...")
        
        text = create_chroma_db_service(file_type, user_id)
        
        redis_client.publish(f"progress_channel:{task_id}", "Storing vectors...")
        text_message = {
            "status": "Storing vectors...",
            "text": text
        }
        redis_client.publish(f"progress_channel:{task_id}", json.dumps(text_message))
        return {"success": True, "text": text, "task_id": task_id}
    except Exception as e:
        error_message = str(e)
        
        # Check for specific error messages
        if "Document is too large to process" in error_message:
            error_message = "Document is too large to process."
        else:
            error_message = f"Error in Chroma DB creation: {error_message}"
            
        redis_client.publish(f"progress_channel:{task_id}", 
            json.dumps({"status": "error", "message": error_message}))
        self.request.chain = None
        raise Exception(error_message)

@celery_app.task(bind=True, name='app.tasks.chroma_tasks.create_document_summary')
def create_document_summary(self, file_name: str, file_type: str, task_id: str, user_id: str):
    """Task to create document summary and notify frontend on progress"""
    try:
        redis_client.publish(f"progress_channel:{task_id}", "Creating compartments...")
        
        summary = create_document_summary_service(file_type, user_id)
        title = create_title(summary)
        
        completion_message = {
            "status": "Compartments created successfully!",
            "title": title,
            "summary": summary
        }

        redis_client.publish(f"progress_channel:{task_id}", json.dumps(completion_message))
        return {"success": True, "summary": summary, "title": title}
    except Exception as e:
        error_message = str(e)
        
        # Use consistent error message formatting with create_chroma_db
        if "Document is too large to process" in error_message:
            error_message = "Document is too large to process."
        else:
            error_message = f"Error creating compartments: {error_message}"
            
        redis_client.publish(f"progress_channel:{task_id}", 
            json.dumps({"status": "error", "message": error_message}))
        self.request.chain = None
        raise Exception(error_message)
     
@celery_app.task(bind=True, name='app.tasks.chroma_tasks.query_chroma')
def query_chroma(self, question: str, user_id: str):
    """Task to query Chroma DB for document search"""
    try:
        response = query_chroma_service(question, user_id)
        return response
    except Exception as e:
        self.request.chain = None
        raise Exception(f"Error querying Chroma DB: {str(e)}")