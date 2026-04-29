/* =========================================
   GLOBAL REPORTS DATACACHE
========================================= */
let reportsData = [];

/* =========================================
   LOAD PERMANENT REPORTS FROM API
========================================= */
function loadReports() {
    fetch("http://127.0.0.1:8000/reports/")
        .then(res => res.json())
        .then(data => {
            reportsData = data;
            const table = document.getElementById("reportTableBody");
            
            if (!table) return;
            
            table.innerHTML = "";

            if (data.length === 0) {
                table.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No permanent records found.</td></tr>`;
                return;
            }

            data.sort((a,b) => b.id - a.id).forEach(report => {
                
                // Format Status
                let statusBadge = "";
                if (report.status === "Pending") statusBadge = `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">Pending</span>`;
                else if (report.status === "In Progress") statusBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">In Progress</span>`;
                else statusBadge = `<span class="badge" style="background: rgba(34, 197, 94, 0.15); color: #22c55e;">Resolved</span>`;

                // Format Team
                let teamStr = report.assigned_team;
                if (!teamStr || teamStr === "Not Assigned" || teamStr === "null") {
                    teamStr = `<span style="color:#666; font-style:italic;">Not Assigned</span>`;
                }

                // Format Time
                const d = new Date(report.timestamp);
                const timeStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                table.innerHTML += `
                    <tr>
                        <td data-label="Rep ID">#${report.id}</td>
                        <td data-label="Emergency">${report.type}</td>
                        <td data-label="Status">${statusBadge}</td>
                        <td data-label="Team">${teamStr}</td>
                        <td data-label="Logged">${timeStr}</td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error("Error fetching reports:", err);
        });
}

/* =========================================
   EXPORT CSV NATIVELY
========================================= */
function exportCSV() {
    if (reportsData.length === 0) {
        alert("No reports to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Report ID,Original ID,Type,Severity,Status,Team,Latitude,Longitude,Timestamp\n";

    reportsData.forEach(function(rowArray) {
        const row = [
            rowArray.id,
            rowArray.original_incident_id || "N/A",
            `"${rowArray.type}"`,
            `"${rowArray.severity}"`,
            `"${rowArray.status}"`,
            `"${rowArray.assigned_team}"`,
            rowArray.latitude,
            rowArray.longitude,
            `"${new Date(rowArray.timestamp).toISOString()}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RescueNexus_Reports_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* =========================================
   EXPORT PDF (via jsPDF & AutoTable)
========================================= */
function exportPDF() {
    if (reportsData.length === 0) {
        alert("No reports to export.");
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add Premium Header
        doc.setFontSize(18);
        doc.setTextColor(59, 130, 246); // Primary Blue
        doc.text("RescueNexus", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("Official Emergency History Ledger", 14, 30);
        
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

        // Convert JSON to Array for AutoTable
        const tableColumn = ["Report ID", "Emergency Type", "Severity", "Status", "Team", "Coordinate", "Time"];
        const tableRows = [];

        reportsData.forEach(r => {
            const row = [
                r.id,
                r.type,
                r.severity,
                r.status,
                r.assigned_team,
                `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
                new Date(r.timestamp).toLocaleDateString()
            ];
            tableRows.push(row);
        });

        // Generate Table
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 244, 248] },
            styles: { fontSize: 9 }
        });

        doc.save(`RescueNexus_Reports_${new Date().getTime()}.pdf`);
    } catch(err) {
        console.error(err);
        alert("PDF Generator Error. Ensure you refreshed the page so jsPDF loads.");
    }
}

/* =========================================
   INITIALIZATION HOOK
========================================= */
function initReportsPage() {
    loadReports();
}
