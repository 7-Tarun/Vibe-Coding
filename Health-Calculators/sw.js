const CACHE_NAME = 'healthcalc-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install Event: Files ko browser cache mein save karna
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch Event: Agar internet nahi hai, toh cache se file return karna
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache mein file mili toh wahi de do, warna network se fetch karo
                return response || fetch(event.request);
            })
    );
});