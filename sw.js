const CACHE_NAME = "fireguard-cache-v1";

const ASSETS = [
    "/site-2.0/",
    "./site-2.0/index.html",
    "/site-2.0/manifest.json",
    "/site-2.0/icon-192.png",
    "/site-2.0/icon-512.png",
    "/site-2.0/favicon.ico"
];

// Установка SW + кеширование
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); // сразу активирует новую версию
});

// Удаление старых кешей
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim(); // обновляет вкладки без перезагрузки
});

// Перехват запросов
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Если есть в кеше → отдать
            if (response) return response;

            // иначе — загрузить из сети и закешировать
            return fetch(event.request)
                .then(networkResp => {
                    return caches.open(CACHE_NAME).then(cache => {
                        // Кешируем только успешные ответы
                        if (networkResp.status === 200) {
                            cache.put(event.request, networkResp.clone());
                        }
                        return networkResp;
                    });
                })
                .catch(() => {
                    // Фолбек если офлайн и файла нет
                    return caches.match("./index.html");
                });
        })
    );
});

