/**
 * CRITICAL PWA UPDATE RULE:
 * Always increment the CACHE_NAME version (e.g., 'healthcalc-v1' -> 'healthcalc-v2') before pushing new changes.
 * The Service Worker relies on this version change to detect updates, clear the old cache, and fetch the new code.
 * If you do not update this version, the app will continue serving outdated offline files to users.
 */

const CACHE_NAME = 'healthcalc-v4.0'; // ✅ Incremented to v4.0

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

// ✅ NEW: Listen for messages from the page to update
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch Event: Navigate requests ko network-first use karo, baaki assets pe cache-first
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    if (request.mode === 'navigate') {
        // ✅ FIX: Always try network first, with proper fallback chain
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Only cache successful responses
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, copy);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline fallback - serve cached version
                    return caches.match(request)
                        .then(cached => cached || caches.match('./index.html'))
                        .catch(() => {
                            // ✅ Better offline fallback
                            return new Response(
                                '<h1>Offline</h1><p>Please check your internet connection and try again.</p>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                })
        );
        return;
    }

    // For static assets (CSS, JS, images): Network-first with cache fallback
    // ✅ CHANGED: Was cache-first, now network-first for ALL files
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, copy);
                    });
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});