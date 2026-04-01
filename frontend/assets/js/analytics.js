/* =========================================
   ANALYTICS LOADER
   -----------------------------------------
   Fetches incident data from backend API
   and renders charts for:
   1. Severity Distribution (Doughnut)
   2. Status Distribution (Bar)
========================================= */

function loadAnalytics() {

    /* -------------------------------------
       FETCH INCIDENT DATA FROM BACKEND
       -------------------------------------
       Calls FastAPI endpoint to retrieve
       all incidents in JSON format
    ------------------------------------- */
    fetch("http://127.0.0.1:8000/incidents/")
        .then(res => res.json())
        .then(data => {

            /* -------------------------------------
               DATA AGGREGATION
               -------------------------------------
               Prepare counters for:
               - Severity levels (High/Medium/Low)
               - Status types (dynamic values)
            ------------------------------------- */

            const severityCount = { High:0, Medium:0, Low:0 };
            const statusCount = {};

            /* -------------------------------------
               LOOP THROUGH INCIDENTS
               -------------------------------------
               Count occurrences of:
               - Each severity level
               - Each status value
            ------------------------------------- */
            data.forEach(i => {
                severityCount[i.severity]++;
                statusCount[i.status] = (statusCount[i.status] || 0) + 1;
            });


            /* =====================================
               SEVERITY CHART (DOUGHNUT)
               -------------------------------------
               Visualizes distribution of:
               High vs Medium vs Low incidents
            ===================================== */

            new Chart(document.getElementById("severityChart"), {
                type: "doughnut",
                data: {
                    labels: Object.keys(severityCount),   // ["High", "Medium", "Low"]
                    datasets: [{
                        data: Object.values(severityCount),  // Corresponding counts
                        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"]
                        // Red = High, Yellow = Medium, Green = Low
                    }]
                }
            });


            /* =====================================
               STATUS CHART (BAR)
               -------------------------------------
               Visualizes count of incidents
               by their current status
            ===================================== */

            new Chart(document.getElementById("statusChart"), {
                type: "bar",
                data: {
                    labels: Object.keys(statusCount),   // Dynamic status labels
                    datasets: [{
                        data: Object.values(statusCount),  // Corresponding counts
                        backgroundColor: "#2563eb"         // Primary blue
                    }]
                }
            });

        });
}