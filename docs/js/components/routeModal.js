import { t, tr } from "../i18n/i18n.js";

export function openRouteModal(monument) {
  const lat = monument.lat;
  const lng = monument.lng;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    alert(t("route.invalid"));
    return;
  }

  if (!window.L) {
    alert(t("route.mapError"));
    return;
  }

  const dialog = document.createElement("dialog");

  dialog.style.cssText = `
    width:min(960px,94vw);
    max-height:92vh;
    padding:0;
    margin:auto;
    border:1px solid var(--border);
    border-radius:16px;
    background:var(--card,#10172f);
    color:var(--card-foreground,#fff);
    overflow:auto;
  `;

  dialog.innerHTML = `
    <style>
      dialog.route-dialog::backdrop {
        background:rgba(0,0,0,.75);
      }
    </style>

    <header style="display:flex;align-items:center;
                   justify-content:space-between;padding:16px;">
      <strong data-title></strong>
      <button type="button" data-close
        style="background:transparent;color:inherit;border:0;
               font-size:24px;cursor:pointer;">✕</button>
    </header>

    <div style="padding:0 16px 16px;">
      <button type="button" data-locate
        style="padding:10px 16px;border:0;border-radius:8px;
               background:#f5b82e;color:#111;cursor:pointer;">
      </button>

      <p data-help style="margin:12px 0;font-size:14px;"></p>

      <div data-map
        style="height:clamp(280px,50vh,500px);border-radius:10px;">
      </div>

      <p data-status role="status"
         style="margin-top:12px;font-weight:600;"></p>

      <p data-note style="margin-top:8px;font-size:12px;opacity:.7;"></p>
    </div>
  `;

  dialog.className = "route-dialog";
  dialog.querySelector("[data-title]").textContent = tr(monument.name);
  dialog.querySelector("[data-close]").ariaLabel = t("dlg.close");
  dialog.querySelector("[data-locate]").textContent = t("route.locate");
  dialog.querySelector("[data-help]").textContent = t("route.pickStart");
  dialog.querySelector("[data-note]").textContent = t("route.note");

  document.body.append(dialog);
  dialog.showModal();

  // Escape зөвхөн маршрутын цонхыг хаана.
  dialog.addEventListener("keydown", (event) => {
    event.stopPropagation();
  });

  const map = L.map(dialog.querySelector("[data-map]")).setView([lat, lng], 8);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">' + "OpenStreetMap</a> contributors",
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindTooltip(tr(monument.name));

  const status = dialog.querySelector("[data-status]");
  const locateButton = dialog.querySelector("[data-locate]");

  let startMarker;
  let routeLayer;
  let request;
  let closed = false;
  let locating = false;

  async function calculateRoute(startLat, startLng) {
    request?.abort();
    const controller = new AbortController();
    request = controller;

    routeLayer?.remove();
    routeLayer = null;

    if (startMarker) {
      startMarker.setLatLng([startLat, startLng]);
    } else {
      startMarker = L.marker([startLat, startLng]).addTo(map).bindTooltip(t("route.start"));
    }

    status.textContent = t("route.loading");

    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const coordinates = `${startLng},${startLat};${lng},${lat}`;
      const url = "https://router.project-osrm.org/route/v1/driving/" + coordinates + "?overview=full&geometries=geojson";

      const response = await fetch(url, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Route request failed");

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No route");
      }

      if (closed || request !== controller) return;

      const route = data.routes[0];

      routeLayer = L.geoJSON(route.geometry, {
        style: {
          color: "#f5b82e",
          weight: 6,
          opacity: 0.9,
        },
      }).addTo(map);

      map.fitBounds(routeLayer.getBounds().extend([startLat, startLng]).extend([lat, lng]), { padding: [30, 30] });

      const minutes = Math.max(1, Math.round(route.duration / 60));

      status.textContent = t("route.result", {
        km: (route.distance / 1000).toFixed(1),
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
      });
    } catch {
      if (!closed && request === controller) {
        status.textContent = t("route.error");
      }
    } finally {
      clearTimeout(timer);
    }
  }

  // Газрын зураг дээр дарж эхлэх цэгээ сонгоно.
  map.on("click", (event) => {
    if (!locating) {
      calculateRoute(event.latlng.lat, event.latlng.lng);
    }
  });

  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      status.textContent = t("route.locationError");
      return;
    }

    locating = true;
    locateButton.disabled = true;

    request?.abort();
    request = null;

    status.textContent = t("route.locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (closed) return;

        locating = false;
        locateButton.disabled = false;

        calculateRoute(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (closed) return;

        locating = false;
        locateButton.disabled = false;
        status.textContent = t("route.locationError");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  });

  dialog.querySelector("[data-close]").addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener(
    "close",
    () => {
      closed = true;
      request?.abort();
      map.remove();
      dialog.remove();
    },
    { once: true },
  );

  requestAnimationFrame(() => {
    if (!closed) map.invalidateSize();
  });
}
