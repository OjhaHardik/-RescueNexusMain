/* =========================================
   CENTRAL FRONTEND CONFIGURATION
   -----------------------------------------
   Every link and setting used by the browser
   lives here. Change it once, every page
   picks it up.

   ⚠️ This file is public (anyone can view it
   in the browser). NEVER put passwords or
   keys here — those belong in the backend
   .env file / Vercel Environment Variables.
========================================= */

window.APP_CONFIG = {

   /* -------------------------------
      BACKEND API
      Local:    FastAPI on port 8000
      Deployed: same-origin /api (Vercel)
   ------------------------------- */
   LOCAL_API_URL: "http://localhost:8000",
   DEPLOYED_API_URL: "/api",

   /* -------------------------------
      DEFAULT MAP VIEW (Uttari Pitampura, Delhi)
   ------------------------------- */
   MAP_CENTER: [28.7151, 77.1390],
   MAP_ZOOM: 14,

   /* -------------------------------
      MAP TILES
   ------------------------------- */
   TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
   TILE_ATTRIBUTION: "© OpenStreetMap contributors",

   /* -------------------------------
      EXTERNAL SERVICES
   ------------------------------- */
   GEOCODER_URL: "https://nominatim.openstreetmap.org/search",
   WEATHER_API_URL: "https://api.open-meteo.com/v1/forecast"
};

(function () {
   const host = window.location.hostname;
   const isLocal =
      window.location.protocol === "file:" ||
      host === "localhost" ||
      host === "127.0.0.1";

   window.API_BASE_URL = isLocal
      ? window.APP_CONFIG.LOCAL_API_URL
      : window.APP_CONFIG.DEPLOYED_API_URL;
})();

/* -------------------------------
   SHARED HELPER: create a Leaflet map
   with the configured tiles
------------------------------- */
window.createMap = function (elementId, center, zoom) {
   const cfg = window.APP_CONFIG;
   const map = L.map(elementId).setView(center || cfg.MAP_CENTER, zoom || cfg.MAP_ZOOM);

   L.tileLayer(cfg.TILE_URL, {
      attribution: cfg.TILE_ATTRIBUTION
   }).addTo(map);

   return map;
};
