import streamlit as st
import folium
from streamlit_folium import st_folium
from database.crud import get_all_incidents, update_incident

def dashboard_page():
    st.header("Authority Dashboard")

    incidents = get_all_incidents()

    # Metrics Section
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Incidents", len(incidents))
    col2.metric("High Severity", len([i for i in incidents if i.severity == "High"]))
    col3.metric("Resolved", len([i for i in incidents if i.status == "Resolved"]))

    st.divider()

    # Map
    m = folium.Map(location=[28.6139, 77.2090], zoom_start=10)

    for inc in incidents:

        color = "green"
        if inc.severity == "Medium":
            color = "orange"
        elif inc.severity == "High":
            color = "red"

        folium.Marker(
            location=[inc.latitude, inc.longitude],
            popup=f"ID: {inc.id} | {inc.type} | {inc.status}",
            icon=folium.Icon(color=color)
        ).add_to(m)

    st_folium(m, height=500, width=900)

    st.divider()
    st.subheader("Manage Incidents")

    for inc in incidents:
        with st.expander(f"Incident ID {inc.id} - {inc.type} ({inc.severity})"):

            new_status = st.selectbox(
                "Update Status",
                ["Pending", "In Progress", "Resolved"],
                index=["Pending", "In Progress", "Resolved"].index(inc.status),
                key=f"status_{inc.id}"
            )

            team = st.text_input(
                "Assign Team",
                value=inc.assigned_team,
                key=f"team_{inc.id}"
            )

            if st.button("Update", key=f"btn_{inc.id}"):
                update_incident(inc.id, new_status, team)
                st.success("Updated Successfully")
                st.rerun()