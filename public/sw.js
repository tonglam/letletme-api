/* eslint-disable no-undef */
// Service Worker for LetLetMe API
const CACHE_NAME = 'letletme-api-cache-v1';
const ASSETS_TO_CACHE = [
    '/favicon.svg',
    'https://static.letletme.top/miniprogram.webp',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()),
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            return caches.delete(cacheName);
                        }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Special handling for the QR code image
    if (event.request.url.includes('miniprogram.webp')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network and cache
                return fetch(event.request)
                    .then((response) => {
                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        // Cache the new response
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, return a fallback
                        return new Response('Image not available', {
                            status: 404,
                        });
                    });
            }),
        );
    } else {
        // Standard cache-first strategy for other assets
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            }),
        );
    }
});
