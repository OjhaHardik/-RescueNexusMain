/* =========================================
   LOAD INCIDENT LIST
========================================= */

async function loadIncidentsList() {

    const res = await fetch("http://127.0.0.1:8000/incidents/");
    const data = await res.json();

    const select = document.getElementById("broadcastIncident");

    data.forEach(incident => {

        const option = document.createElement("option");

        option.value = incident.id;
        option.textContent =
            `${incident.id} - ${incident.type} (${incident.severity})`;

        select.appendChild(option);

    });
}

/* =========================================
   SEND REAL BROADCAST
========================================= */

async function sendBroadcast() {

    const radius = document.getElementById("broadcastRadius").value;

    const incidentId =
        document.getElementById("broadcastIncident").value;

    const method = document.getElementById("broadcastMethod").value;

    if (!incidentId) {
        alert("Select an incident first.");
        return;
    }


    const res = await fetch(
        `http://127.0.0.1:8000/broadcast/${incidentId}?radius=${radius}&method=${method}`,
        { method: "POST" }
    );

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
        Sent at: ${time}<br>
        Alerts sent to ${count} nearby users
    `;

    logs.prepend(card);
}

loadIncidentsList();