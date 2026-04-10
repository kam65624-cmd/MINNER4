/* Unity WebGL Service Worker
 * SAFE version:
 * - Caches ONLY GET requests
 * - Caches ONLY same-origin files
 * - Never touches POST / analytics / ads
 */

const cacheVersion = "2.55.0";
const cacheName = `madkidgames.com-Idle Miner Tycoon Gold Games-v${cacheVersion}`;

const contentToCache = [
    "Build/7a2dbded24d57e056180125b1583e7c4.loader.js",
    "Build/3dd916af06751e3ff7a2e5465f923ab9.framework.js",
    "Build/a784a61709b0b544bd101d48884d318e.data",
    "Build/b7cfc881bfd42a78a34e059c96be3c12.wasm",
    "TemplateData/style.css",
    "thumb_2.jpg"
];

// --------------------------------------------------
// INSTALL
// --------------------------------------------------
self.addEventListener("install", (event) => {
    console.log("[ServiceWorker] Install");
    self.skipWaiting();

    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("[ServiceWorker] Caching app shell");
            return cache.addAll(contentToCache);
        })
    );
});

// --------------------------------------------------
// ACTIVATE
// --------------------------------------------------
self.addEventListener("activate", (event) => {
    console.log("[ServiceWorker] Activate");
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== cacheName) {
                        console.log("[ServiceWorker] Deleting old cache:", key);
                        return caches.delete(key);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

// --------------------------------------------------
// FETCH (CRITICAL FIX HERE)
// --------------------------------------------------
self.addEventListener("fetch", (event) => {

    // ✅ ONLY cache GET requests
    if (event.request.method !== "GET") {
        return;
    }

    // ✅ Ignore cross-origin requests (ads, analytics, Unity telemetry)
    const requestURL = new URL(event.request.url);
    if (requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // Try cache first
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Fetch from network
                const networkResponse = await fetch(event.request);

                // Cache successful responses only
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(cacheName);
                    await cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (err) {
                console.error("[ServiceWorker] Fetch failed:", event.request.url, err);
                return new Response("Offline", {
                    status: 503,
                    statusText: "Service Unavailable"
                });
            }
        })()
    );
});