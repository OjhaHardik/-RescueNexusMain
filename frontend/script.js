let map = L.map('map').setView([28.6139, 77.2090], 12);
let marker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load existing incidents
fetch("http://127.0.0.1:8000/incidents/")
    .then(response => response.json())
    .then(data => {
        data.forEach(incident => {
            let color = "green";
            if (incident.severity === "High") color = "red";
            if (incident.severity === "Medium") color = "orange";

            L.circleMarker([incident.latitude, incident.longitude], {
                color: color,
                radius: 8
            }).addTo(map)
              .bindPopup(`${incident.type} - ${incident.severity}`);
        });
    });

// Click to place marker
map.on('click', function(e) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
});

// Detect GPS
function detectLocation() {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        map.setView([lat, lon], 15);

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lon]).addTo(map);
    });
}

// Submit incident
function submitIncident() {
    if (!marker) {
        alert("Please select location.");
        return;
    }

    const latlng = marker.getLatLng();

    const data = {
        type: "Flood",
        description: "Manual report from frontend",
        latitude: latlng.lat,
        longitude: latlng.lng,
        severity: "Medium"
    };

    fetch("http://127.0.0.1:8000/incidents/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert("Incident submitted!");
        location.reload();
    });

    
}