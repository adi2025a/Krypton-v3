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


import socket

class _IPv4SMTP(smtplib.SMTP):
    """
    Subclass smtplib.SMTP to force IPv4 (AF_INET) socket resolution.
    Cloud environments like Render often lack outbound IPv6 routing,
    causing [Errno 101] Network is unreachable when DNS returns IPv6 addresses first.
    """
    def _get_socket(self, host, port, timeout):
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        last_err = None
        for family, type_, proto, canonname, sockaddr in infos:
            try:
                s = socket.socket(family, type_, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sockaddr)
                return s
            except Exception as e:
                last_err = e
                s.close()
        if last_err:
            raise last_err
        raise OSError(f"Could not connect to {host}:{port} via IPv4")


class _IPv4SMTP_SSL(smtplib.SMTP_SSL):
    """Subclass smtplib.SMTP_SSL to force IPv4 (AF_INET) socket resolution."""
    def _get_socket(self, host, port, timeout):
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        last_err = None
        for family, type_, proto, canonname, sockaddr in infos:
            try:
                s = socket.socket(family, type_, proto)
                if timeout is not None:
                    s.settimeout(timeout)
                s.connect(sockaddr)
                return self.context.wrap_socket(s, server_hostname=self._host)
            except Exception as e:
                last_err = e
                s.close()
        if last_err:
            raise last_err
        raise OSError(f"Could not connect to {host}:{port} via IPv4 SSL")


def _send_email_sync(to_email: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email
    msg.set_content(body)

    if settings.SMTP_PORT == 465:
        with _IPv4SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with _IPv4SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
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