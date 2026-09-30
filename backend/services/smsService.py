import os
from pathlib import Path

from dotenv import load_dotenv
from requests import RequestException
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def send_sms(phone_number: str, message: str) -> dict:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not from_number:
        return {
            "message": "SMS is not configured",
            "sent": False,
            "error": "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend/.env",
            "phone_number": phone_number,
            "sms_text": message,
        }

    try:
        sms = Client(account_sid, auth_token).messages.create(
            body=message,
            from_=from_number,
            to=phone_number,
        )
    except (RequestException, TwilioRestException) as exc:
        return {
            "message": "SMS could not be sent",
            "sent": False,
            "error": str(exc),
            "phone_number": phone_number,
            "sms_text": message,
        }

    return {
        "message": "SMS sent successfully",
        "sent": True,
        "message_id": sms.sid,
        "phone_number": phone_number,
        "sms_text": message,
    }