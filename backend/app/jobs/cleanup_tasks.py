import os
import shutil
from datetime import datetime, timedelta
from .celery_config import celery_app

@celery_app.task(name='app.tasks.cleanup_tasks.schedule_user_cleanup')
def schedule_user_cleanup(user_id: str):
    """Schedule cleanup for a user's data after 15 minutes"""
    cleanup_user_data.apply_async(
        args=[user_id],
        countdown=900  # 15 minutes in seconds (15 * 60 = 900)
    )

@celery_app.task(name='app.tasks.cleanup_tasks.cleanup_user_data')
def cleanup_user_data(user_id: str):
    """Clean up a specific user's data"""
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        print(base_dir)
        # Clean up data directory
        data_path = os.path.join(base_dir, "data", user_id)
        if os.path.exists(data_path):
            shutil.rmtree(data_path)
            print(f"Cleaned up data directory for user: {user_id}")

        # Clean up chroma directory
        chroma_path = os.path.join(base_dir, "chroma", user_id)
        if os.path.exists(chroma_path):
            shutil.rmtree(chroma_path)
            print(f"Cleaned up chroma directory for user: {user_id}")

        return f"Successfully cleaned up data for user: {user_id}"
    except Exception as e:
        print(f"Error cleaning up user data: {str(e)}")
        raise Exception(f"Failed to clean up user data: {str(e)}")

@celery_app.task(name='app.tasks.cleanup_tasks.cleanup_expired_users')
def cleanup_expired_users():
    """Periodic task to clean up any missed user data (runs every 5 minutes)"""
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        current_time = datetime.now()

        # Check both data and chroma directories
        for directory in ['data', 'chroma']:
            dir_path = os.path.join(base_dir, directory)
            if os.path.exists(dir_path):
                for user_id in os.listdir(dir_path):
                    user_path = os.path.join(dir_path, user_id)
                    if os.path.isdir(user_path):
                        created_time = datetime.fromtimestamp(os.path.getctime(user_path))
                        # Check if directory is older than 15 minutes
                        if current_time - created_time > timedelta(minutes=15):
                            print(f"Found expired user directory: {user_id}")
                            cleanup_user_data.delay(user_id)

        return "Cleanup check completed"
    except Exception as e:
        print(f"Error in cleanup check: {str(e)}")
        raise Exception(f"Failed to check for expired users: {str(e)}") 