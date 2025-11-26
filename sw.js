const CACHE_NAME = "fireguard-cache-v1.0.7";

const ASSETS = [
    "/site-2.0/",
    "/site-2.0/index.html",
    "/site-2.0/app.js",
    "/site-2.0/manifest.json",
    "/site-2.0/icon-192.png",
    "/site-2.0/icon-512.png",

    "/site-2.0/images/gorenie-1.jpg",
    "/site-2.0/images/fire.jpg",
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

// FETCH
self.addEventListener("fetch", event => {
    const request = event.request;

    //  Картинки — Cache First 
    if (request.destination === "image") {
        event.respondWith(
            (async () => {
                const cache = await caches.open("images-cache");
                const cached = await cache.match(request);

                if (cached) return cached; // уже есть в кеше

                try {
                    const network = await fetch(request);
                    cache.put(request, network.clone()); // сохранить картинку
                    return network;
                } catch (e) {
                    return cached || Response.error();
                }
            })()
        );
        return; // важный момент! дальше не идём
    }

    // Всё остальное — ваш network-first 
    event.respondWith(
        (async () => {
            try {
                const network = await fetch(request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, network.clone());
                return network;
            } catch {
                return caches.match(request);
            }
        })()
    );
});








