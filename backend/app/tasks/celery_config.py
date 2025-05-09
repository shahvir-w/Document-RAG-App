from celery import Celery

celery_app = Celery(
    "document_processor",
    broker="redis://localhost:6379/0",
)

celery_app.conf.update(
    result_backend="redis://localhost:6379/0",
    task_time_limit=600,  # 10 minutes
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
) 