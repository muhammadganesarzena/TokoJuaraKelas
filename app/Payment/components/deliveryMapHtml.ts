export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export const buildDeliveryMapHtml = (
  store: MapCoordinate,
  customer: MapCoordinate | null,
) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <style>
    html, body, #map { width:100%; height:100%; margin:0; padding:0; background:#e8efe8; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
    const store = { lat: ${store.latitude}, lng: ${store.longitude} };
    const initialCustomer = ${
      customer
        ? `{ lat: ${customer.latitude}, lng: ${customer.longitude} }`
        : "null"
    };

    const map = L.map("map").setView([store.lat, store.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const storeIcon = L.divIcon({
      className: "",
      html: '<div style="width:42px;height:42px;border-radius:21px;background:#2D6A4F;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:16px;">&#127978;</div>',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
    const homeIcon = L.divIcon({
      className: "",
      html: '<div style="width:36px;height:36px;border-radius:18px;background:#1B4332;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:14px;">&#127968;</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([store.lat, store.lng], { icon: storeIcon }).addTo(map);

    let homeMarker = null;
    let routeLine = null;

    const drawHome = (lat, lng, notify) => {
      if (homeMarker) map.removeLayer(homeMarker);
      if (routeLine) map.removeLayer(routeLine);
      homeMarker = L.marker([lat, lng], { icon: homeIcon }).addTo(map);
      routeLine = L.polyline([[store.lat, store.lng], [lat, lng]], { color: "#2D6A4F", weight: 3 }).addTo(map);
      if (notify && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "location", lat, lng }));
      }
    };

    if (initialCustomer) drawHome(initialCustomer.lat, initialCustomer.lng, false);
    map.on("click", (e) => drawHome(e.latlng.lat, e.latlng.lng, true));

    window.setHomeLocation = (lat, lng, notify) => {
      drawHome(lat, lng, notify !== false);
      map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
    };
  </script>
</body>
</html>`;
