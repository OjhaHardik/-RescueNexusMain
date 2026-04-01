import streamlit as st
from database.models import Base
from database.db import engine
from modules.report import report_page
from modules.dashboard import dashboard_page

Base.metadata.create_all(bind=engine)

st.set_page_config(page_title="RescueNexus", layout="wide")

st.title("RescueNexus")

menu = st.sidebar.selectbox("Navigation", ["Report Incident", "Dashboard"])

if menu == "Report Incident":
    report_page()

elif menu == "Dashboard":
    dashboard_page()