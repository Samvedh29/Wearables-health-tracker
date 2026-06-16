"""Celery task for generating seed data via the dashboard."""

from logging import getLogger



from app.database import SessionLocal
from app.schemas.utils.seed_data import SeedDataRequest
from app.services.seed_data import seed_data_service

logger = getLogger(__name__)



def generate_seed_data(request_data: dict) -> dict:
    """Generate synthetic user data based on the provided profile configuration."""
    config = SeedDataRequest.model_validate(request_data)
    with SessionLocal() as db:
        try:
            summary = seed_data_service.generate(db, config)
            logger.info("Seed data generation completed: %s", summary)
            return summary
        except Exception:
            logger.exception("Seed data generation failed")
            raise
