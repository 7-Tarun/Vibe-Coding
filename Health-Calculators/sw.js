/* 
 * CRITICAL PWA UPDATE RULE:
 * Always increment the CACHE_NAME version (e.g., 'healthcalc-v1' -> 'healthcalc-v2') before pushing new changes.
 * The Service Worker relies on this version change to detect updates, clear the old cache, and fetch the new code.
 * If you do not update this version, the app will continue serving outdated offline files to users.
 */

const CACHE_NAME = 'healthcalc-v3.1';
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
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activate Event: Purane cache ko remove karo aur naye service worker ko turant activate karo
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Navigate requests ko network-first use karo, baaki assets pe cache-first
self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match('./'))
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
    );
});