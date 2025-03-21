from celery import Celery
from celery.schedules import crontab

# Create a single Celery instance for all tasks
celery_app = Celery(
    "document_processor",
    broker="redis://localhost:6379/0",
)

# Basic configuration
celery_app.conf.update(
    result_backend="redis://localhost:6379/0",
    task_time_limit=600,  # 10 minutes
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Beat schedule configuration
celery_app.conf.beat_schedule = {
    'cleanup-expired-users': {
        'task': 'app.tasks.cleanup_tasks.cleanup_expired_users',
        'schedule': crontab(minute='*/15'),  # Run every 15 minutes
    },
} 