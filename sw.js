const cacheName = "f1-app-v1";
const cacheAssets = [
  "/",
  "/index.html",
  "/manifest.json",
  "/script.js",
  "/style.css", // or whatever your main CSS file is
  "/assets/images/app-icon-192.png",
  "/assets/images/app-icon-512.png",
];

// Install event
self.addEventListener("install", (e) => {
  console.log("Service Worker: Installing...");
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Service Worker: Caching files");
      return cache.addAll(cacheAssets);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
