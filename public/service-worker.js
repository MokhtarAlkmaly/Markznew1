const CACHE_NAME = 'inmaa-v1';
const ASSETS = [
  '/Markznew1/',
  '/Markznew1/index.html',
  '/Markznew1/icon-192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
