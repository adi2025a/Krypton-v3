"""
Sends OTP emails via SMTP. smtplib is blocking/sync, so we run it in a
thread pool (asyncio.to_thread) to avoid blocking FastAPI's event loop.
"""

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_email_sync(to_email: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email
    msg.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)


async def send_otp_email(to_email: str, otp: str) -> None:
    subject = "Your verification code"
    body = f"Your OTP is: {otp}\nIt expires in {settings.OTP_EXPIRE_MINUTES} minutes."
    try:
        await asyncio.to_thread(_send_email_sync, to_email, subject, body)
        logger.info(f"Successfully sent OTP email to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        logger.warning(f"[FALLBACK LOG] Verification OTP for {to_email} is: {otp}")