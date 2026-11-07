from __future__ import annotations

from app.core.config import settings
from app.domain.interfaces.services.email_service import EmailService


class SMTPEmailService(EmailService):
    async def send_email(self, to: str, subject: str, body: str) -> None:
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            print(f"[EMAIL] Would send to {to}: {subject}")
            return

        import smtplib
        from email.mime.text import MIMEText

        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL or ""
        msg["To"] = to

        smtp_host = settings.SMTP_HOST or ""
        smtp_user = settings.SMTP_USER or ""
        smtp_password = settings.SMTP_PASSWORD or ""

        with smtplib.SMTP(smtp_host, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

    async def send_verification(self, to: str, token: str) -> None:
        link = f"{settings.API_PREFIX}/auth/verify?token={token}"
        body = f"<p>Verify your email: <a href='{link}'>{link}</a></p>"
        await self.send_email(to, "Verify your email", body)

    async def send_password_reset(self, to: str, token: str) -> None:
        link = f"{settings.API_PREFIX}/auth/reset-password?token={token}"
        body = f"<p>Reset your password: <a href='{link}'>{link}</a></p>"
        await self.send_email(to, "Reset your password", body)

    async def send_booking_confirmation(self, to: str, booking_id: str) -> None:
        body = f"<p>Your booking {booking_id} is confirmed.</p>"
        await self.send_email(to, "Booking Confirmed", body)
