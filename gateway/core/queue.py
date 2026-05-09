from celery import Celery

from gateway.core.config import get_settings


def get_celery() -> Celery:
    settings = get_settings()
    app = Celery("credit_quotient_gateway", broker=settings.redis_url, backend=settings.redis_result_url)
    app.conf.update(task_serializer="json", accept_content=["json"], result_serializer="json")
    return app


def enqueue_process_evidence(evidence_id: str, job_id: str) -> str:
    return get_celery().send_task("worker.jobs.process_evidence.process_evidence", args=[evidence_id, job_id]).id


def enqueue_recompute_score(user_id: str, job_id: str | None = None, countdown: int = 45) -> str:
    return get_celery().send_task("worker.jobs.recompute_score.recompute_score", args=[user_id, job_id], countdown=countdown).id
