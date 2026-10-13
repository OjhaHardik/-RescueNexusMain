import smtplib
from email.mime.text import MIMEText

from config import EMAIL_USER, EMAIL_APP_PASSWORD, SMTP_HOST, SMTP_PORT, EMAIL_SUBJECT


def send_email(to_email, message):

    if not EMAIL_USER or not EMAIL_APP_PASSWORD:
        print("Email skipped (EMAIL_USER / EMAIL_APP_PASSWORD not set):", to_email)
        return

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

    except Exception as e:
        print("Email failed:", e)
