/* =========================================
   ANALYTICS LOADER
   -----------------------------------------
   Fetches incident data from backend API
   and renders charts for:
   1. Severity Distribution (Doughnut)
   2. Status Distribution (Bar)
   3. Trends (Line)
   4. Weather (API)
========================================= */

function loadAnalytics() {
    // 1. Fetch Incidents
    fetch("http://127.0.0.1:8000/incidents/")
        .then(res => res.json())
        .then(data => {
            const severityCount = {};
            const statusCount = {};
            const typeCount = {};
            const teamCount = {};

            // Populate weather dropdown
            const weatherSelect = document.getElementById("weatherIncidentSelect");
            weatherSelect.innerHTML = '<option value="">-- Select an Incident --</option>';

            data.forEach(i => {
                // Populate counts case-insensitively
                const sev = i.severity.charAt(0).toUpperCase() + i.severity.slice(1).toLowerCase();
                severityCount[sev] = (severityCount[sev] || 0) + 1;
                statusCount[i.status] = (statusCount[i.status] || 0) + 1;
                
                const incType = i.type || "Other";
                typeCount[incType] = (typeCount[incType] || 0) + 1;
                
                if (i.assigned_team && i.assigned_team !== "Not Assigned") {
                    teamCount[i.assigned_team] = (teamCount[i.assigned_team] || 0) + 1;
                }

                // Add to dropdown
                const opt = document.createElement("option");
                opt.value = `${i.latitude},${i.longitude}`;
                opt.textContent = `${i.type} (${i.status})`;
                weatherSelect.appendChild(opt);
            });

            // Severity Chart (Bar)
            new Chart(document.getElementById("severityChart"), {
                type: "bar",
                data: {
                    labels: Object.keys(severityCount),
                    datasets: [{
                        label: 'Cases',
                        data: Object.values(severityCount),
                        backgroundColor: function(context) {
                            const index = context.dataIndex;
                            const label = context.chart.data.labels[index] || '';
                            if (label === 'Critical') return '#991b1b';
                            if (label === 'High') return '#ef4444';
                            if (label === 'Medium') return '#f59e0b';
                            return '#22c55e';
                        }
                    }]
                },
                options: {
                    color: '#fff',
                    scales: {
                        y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true },
                        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // Status Chart (Pie)
            new Chart(document.getElementById("statusChart"), {
                type: "pie",
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{
                        data: Object.values(statusCount),
                        backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
                        borderColor: "rgba(255,255,255,0.05)"
                    }]
                },
                options: {
                    color: '#fff',
                    plugins: { legend: { labels: { color: '#fff' } } }
                }
            });

            // Incident Type Chart (Doughnut)
            new Chart(document.getElementById("typeChart"), {
                type: "doughnut",
                data: {
                    labels: Object.keys(typeCount),
                    datasets: [{
                        data: Object.values(typeCount),
                        backgroundColor: ["#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#eab308", "#06b6d4"],
                        borderColor: "rgba(255,255,255,0.05)"
                    }]
                },
                options: {
                    color: '#fff',
                    plugins: { legend: { labels: { color: '#fff' } } }
                }
            });

            // Team Workload Chart (Bar)
            new Chart(document.getElementById("teamChart"), {
                type: "bar",
                data: {
                    labels: Object.keys(teamCount),
                    datasets: [{
                        label: 'Incidents Assigned',
                        data: Object.values(teamCount),
                        backgroundColor: "#8b5cf6"
                    }]
                },
                options: {
                    color: '#fff',
                    scales: {
                        y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true },
                        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // Handle weather selection
            weatherSelect.addEventListener('change', function (e) {
                if (!e.target.value) {
                    document.getElementById('weatherDisplay').style.display = 'none';
                    return;
                }
                const coords = e.target.value.split(',');
                fetchWeather(coords[0], coords[1]);
            });

            // Auto load first location weather if available
            if (data.length > 0) {
                weatherSelect.value = `${data[0].latitude},${data[0].longitude}`;
                fetchWeather(data[0].latitude, data[0].longitude);
            }
        });

    // 2. Fetch Trends Data
    fetch("http://127.0.0.1:8000/analytics/trends")
        .then(res => res.json())
        .then(data => {
            const dates = Object.keys(data);
            const incidentsData = dates.map(d => data[d].incidents);
            const reportsData = dates.map(d => data[d].reports);

            new Chart(document.getElementById("trendsChart"), {
                type: "line",
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Incidents',
                            data: incidentsData,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Reports',
                            data: reportsData,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    color: '#fff',
                    scales: {
                        y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true },
                        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                    },
                    plugins: { legend: { labels: { color: '#fff' } } }
                }
            });
        });
}

function fetchWeather(lat, lon) {
    const weatherContainer = document.getElementById("weatherDisplay");
    weatherContainer.style.display = "block";
    document.getElementById("w_desc").textContent = "Loading...";

    // Call completely free Open-Meteo API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.current_weather) {
                const w = data.current_weather;
                document.getElementById("w_temp").textContent = `${w.temperature}°C`;
                document.getElementById("w_wind").textContent = `${w.windspeed} km/h`;
                document.getElementById("w_coords").textContent = `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}`;

                // Decode weather code
                let desc = "Clear";
                if (w.weathercode >= 1 && w.weathercode <= 3) desc = "Partly Cloudy";
                else if (w.weathercode >= 45 && w.weathercode <= 48) desc = "Foggy";
                else if (w.weathercode >= 51 && w.weathercode <= 55) desc = "Drizzle";
                else if (w.weathercode >= 61 && w.weathercode <= 65) desc = "Rain";
                else if (w.weathercode >= 71 && w.weathercode <= 75) desc = "Snow";
                else if (w.weathercode >= 80 && w.weathercode <= 82) desc = "Showers";
                else if (w.weathercode >= 95) desc = "Thunderstorm";

                document.getElementById("w_desc").textContent = desc;
            } else {
                document.getElementById("w_desc").textContent = "Data unavailable";
            }
        })
        .catch(err => {
            console.error("Forecast error:", err);
            document.getElementById("w_desc").textContent = "Failed to load weather";
        });
}