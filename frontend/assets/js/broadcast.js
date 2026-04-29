/* =========================================
   LOAD INCIDENT LIST
========================================= */
let incidentsMap = {};  // Store incidents by ID
let selectedLat = null, selectedLng = null;
let map, marker;

async function loadIncidentsList() {
    const res = await fetch("http://127.0.0.1:8000/incidents/");
    const data = await res.json();

    const select = document.getElementById("broadcastIncident");
    select.innerHTML = '<option value="">Select Incident...</option>';

    data.forEach(incident => {
        incidentsMap[incident.id] = incident;
        const option = document.createElement("option");
        option.value = incident.id;
        option.textContent = `${incident.id} - ${incident.type} (${incident.severity})`;
        select.appendChild(option);
    });
}

/* =========================================
   MAP INITIALIZATION
========================================= */
function initMap() {
    // Default view center (e.g., national capital coordinates)
    map = L.map('map').setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    map.on('click', function (e) {
        selectedLat = e.latlng.lat;
        selectedLng = e.latlng.lng;
        if (marker) map.removeLayer(marker);
        marker = L.marker([selectedLat, selectedLng]).addTo(map);
    });
}

/* =========================================
   SEND BROADCAST
========================================= */
async function sendBroadcast() {
    const radius = document.getElementById("broadcastRadius").value;
    const incidentId = document.getElementById("broadcastIncident").value;
    const method = document.getElementById("broadcastMethod").value;
    const useMap = document.getElementById("useMap").checked;

    if (!incidentId) {
        alert("Select an incident first.");
        return;
    }
    if (!radius) {
        alert("Enter broadcast radius.");
        return;
    }

    // Determine coordinates
    let lat = incidentsMap[incidentId].latitude;
    let lng = incidentsMap[incidentId].longitude;
    if (useMap) {
        if (selectedLat && selectedLng) {
            lat = selectedLat;
            lng = selectedLng;
        } else {
            alert("Please click on the map to select a location.");
            return;
        }
    }
    // Prepare API URL with coords as query params
    let url = `http://127.0.0.1:8000/broadcast/${incidentId}?radius=${radius}&method=${method}`;
    if (lat && lng && (lat !== 0 || lng !== 0)) {
        url += `&latitude=${lat}&longitude=${lng}`;
    }

    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    logBroadcast(incidentId, method, data.alerts_sent);
}

function logBroadcast(incidentId, method, count) {
    const logs = document.getElementById("broadcastLogs");
    const card = document.createElement("div");
    const time = new Date().toLocaleString();
    card.innerHTML = `
        <b>Incident ${incidentId}</b><br>
        Method: ${method.toUpperCase()}<br>
        Alerts sent to ${count} nearby users<br>
        <small style="color:#888;">Sent at: ${time}</small>
    `;
    logs.prepend(card);
}

// Toggle map display when checkbox changes
document.getElementById("useMap").addEventListener("change", (e) => {
    const mapDiv = document.getElementById("map");
    if (e.target.checked) {
        mapDiv.style.display = "block";
        if (!map) initMap();
    } else {
        mapDiv.style.display = "none";
    }
});

loadIncidentsList();
