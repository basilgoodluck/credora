from celery import Celery

from worker.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "credit_quotient_worker",
    broker=settings.redis_url,
    backend=settings.redis_result_url,
    include=["worker.jobs.process_evidence", "worker.jobs.recompute_score"],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    result_expires=3600,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    timezone="UTC",
)
