from __future__ import annotations

from app.core.celery import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, to: str, subject: str, body: str) -> str:
    import asyncio

    from app.infrastructure.services.email_service import SMTPEmailService

    service = SMTPEmailService()
    asyncio.run(service.send_email(to, subject, body))
    return f"Email sent to {to}"


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email_task(self, to: str, token: str) -> str:
    import asyncio

    from app.infrastructure.services.email_service import SMTPEmailService

    service = SMTPEmailService()
    asyncio.run(service.send_verification(to, token))
    return f"Verification email sent to {to}"


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_booking_confirmation_task(self, to: str, booking_id: str) -> str:
    import asyncio

    from app.infrastructure.services.email_service import SMTPEmailService

    service = SMTPEmailService()
    asyncio.run(service.send_booking_confirmation(to, booking_id))
    return f"Booking confirmation sent to {to} for booking {booking_id}"
