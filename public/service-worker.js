const CACHE_NAME = 'static-cache-v1';

const iconSizes = ['192', '512'];
const iconFiles = iconsSizes.map((size) => `/icons/icon-${size}x${size}.png`);

const FILES_TO_CACHE = [
  "/",
  "/offline.html",
  '/manifest.webmanifest',
  '/index.js',
  '/styles.css'
].concat(iconFiles);

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(FILE_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});