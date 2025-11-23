// Регистрация Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/site-2.0/sw.js").then(reg => {

        // Срабатывает, когда найден новый SW
        reg.onupdatefound = () => {
            const newWorker = reg.installing;

            newWorker.onstatechange = () => {
                if (newWorker.state === "installed") {

                    // Если есть активный SW — значит это обновление
                    if (navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                }
            };
        };
    });

    // Принимаем сообщение от SW
    navigator.serviceWorker.addEventListener("message", event => {
        if (event.data?.type === "NEW_VERSION") {
            showUpdateBanner();
        }
    });
}

// Показываем баннер обновления
function showUpdateBanner() {
    const banner = document.getElementById("update-banner");
    banner.style.display = "flex";

    document.getElementById("update-btn").addEventListener("click", () => {
        window.location.reload();
    });
}
