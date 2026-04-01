/* =========================================
   GLOBAL VARIABLES
========================================= */

let map;
let marker = null;
let selectedLocation = null;


/* =========================================
   INIT MAP
========================================= */

function initMap() {

    const mapContainer = document.getElementById("userMap");
    if (!mapContainer) return;

    map = L.map('userMap').setView([28.6139, 77.2090], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add robust search with autocomplete using Leaflet Geocoder
    L.Control.geocoder({
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        map.setView(latlng, 15);
        if (marker) map.removeLayer(marker);
        marker = L.marker(latlng).addTo(map);
        selectedLocation = latlng;
        updateCoords();
    })
    .addTo(map);

    map.on('click', function (e) {

        if (marker) map.removeLayer(marker);

        marker = L.marker(e.latlng).addTo(map);
        selectedLocation = e.latlng;

        updateCoords();
    });
}


/* =========================================
   UPDATE COORD DISPLAY
========================================= */

function updateCoords() {
    document.getElementById("selectedCoords").innerText =
        "Selected: " +
        selectedLocation.lat.toFixed(6) + ", " +
        selectedLocation.lng.toFixed(6);
}


/* =========================================
   DETECT USER LOCATION
========================================= */

function detectLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (pos) {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 15);

        if (marker) map.removeLayer(marker);

        marker = L.marker([lat, lng]).addTo(map);
        selectedLocation = { lat: lat, lng: lng };

        updateCoords();

    }, function () {
        alert("Unable to fetch location");
    });
}



/* =========================================
   LOAD USERS
========================================= */

function loadUsers() {
    fetch("http://127.0.0.1:8000/users/")
        .then(res => res.json())
        .then(data => {

            const table = document.getElementById("userTableBody");
            table.innerHTML = "";

            data.forEach(user => {
                table.innerHTML += `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.phone}</td>
                        <td>${user.home_latitude || "-"}</td>
                        <td>${user.home_longitude || "-"}</td>
                        <td>Active</td>
                        <td>
                            <button class="btn-danger"
                                onclick="deleteUser(${user.id})">
                                Remove
                            </button>
                        </td>
                    </tr>
                `;
            });
        });
}


/* =========================================
   ADD USER (FIXED → FORM DATA)
========================================= */

function addUser() {
    console.log("ADD USER CLICKED");

    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value.trim();

    if (!name || !phone || !email || !password) {
        alert("All fields are required.");
        return;
    }

    if (!selectedLocation) {
        alert("Please select a location on the map.");
        return;
    }

    console.log("Sending:", {
        name,
        phone,
        email,
        password,
        lat: selectedLocation?.lat,
        lng: selectedLocation?.lng
    });

    const payload = {
        name: name,
        phone: phone,
        email: email,
        password: password,
        home_latitude: Number(selectedLocation.lat),
        home_longitude: Number(selectedLocation.lng)
    };

    fetch("http://127.0.0.1:8000/register", {   // 👈 IMPORTANT CHANGE
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {

            const data = await response.json();

            if (!response.ok) {
                console.log("ERROR:", data);
                alert(data.detail || "Something went wrong");
                return;
            }

            alert("User added successfully");

            loadUsers();

            // reset
            document.getElementById("userName").value = "";
            document.getElementById("userPhone").value = "";
            document.getElementById("userEmail").value = "";
            document.getElementById("userPassword").value = "";
            document.getElementById("selectedCoords").innerText = "No location selected";

            if (marker) map.removeLayer(marker);
            selectedLocation = null;
        });
}


/* =========================================
   DELETE USER
========================================= */

function deleteUser(id) {

    if (!confirm("Delete this user?")) return;

    fetch(`http://127.0.0.1:8000/users/${id}`, {
        method: "DELETE"
    })
        .then(() => loadUsers());
}


/* =========================================
   PAGE INIT (NO setTimeout)
========================================= */

function initUsersPage() {
    initMap();
    loadUsers();
}