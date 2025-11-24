const CACHE_NAME = "fireguard-cache-v1.0.2";

const ASSETS = [
    "/site-2.0/",
    "/site-2.0/index.html",
    "/site-2.0/app.js",
    "/site-2.0/manifest.json",
    "/site-2.0/icon-192.png",
    "/site-2.0/icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );

            const clients = await self.clients.matchAll({ includeUncontrolled: true });
            for (const client of clients) {
                client.postMessage({ type: "NEW_VERSION" });
            }

            await self.clients.claim();
        })()
    );
});

// FETCH — network-first
self.addEventListener("fetch", event => {
    event.respondWith(
        (async () => {
            try {
                const network = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, network.clone());
                return network;
            } catch {
                return caches.match(event.request);
            }
        })()
    );
});


