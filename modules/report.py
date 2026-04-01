import streamlit as st
import folium
from streamlit_folium import st_folium
from modules.severity import classify_severity
from database.crud import create_incident
import requests

def geocode_location(query):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }

    response = requests.get(url, params=params, headers={"User-Agent": "RescueNexusApp"})

    if response.status_code == 200 and response.json():
        data = response.json()[0]
        return float(data["lat"]), float(data["lon"])

    return None, None



def report_page():
    st.header("Report Emergency")

    incident_type = st.selectbox("Type", ["Flood", "Fire", "Accident", "Medical"])
    description = st.text_area("Description")

    st.subheader("Search Location")

    search_query = st.text_input("Enter City / Address")

    if st.button("Search"):
        lat, lon = geocode_location(search_query)

        if lat and lon:
            st.session_state.latitude = lat
            st.session_state.longitude = lon
            st.success(f"Location Found: {lat:.6f}, {lon:.6f}")
        else:
            st.error("Location not found.")

    # --------- MAP SECTION ---------

    st.subheader("Select Location")

    # Initialize session state
    if "latitude" not in st.session_state:
        st.session_state.latitude = None
        st.session_state.longitude = None

    # Determine map center
    if st.session_state.latitude and st.session_state.longitude:
        map_center = [st.session_state.latitude, st.session_state.longitude]
        zoom_level = 15
    else:
        map_center = [28.6139, 77.2090]  # Default Delhi
        zoom_level = 12

    # Create map
    m = folium.Map(location=map_center, zoom_start=zoom_level)

    # Add marker if location selected
    if st.session_state.latitude and st.session_state.longitude:
        folium.Marker(
            location=[st.session_state.latitude, st.session_state.longitude],
            popup="Selected Location",
            icon=folium.Icon(color="blue", icon="info-sign")
        ).add_to(m)

    # Display map
    map_data = st_folium(m, height=500, width=800)

    # Capture click event
    if map_data and map_data.get("last_clicked"):
        st.session_state.latitude = map_data["last_clicked"]["lat"]
        st.session_state.longitude = map_data["last_clicked"]["lng"]

        # Force rerun to refresh map with marker
        st.rerun()

    # Show selected coordinates
    if st.session_state.latitude and st.session_state.longitude:
        st.success(
            f"Selected Location: "
            f"{st.session_state.latitude:.6f}, "
            f"{st.session_state.longitude:.6f}"
        )

    # Submit button
    if st.button("Submit Report"):
        if not st.session_state.latitude:
            st.error("Please select a location on the map.")
            return

        severity = classify_severity(incident_type, description)

        data = {
            "type": incident_type,
            "description": description,
            "latitude": st.session_state.latitude,
            "longitude": st.session_state.longitude,
            "severity": severity
        }

        create_incident(data)

        st.success(f"Incident Reported with {severity} severity")

        # Reset location after submission
        st.session_state.latitude = None
        st.session_state.longitude = None