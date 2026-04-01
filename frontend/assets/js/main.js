/* =========================================
   LOAD COMPONENT
   -----------------------------------------
   Dynamically loads external HTML
   into a target element
========================================= */
async function loadComponent(id, path) {

   // Fetch component file
   const res = await fetch(path);
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
async function loadPage(page) {

   /* -------------------------------
      LOAD PAGE HTML
   ------------------------------- */
   const res = await fetch(`pages/${page}.html`);
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
   script.src = `assets/js/${page}.js`;
   script.id = "pageScript";

   script.onload = () => {

      if (page === "users" && typeof initUsersPage === "function") {
         initUsersPage();
      }

      if (page === "broadcast" && typeof loadIncidentsList === "function") {
         loadIncidentsList();
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

   loadPage("dashboard");
};