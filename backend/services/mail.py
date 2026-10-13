import smtplib
from email.mime.text import MIMEText

from config import EMAIL_USER, EMAIL_APP_PASSWORD, SMTP_HOST, SMTP_PORT, EMAIL_SUBJECT


def email_configured():
    return bool(EMAIL_USER and EMAIL_APP_PASSWORD)


def send_email(to_email, message):
    """Send an email. Returns (True, None) on success or (False, error message)."""

    if not email_configured():
        error = "EMAIL_USER / EMAIL_APP_PASSWORD not set"
        print("Email skipped:", error)
        return False, error

    msg = MIMEText(message)
    msg["Subject"] = EMAIL_SUBJECT
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        server.starttls()

        server.login(EMAIL_USER, EMAIL_APP_PASSWORD)

        server.sendmail(EMAIL_USER, to_email, msg.as_string())

        server.quit()

        print("Email sent to:", to_email)
        return True, None

    except Exception as e:
        print("Email failed:", e)
        return False, str(e)


def check_email_login():
    """Log in to the SMTP server without sending anything (diagnostics)."""

    if not email_configured():
        return False, "EMAIL_USER / EMAIL_APP_PASSWORD not set"

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_APP_PASSWORD)
        server.quit()
        return True, None
    except Exception as e:
        return False, str(e)
