// === JEIGHOST.LAT SERVICE WORKER v8.1 ===
// Autor: Jeison Gonzalez — Ajustado
// Fecha: 2025-11

// -- NOMBRES DE CACHÉ --
const VERSION = 'v9.0';
const CACHE_STATIC  = `el-rincon-static-${VERSION}`;
const CACHE_DYNAMIC = `el-rincon-dynamic-${VERSION}`;

// -- RECURSOS ESTÁTICOS (no HTML/navegaciones) --
const STATIC_ASSETS = [
  '/style.css',
  '/features.css',
  '/menu-mejorado.css',
  '/header-optimizado.css',
  '/rosa-animada.css',
  '/menu.js',
  '/advanced-features.js',
  '/features.js',
  '/install.js',
  '/notifications.js',
  '/auto-notifications.js',
  '/jeighost-icons-pack/icon-72x72.png',
  '/jeighost-icons-pack/icon-96x96.png',
  '/jeighost-icons-pack/icon-128x128.png',
  '/jeighost-icons-pack/icon-144x144.png',
  '/jeighost-icons-pack/icon-192x192.png',
  '/jeighost-icons-pack/icon-256x256.png',
  '/jeighost-icons-pack/icon-384x384.png',
  '/jeighost-icons-pack/icon-512x512.png',
  '/jeighost-icons-pack/favicon.ico',
  '/jeighost-icons-pack/maskable-icon-512x512.png'
];

// -- INSTALL: precache estáticos (sin HTML) --
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// -- ACTIVATE: limpiar versiones antiguas --
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Utilidades
const isNavigationRequest = (req) =>
  req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

async function networkFirstForHTML(event) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(event.request, { signal: ctrl.signal });
    clearTimeout(t);
    // No cacheamos HTML en dev para evitar staleness
    return res;
  } catch (err) {
    // Fallback: intenta una versión estática del index si la tienes cacheada
    const cachedIndex = await caches.match('/index.html');
    return cachedIndex || new Response('Sin conexión', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidateForAsset(event) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await caches.match(event.request);
  const fetchPromise = fetch(event.request)
    .then((res) => {
      // Evitar cachear respuestas inválidas
      if (res && res.status === 200 && res.type !== 'opaque') {
        cache.put(event.request, res.clone());
      }
      return res;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// -- FETCH: rutas diferenciadas --
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // deja pasar POST/PUT etc.

  if (isNavigationRequest(request)) {
    // Navegaciones (HTML): network first
    event.respondWith(networkFirstForHTML(event));
  } else if (new URL(request.url).origin === self.location.origin) {
    // Mismo origen: SWR para estáticos
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // actualizar en segundo plano
          event.waitUntil(
            fetch(request)
              .then((res) => {
                if (res && res.status === 200 && res.type !== 'opaque') {
                  return caches.open(CACHE_DYNAMIC).then((c) => c.put(request, res.clone()));
                }
              })
              .catch(() => {})
          );
          return cached;
        }
        return fetch(request)
          .then((res) => {
            if (res && res.status === 200 && res.type !== 'opaque') {
              return caches.open(CACHE_DYNAMIC).then((c) => {
                c.put(request, res.clone());
                return res;
              });
            }
            return res;
          })
          .catch(() => caches.match(request));
      })
    );
  } else {
    // Terceros: ir a red con fallback a caché si ya existe
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});

// -- PUSH --
self.addEventListener('push', (event) => {
  const body = event.data ? event.data.text() : 'Nueva notificación desde Jeighost.lat';
  const options = {
    body,
    icon: '/jeighost-icons-pack/icon-192x192.png',
    badge: '/jeighost-icons-pack/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
    actions: [
      { action: 'explore', title: 'Leer ahora', icon: '/jeighost-icons-pack/icon-192x192.png' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  event.waitUntil(self.registration.showNotification('Jeighost.lat', options));
});

// -- CLICK EN NOTIFICACIÓN --
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientsArr) => {
        for (const c of clientsArr) {
          if (c.url.endsWith('/') || c.url.endsWith('/index.html')) {
            return c.focus();
          }
        }
        return clients.openWindow('/');
      })
    );
  }
});

// -- MENSAJES (skip waiting) --
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

console.log('%c[SW] Jeighost.lat v9.0 activo', 'color: gold; font-weight: bold;');