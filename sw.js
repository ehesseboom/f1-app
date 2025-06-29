const CACHE_NAME = "my-app-cache-v1";
const urlsToCache = [
  "index.html",
  "style.css",
  "script.js",
  "assets/images/web-app-manifest-192x192.png",
  "assets/images/web-app-manifest-512x512.png",
  "assets/images/screenshot-desktop.png",
  "assets/images/screenshot-mobile.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
