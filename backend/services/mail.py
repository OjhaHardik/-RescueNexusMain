import smtplib
from email.mime.text import MIMEText

EMAIL = "rescuenexusniet@gmail.com"
APP_PASSWORD = "pxexszoadiefjmus"


def send_email(to_email, message):

    msg = MIMEText(message)
    msg["Subject"] = "🚨 RescueNexus Emergency Alert"
    msg["From"] = EMAIL
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        server.login(EMAIL, APP_PASSWORD)

        server.sendmail(EMAIL, to_email, msg.as_string())

        server.quit()

        print("Email sent to:", to_email)

    except Exception as e:
        print("Email failed:", e)