import redis
from celery import Celery
from app.services.createChroma import create_chroma_db as create_chroma_db_service
from app.services.createSummary import create_document_summary as create_document_summary_service
from app.services.createSummary import create_title
from app.testing import test_text, test_summary
import json

# Create a Celery instance
celery = Celery(
    "tasks",  # Name of the app
    broker="redis://localhost:6379/0",
)

# Set the backend to store results (optional)
celery.conf.result_backend = "redis://localhost:6379/0"

celery.conf.task_time_limit = 600 # 10 minutes

# Redis setup to communicate progress (for SSE or any other frontend mechanism)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

@celery.task
def create_chroma_db(file_name: str, file_type: str, task_id: str):
    """
    Task to create Chroma DB and notify frontend on progress
    """
    # Notify frontend about the splitting process
    redis_client.publish(f"progress_channel:{task_id}", "Splitting text into vectors...")

    try:
        # Call the service to create Chroma DB (splitting the document into vectors)
        text = create_chroma_db_service(file_type)
        #text = test_text
        # Notify frontend that the text splitting is done
        redis_client.publish(f"progress_channel:{task_id}", "Storing vectors...")
        
        text_message = {
            "status": "Storing vectors...",
            "text": text
        }
        redis_client.publish(f"progress_channel:{task_id}", json.dumps(text_message))


    except Exception as e:
        redis_client.publish(f"progress_channel:{task_id}", f"Error splitting text: {str(e)}")
        return f"Error in Chroma DB creation: {str(e)}"
    
    return f"Chroma DB created for file: {file_name}"


@celery.task
def create_document_summary(file_name: str, file_type: str, task_id: str):
    """
    Task to create document summary and notify frontend on progress
    """
    # Notify frontend about the summarization process
    redis_client.publish(f"progress_channel:{task_id}", "Creating compartments...")

    try:
        # Create summary for the document
        summary = create_document_summary_service(file_type)
        #summary = test_summary
        title = create_title(summary)

        # Send the summary along with the completion message
        completion_message = {
            "status": "Compartments created successfully!",
            "title": title,
            "summary": summary
        }
        redis_client.publish(f"progress_channel:{task_id}", json.dumps(completion_message))
        
        return f"Summary created successfully for file: {file_name}"
    except Exception as e:
        redis_client.publish(f"progress_channel:{task_id}", f"Error creating compartments: {str(e)}")
        return f"Error creating compartments: {str(e)}"
