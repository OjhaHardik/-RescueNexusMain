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
                            <button class="btn-blue" onclick="assignTeam(${incident.id})">Assign</button>
                            <button class="btn-orange" onclick="resolveIncident(${incident.id})">Resolve</button>
                            ${deleteBtn}
                        </div>

                    </div>
                `;

                /* -------------------------------
                   APPEND CARD TO CONTAINER
                ------------------------------- */
                container.innerHTML += card;
            });
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

    const team = prompt("Enter Team Name:");
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
   INITIAL LOAD
========================================= */

loadIncidents();