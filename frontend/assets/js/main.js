/* =========================================
   LOAD COMPONENT
   -----------------------------------------
   Dynamically loads external HTML
   into a target element
========================================= */
async function loadComponent(id, path) {

   // Fetch component file
   const res = await fetch(path + '?v=' + new Date().getTime());
   const html = await res.text();

   // Inject into target element
   document.getElementById(id).innerHTML = html;
}


/* =========================================
   LOAD PAGE
   -----------------------------------------
   Loads page HTML + JS dynamically
   Updates title and sidebar state
========================================= */
window.switchPage = function(page) {
   localStorage.setItem("activePage", page);
   window.location.reload();
};

async function loadPage(page) {

   /* -------------------------------
      CLOSE MOBILE SIDEBAR (IF OPEN)
   ------------------------------- */
   document.body.classList.remove('sidebar-open');

   /* -------------------------------
      LOAD PAGE HTML
   ------------------------------- */
   const res = await fetch(`pages/${page}.html?v=` + new Date().getTime());
   const html = await res.text();
   document.getElementById("content").innerHTML = html;

   /* -------------------------------
      UPDATE PAGE TITLE
   ------------------------------- */
   document.getElementById("pageTitle").innerText =
      page.charAt(0).toUpperCase() + page.slice(1);

   /* -------------------------------
      LOAD PAGE-SPECIFIC SCRIPT
      Remove old script first
   ------------------------------- */
   const existingScript = document.getElementById("pageScript");
   if (existingScript) existingScript.remove();

   const script = document.createElement("script");
   script.src = `assets/js/${page}.js?v=` + new Date().getTime();
   script.id = "pageScript";

   script.onload = () => {

      if (page === "users" && typeof initUsersPage === "function") {
         initUsersPage();
      }

      if (page === "broadcast" && typeof loadIncidentsList === "function") {
         loadIncidentsList();
      }

      if (page === "reports" && typeof initReportsPage === "function") {
         initReportsPage();
      }

      if (page === "analytics" && typeof loadAnalytics === "function") {
         loadAnalytics();
      }

   };

   document.body.appendChild(script);

   /* -------------------------------
      UPDATE SIDEBAR ACTIVE STATE
   ------------------------------- */
   document.querySelectorAll(".sidebar button").forEach(btn => {
      btn.classList.remove("active");
   });

   const activeBtn = Array.from(
      document.querySelectorAll(".sidebar button")
   ).find(btn => btn.textContent.toLowerCase() === page);

   if (activeBtn) activeBtn.classList.add("active");
   
   // Save active page state to localStorage
   localStorage.setItem("activePage", page);
}


/* =========================================
   INITIAL APP LOAD
   -----------------------------------------
   Loads layout components first,
   then default page (dashboard)
========================================= */
window.onload = async function () {

   await loadComponent("sidebar", "components/sidebar.html");
   await loadComponent("topbar", "components/topbar.html");

   // Load Theme
   if (localStorage.getItem('appTheme') === 'light') {
       document.body.classList.add('light-mode');
   }

   const savedPage = localStorage.getItem("activePage") || "dashboard";
   loadPage(savedPage);

   // Start Polling
   startGlobalPolling();
};

/* =========================================
   GLOBAL POLLING & NOTIFICATIONS
========================================= */
let globalPollInterval = null;
let lastIncidentCount = 0;

window.startGlobalPolling = function() {
   if (globalPollInterval) clearInterval(globalPollInterval);
   
   const refreshRate = parseInt(localStorage.getItem('appRefreshRate') || '0', 10);
   
   // Initial count fetch to set baseline for notifications
   fetch("http://127.0.0.1:8000/incidents/")
      .then(res => res.json())
      .then(data => lastIncidentCount = data.length)
      .catch(() => {});

   if (refreshRate > 0) {
      globalPollInterval = setInterval(async () => {
         
         // 1. Check for new incidents (Notifications)
         try {
            const res = await fetch("http://127.0.0.1:8000/incidents/");
            const data = await res.json();
            
            if (data.length > lastIncidentCount) {
               const diff = data.length - lastIncidentCount;
               lastIncidentCount = data.length;
               
               if (localStorage.getItem('appNotifications') === 'on' && Notification.permission === 'granted') {
                  new Notification("RescueNexus Alert", {
                     body: `${diff} new incident(s) reported!`,
                     icon: "/frontend/assets/images/alert-icon.png" // fallback ok if missing
                  });
               }
            } else {
               lastIncidentCount = data.length;
            }
         } catch(e) {}

         // 2. Auto-refresh current page
         const page = localStorage.getItem("activePage");
         if (page === "dashboard" && typeof initDashboard === "function") initDashboard();
         if (page === "incidents" && typeof loadIncidents === "function") loadIncidents();
         if (page === "analytics" && typeof loadAnalytics === "function") loadAnalytics();
         
      }, refreshRate);
   }
};