/* =========================================
   LOAD INCIDENTS
   -----------------------------------------
   Fetch incidents from backend
   and render them as cards
========================================= */

function loadIncidents() {

    fetch("http://127.0.0.1:8000/incidents/")
        .then(res => res.json())
        .then(data => {

            /* -------------------------------
               GET CONTAINER & CLEAR OLD DATA
            ------------------------------- */
            const container = document.getElementById("incidentContainer");
            container.innerHTML = "";

            /* -------------------------------
               LOOP THROUGH INCIDENTS
               Build card for each record
            ------------------------------- */
            let htmlBuffer = "";
            
            data.forEach(incident => {

                /* -------------------------------
                   IMAGE HANDLING
                   Show image if available
                ------------------------------- */
                const imageHTML = incident.image_path
                    ? `<img src="http://127.0.0.1:8000${incident.image_path}" class="incident-image">`
                    : `<div class="no-image">No Image</div>`;

                /* -------------------------------
                   DELETE BUTTON
                   Only visible if Resolved
                ------------------------------- */
                const deleteBtn =
                    incident.status === "Resolved"
                        ? `<button class="btn-danger" onclick="deleteIncident(${incident.id})">Delete</button>`
                        : "";

                /* -------------------------------
                   INCIDENT CARD TEMPLATE
                ------------------------------- */
                const card = `
                    <div class="incident-card ${incident.severity.toLowerCase()}">

                        <div class="incident-left">
                            ${imageHTML}
                        </div>

                        <div class="incident-middle">
                            <h3>${incident.type}</h3>
                            <p>${incident.description}</p>

                            <div class="incident-meta">
                                <span class="badge ${incident.severity.toLowerCase()}">${incident.severity}</span>
                                <span class="status">${incident.status}</span>
                                <span>Team: ${incident.assigned_team || "Not Assigned"}</span>
                            </div>
                        </div>

                        <div class="incident-actions">
                            <button class="btn-blue" onclick="assignTeam(${incident.id})">Assign & Notify</button>
                            <button class="btn-orange" onclick="resolveIncident(${incident.id})">Resolve</button>
                            <button class="btn-blue" style="background-color: #22c55e;" onclick="openLocationModal(${incident.id}, ${incident.latitude}, ${incident.longitude})">Update Location</button>
                            ${deleteBtn}
                        </div>

                    </div>
                `;

                /* -------------------------------
                   APPEND CARD TO BUFFER
                ------------------------------- */
                htmlBuffer += card;
            });
            
            /* -------------------------------
               INJECT HTML TO DOM
            ------------------------------- */
            container.innerHTML = htmlBuffer;
        });
}


/* =========================================
   ASSIGN TEAM
   -----------------------------------------
   Updates incident to:
   - Status: In Progress
   - Assigned Team: User input
========================================= */

function assignTeam(id) {

    const team = prompt("Enter Team Name to Dispatch (An email alert will be sent to the reporting citizen):");
    if (!team) return;   // Stop if empty input

    fetch(`http://127.0.0.1:8000/incidents/${id}?status=In Progress&assigned_team=${team}`, {
        method: "PUT"
    })
        .then(() => loadIncidents());  // Refresh list
}


/* =========================================
   RESOLVE INCIDENT
   -----------------------------------------
   Marks incident as Resolved
========================================= */

function resolveIncident(id) {

    fetch(`http://127.0.0.1:8000/incidents/${id}?status=Resolved&assigned_team=Completed`, {
        method: "PUT"
    })
        .then(() => loadIncidents());  // Refresh list
}


/* =========================================
   DELETE INCIDENT
   -----------------------------------------
   Allowed only after confirmation
========================================= */

function deleteIncident(id) {

    if (!confirm("Delete this resolved incident?")) return;

    fetch(`http://127.0.0.1:8000/incidents/${id}`, {
        method: "DELETE"
    })
        .then(() => loadIncidents());  // Refresh list
}


/* =========================================
   UPDATE LOCATION (MAP MODAL)
========================================= */

var currentIncidentId = null;
var locationMapObj = null;
var locationMarker = null;

function openLocationModal(id, lat, lng) {
    currentIncidentId = id;
    document.getElementById("locationModal").style.display = "block";
    
    if (!locationMapObj) {
        locationMapObj = L.map('incidentMap').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(locationMapObj);
    } else {
        locationMapObj.setView([lat, lng], 13);
    }

    if (locationMarker) {
        locationMapObj.removeLayer(locationMarker);
    }

    locationMarker = L.marker([lat, lng], {draggable: true}).addTo(locationMapObj);
    
    // Fix map rendering
    setTimeout(() => {
        locationMapObj.invalidateSize();
    }, 100);
}

function closeLocationModal() {
    document.getElementById("locationModal").style.display = "none";
    currentIncidentId = null;
}

function searchLocation() {
    const query = document.getElementById("mapSearchInput").value;
    if (!query) return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                locationMapObj.setView([lat, lon], 13);
                locationMarker.setLatLng([lat, lon]);
            } else {
                alert("Location not found");
            }
        });
}

function saveNewLocation() {
    if (!currentIncidentId || !locationMarker) return;
    
    const pos = locationMarker.getLatLng();
    
    fetch(`http://127.0.0.1:8000/incidents/${currentIncidentId}/location?latitude=${pos.lat}&longitude=${pos.lng}`, {
        method: "PUT"
    })
    .then(res => res.json())
    .then(() => {
        closeLocationModal();
        loadIncidents(); // Refresh cards
    })
    .catch(err => {
        console.error("Error updating location:", err);
        alert("Failed to update location");
    });
}


/* =========================================
   INITIAL LOAD
========================================= */

loadIncidents();