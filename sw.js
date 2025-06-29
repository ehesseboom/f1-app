const cacheName = "f1-app-v1";
const cacheAssets = [
  "/",
  "/index.html",
  "/manifest.json",
  "/script.js",
  "/style.css",
  "/assets/images/app-icon-192.png",
  "/assets/images/app-icon-512.png",
];

// Install event
self.addEventListener("install", (e) => {
  console.log("Service Worker: Installing...");
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        return cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activating...");
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== cacheName) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then((cachedResponse) => {
        const networkFetch = fetch(e.request).then((networkResponse) => {
          if (e.request.url.includes("f1api.dev")) {
            caches.open(cacheName).then((cache) => {
              cache.put(e.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
        return cachedResponse || networkFetch;
      })
      .catch(() => caches.match("/index.html"))
  );
});
