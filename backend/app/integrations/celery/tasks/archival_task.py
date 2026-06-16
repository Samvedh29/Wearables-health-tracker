"""Daily data archival and retention Celery task.

Runs once per day (via beat schedule) to:
1. Aggregate live data_point_series rows older than archive_after_days into daily archive.
2. Delete archive rows older than delete_after_days.

Both thresholds are configured by the admin via archival_settings.
If both are NULL, the task is a no-op.
"""

from logging import getLogger



from app.database import SessionLocal
from app.services.archival_service import archival_service

logger = getLogger(__name__)



def run_daily_archival() -> dict:
    """Execute the daily archival + retention job.

    The service internally limits batch size and wall time so this task
    is safe for first-run scenarios with millions of rows. If not all rows
    are processed, the next scheduled invocation continues automatically.
    """
    with SessionLocal() as db:
        try:
            summary = archival_service.run_daily_archival(db)
            logger.info("Daily archival completed: %s", summary)
            return summary
        except Exception:
            logger.exception("Daily archival task failed")
            raise
