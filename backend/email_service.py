import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

BREVO_URL = "https://api.brevo.com/v3/smtp/email"
logger = logging.getLogger(__name__)


class EmailServiceError(Exception):
    pass


def send_otp_email(to_email, name, otp):
    api_key = os.getenv("BREVO_API_KEY", "")
    if os.getenv("APP_ENV", "").lower() == "dev" and not api_key:
        print(f"Email verification code for {to_email}: {otp}")
        return

    sender_email = os.getenv("MAIL_SENDER_EMAIL", "")
    configured_sender_name = os.getenv("MAIL_SENDER_NAME", "")
    sender_name = configured_sender_name or "ChurnIQ"
    logger.info(
        "Brevo email configuration loaded: api_key=%s sender_email=%s sender_name=%s",
        bool(api_key),
        bool(sender_email),
        bool(configured_sender_name),
    )
    if not api_key or not sender_email:
        raise EmailServiceError("Brevo email settings are missing")
    if not api_key.startswith("xkeysib-"):
        logger.error(
            "Brevo email configuration error: BREVO_API_KEY is not a Brevo REST API key"
        )
        raise EmailServiceError(
            "BREVO_API_KEY must be a Brevo REST API key starting with xkeysib-"
        )

    payload = {
        "sender": {"email": sender_email, "name": sender_name},
        "to": [{"email": to_email, "name": name}],
        "subject": "Verify your ChurnIQ email",
        "htmlContent": (
            f"<p>Your ChurnIQ verification code is <strong>{otp}</strong>.</p>"
            "<p>It expires in 10 minutes. If you did not sign up, ignore this email.</p>"
        ),
    }
    try:
        response = requests.post(
            BREVO_URL,
            headers={"api-key": api_key, "Content-Type": "application/json"},
            json=payload,
            timeout=10,
        )
        if not response.ok:
            logger.error(
                "Brevo email request failed: status=%s body=%s",
                response.status_code,
                response.text,
            )
            response.raise_for_status()
    except requests.RequestException as exc:
        if exc.response is None:
            logger.error("Brevo email request failed before receiving a response: %s", exc)
        raise EmailServiceError("Brevo could not send the email") from exc
