/* =========================================
   AUTH CHECK
========================================= */

const storedUserId = localStorage.getItem("user_id");

// Ensure valid numeric ID
const userId = storedUserId ? parseInt(storedUserId) : null;

if (!userId) {
    window.location.href = "login.html";
    throw new Error("Access blocked - User not logged in");
}


/* =========================================
   MAP INITIALIZATION
========================================= */

let map = L.map('map').setView([28.4744, 77.5040], 13);
let marker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


/* =========================================
   CLICK TO PLACE MARKER
========================================= */

map.on('click', function(e) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
});


/* =========================================
   DETECT GPS LOCATION
========================================= */

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


/* =========================================
   SUBMIT INCIDENT
========================================= */

function submitIncident() {

    if (!userId) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (!marker) {
        alert("Please select a location.");
        return;
    }

    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();

    // 🔥 VALIDATION
    if (!description) {
        alert("Description cannot be empty.");
        return;
    }

    const latlng = marker.getLatLng();
    const formData = new FormData();

    formData.append("incident_type", type);
    formData.append("description", description);
    formData.append("latitude", latlng.lat);
    formData.append("longitude", latlng.lng);
    formData.append("user_id", userId);

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

    fetch("http://127.0.0.1:8000/incidents/", {
        method: "POST",
        body: formData
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            console.error("Backend error:", data);
            throw new Error("Submission failed");
        }

        return data;
    })
    .then(result => {
        alert("Incident submitted successfully!");
        location.reload();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to submit incident.");
    });
}