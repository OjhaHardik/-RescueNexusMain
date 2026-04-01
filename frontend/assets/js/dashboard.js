/* =========================================
   DASHBOARD INITIALIZATION
   -----------------------------------------
   Creates map and loads incident data
========================================= */

function initDashboard() {

    /* -------------------------------
       CREATE LEAFLET MAP
       Default location: Delhi
    ------------------------------- */
    const map = L.map('map').setView([28.4744, 77.5040], 13);

    /* -------------------------------
       ADD OPENSTREETMAP TILE LAYER
    ------------------------------- */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    /* -------------------------------
       LOAD INCIDENTS ON MAP
    ------------------------------- */
    loadIncidents(map);
}


/* =========================================
   LOAD INCIDENT DATA
   -----------------------------------------
   Fetches incidents, updates:
   - Map markers
   - KPI statistics
========================================= */

function loadIncidents(map) {

    fetch("http://127.0.0.1:8000/incidents/")
        .then(res => res.json())
        .then(data => {

            /* -------------------------------
               CLEAR OLD MARKERS
               Prevent duplicate markers
            ------------------------------- */
            map.eachLayer(layer => {
                if (layer instanceof L.CircleMarker) {
                    map.removeLayer(layer);
                }
            });

            /* -------------------------------
               KPI COUNTERS
            ------------------------------- */
            let total = data.length;
            let active = 0;
            let high = 0;
            let resolvedToday = 0;

            const today = new Date().toDateString();

            /* -------------------------------
               PROCESS EACH INCIDENT
               - Update counters
               - Add marker to map
            ------------------------------- */
            data.forEach(incident => {

                const severity = (incident.severity || "").toLowerCase();

                if (incident.status !== "Resolved") active++;

                if (severity === "high" || severity === "critical") high++;

                if (
                    incident.status === "Resolved" &&
                    new Date(incident.timestamp).toDateString() === today
                ) {
                    resolvedToday++;
                }

                const color =
                    severity === "critical" ? "red" :
                        severity === "high" ? "orange" :
                            severity === "medium" ? "yellow" :
                                "green";

                L.circleMarker(
                    [incident.latitude, incident.longitude],
                    { color: color, radius: 8 }
                ).addTo(map)
                    .bindPopup(`
                    <b>${incident.type}</b><br>
                    Severity: ${incident.severity}<br>
                    Status: ${incident.status}
                `);
            });

            /* -------------------------------
               UPDATE KPI CARDS IN UI
            ------------------------------- */
            document.getElementById("kpi-total").innerText = total;
            document.getElementById("kpi-active").innerText = active;
            document.getElementById("kpi-high").innerText = high;
            document.getElementById("kpi-resolved").innerText = resolvedToday;
        });
}


/* =========================================
   INITIAL CALL
   -----------------------------------------
   Runs dashboard immediately on load
========================================= */

initDashboard();