/* =========================================
   MAP FOR HOME LOCATION SELECTION
========================================= */

let map = L.map('map').setView([28.4744, 77.5040], 13); // Greater Noida
let marker = null;
let selectedLocation = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add robust search with autocomplete using Leaflet Geocoder
L.Control.geocoder({
    defaultMarkGeocode: false
})
    .on('markgeocode', function (e) {
        const latlng = e.geocode.center;
        map.setView(latlng, 15);
        if (marker) map.removeLayer(marker);
        marker = L.marker(latlng).addTo(map);
        selectedLocation = latlng;
    })
    .addTo(map);

// User clicks to select home location
map.on('click', function (e) {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);
    selectedLocation = e.latlng;
});

/* =========================================
   LOCATE ME FUNCTION
========================================= */

function detectLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 15);

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);

            selectedLocation = { lat, lng };
        },
        () => {
            alert("Unable to fetch location.");
        }
    );
}


/* =========================================
   REGISTER FUNCTION
========================================= */
async function register() {

    if (!selectedLocation) {
        alert("Please select, search, or detect your location.");
        return;
    }

    const payload = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        home_latitude: selectedLocation.lat,
        home_longitude: selectedLocation.lng
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.password) {
        alert("Please fill all fields.");
        return;
    }

    const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "Registration failed");
        return;
    }

    alert("Registration successful. Please login.");
    window.location.href = "login.html";
}