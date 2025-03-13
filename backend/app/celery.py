from celery import Celery

# Create a Celery instance
celery = Celery(
    "tasks",  # Name of the app
    broker="redis://localhost:6379/0",  # Redis URL for message broker
)

# Set the backend to store results (optional)
celery.conf.result_backend = "redis://localhost:6379/0"

    # Optional: Add task time limit (e.g., 10 minutes)
celery.conf.task_time_limit = 120  # 2 minutes
