// === JEIGHOST.LAT SERVICE WORKER v8.0 ===
// Autor: Jeison Gonzalez
// Descripción: Controlador de caché, red, notificaciones y PWA
// Fecha: Revisado y optimizado por ChatGPT (2025)

// --- NOMBRES DE CACHÉ ---
// Agregar al inicio
const CACHE_NAME = 'el-rincon-v7.1'; // ← Cambiar versión
const CACHE_DYNAMIC = 'el-rincon-dynamic-v7.1';

// Agregar estos recursos críticos primero
const CRITICAL_RESOURCES = [
  '/',
  '/style.css',
  '/features.css',
  '/menu.js',
  '/index.html',
  '/manifest.json',
  '/jeighost-icons-pack/icon-72x72.png',
  '/jeighost-icons-pack/icon-96x96.png',
  '/jeighost-icons-pack/icon-128x128.png',
  '/jeighost-icons-pack/icon-144x144.png',
  '/jeighost-icons-pack/icon-192x192.png:,
  '/jeighost-icons-pack/icon-256x256.png',
  '/jeighost-icons-pack/icon-384x384.png',
  '/jeighost-icons-pack/icon-512x512.png',
  '/jeighost-icons-pack/favicon.ico',
  '/jeighost-icons-pack/maskable-icon-512x512.png'
  '/jeighost-icons-pack/brain-gold.svg',
];

// En el evento install, priorizar recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cachear críticos primero
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        // Luego el resto
        return caches.open(CACHE_NAME)
          .then(cache => cache.addAll(urlsToCache));
      })
  );
  self.skipWaiting();
});

// --- ACTIVACIÓN Y LIMPIEZA DE CACHÉ ---
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando y limpiando versiones antiguas...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== CACHE_DYNAMIC)
          .map((key) => {
            console.log("[SW] Eliminando caché antigua:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// --- INTERCEPCIÓN DE FETCH ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Estrategia: cache first + actualización en segundo plano
        staleWhileRevalidate(request);
        return cachedResponse;
      }
      // Si no hay caché, intentamos desde red
      return fetchWithTimeout(request);
    })
  );
});

// --- FUNCIÓN AUXILIAR: staleWhileRevalidate ---
async function staleWhileRevalidate(request) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);
    const cache = await caches.open(CACHE_DYNAMIC);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.warn("[SW] Error en actualización:", error);
  }
}

// --- FUNCIÓN AUXILIAR: fetch con timeout ---
async function fetchWithTimeout(request, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (!response || response.status !== 200) throw new Error("Respuesta no válida");
    const cache = await caches.open(CACHE_DYNAMIC);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.warn("[SW] Error de red o timeout:", error);
    clearTimeout(timer);
    return caches.match(request);
  }
}

// --- PUSH NOTIFICATIONS ---
self.addEventListener("push", (event) => {
  let body = event.data ? event.data.text() : "Nueva notificación desde Jeighost.lat";
  const options = {
    body,
    icon: "/jeighost-icons-pack/icon-192x192.png",
    badge: "/jeighost-icons-pack/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: { url: "/" },
    actions: [
      {
        action: "explore",
        title: "Leer ahora",
        icon: "/jeighost-icons-pack/icon-192x192.png"
      },
      { action: "close", title: "Cerrar" }
    ]
  };
  event.waitUntil(self.registration.showNotification("Jeighost.lat", options));
});

// --- CLIC EN NOTIFICACIÓN ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "explore") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
    );
  }
});

// --- MENSAJES ENTRE PÁGINA Y SW ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// --- LOG FINAL ---
console.log("%c[SW] Jeighost.lat v8.0 cargado y optimizado", "color: gold; font-weight: bold;");