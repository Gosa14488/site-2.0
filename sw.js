const CACHE_NAME = "fireguard-cache-v7";

const ASSETS = [
    "/site-2.0/",
    "/site-2.0/index.html",
    "/site-2.0/app.js",
    "/site-2.0/style.css",
    "/site-2.0/manifest.json",
    "/site-2.0/icon-192.png",
    "/site-2.0/icon-512.png"
];

// INSTALL — кешируем файлы
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // мгновенная установка SW
});

// ACTIVATE — очищаем старые кеши + уведомляем клиентов
self.addEventListener("activate", event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

            const clients = await self.clients.matchAll({ includeUncontrolled: true });
            for (const client of clients) {
                client.postMessage({ type: "NEW_VERSION" });
            }

            await self.clients.claim();
        })()
    );
});

// FETCH — обновляем файлы фоново
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            const fetchPromise = fetch(event.request)
                .then(network => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, network.clone());
                    });
                    return network;
                })
                .catch(() => cacheResponse);

            return cacheResponse || fetchPromise;
        })
    );
});





