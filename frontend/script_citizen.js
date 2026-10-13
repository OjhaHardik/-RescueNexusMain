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

let map = createMap('map');
let marker = null;


// Add robust search with autocomplete using Leaflet Geocoder
L.Control.geocoder({
    defaultMarkGeocode: false
})
.on('markgeocode', function(e) {
    const latlng = e.geocode.center;
    map.setView(latlng, 15);
    if (marker) map.removeLayer(marker);
    marker = L.marker(latlng).addTo(map);
})
.addTo(map);


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

/* =========================================
   SHRINK IMAGE BEFORE UPLOAD
   -----------------------------------------
   Phone photos can exceed the hosting
   request limit (4.5 MB on Vercel)
========================================= */

function compressImage(file, maxSize = 1280, quality = 0.8) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => resolve(blob || file), "image/jpeg", quality);
        };

        // Unsupported format in this browser: send the original
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };

        img.src = url;
    });
}


async function submitIncident() {

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
    if (!type) {
        alert("Please select a category and incident type.");
        return;
    }

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
        const compressed = await compressImage(imageFile);
        formData.append("image", compressed, "evidence.jpg");
    }

    fetch(window.API_BASE_URL + "/incidents/", {
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