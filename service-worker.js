// === JEIGHOST.LAT SERVICE WORKER v10.0 MEJORADO ===
// Autor: Jeison Gonzalez — Optimizado por Claude
// Fecha: 2025-11-16

// -- CONFIGURACIÓN --
const VERSION = 'v12';
const CACHE_STATIC  = `el-rincon-static-${VERSION}`;
const CACHE_DYNAMIC = `el-rincon-dynamic-${VERSION}`;
const CACHE_IMAGES  = `el-rincon-images-${VERSION}`;
const MAX_DYNAMIC_ITEMS = 50; // Límite de items en caché dinámico
const MAX_IMAGE_ITEMS = 30;   // Límite de imágenes

// -- RECURSOS ESTÁTICOS CRÍTICOS --
const STATIC_ASSETS = [
  // HTML principal (para offline)
  '/',
  '/index.html',
  
  // CSS
  '/styles.css',
  '/style.css',
  '/features.css',
  '/visual-enhancements.css',
  '/app-native-features.css',
  '/menu-mejorado.css',
  '/header-optimizado.css',
  '/rosa-animada.css',
  '/splash-screen.css',
  
  // JavaScript
  '/menu.js',
  '/advanced-features.js',
  '/features.js',
  '/app-native-features.js',
  '/install.js',
  '/notifications.js',
  '/auto-notifications.js',
  '/particles.js',
  '/favoritos.js',
  '/analytics.js',
  '/autoplay-reflexiones.js',
  
  // Iconos
  '/jeighost-icons-pack/icon-72x72.png',
  '/jeighost-icons-pack/icon-96x96.png',
  '/jeighost-icons-pack/icon-128x128.png',
  '/jeighost-icons-pack/icon-144x144.png',
  '/jeighost-icons-pack/icon-192x192.png',
  '/jeighost-icons-pack/icon-256x256.png',
  '/jeighost-icons-pack/icon-384x384.png',
  '/jeighost-icons-pack/icon-512x512.png',
  '/jeighost-icons-pack/maskable-icon-512x512.png',
  '/favicon.ico',
  
  // Manifest
  '/manifest.json'
];

// -- PÁGINAS HTML PARA PRECARGA --
const HTML_PAGES = [
  '/reflexiones/',
  '/galeria/',
  '/sobre-mi/',
  '/videos/',
  '/reflexion1/',
  '/reflexion2/',
  '/reflexion3/',
  '/reflexion4/',
  '/reflexion5/',
  '/reflexion6',
  '/reflexion7',
  '/reflexion8/',
  '/reflexion9/',
  '/reflexion10/',
  '/reflexion11/',
  '/reflexion12/',
  '/reflexion13/',
  '/reflexion14/',
  '/reflexion15/',
  '/reflexion16/',
  '/reflexion17/',
  '/reflexion18/',
  '/reflexion19/',
  '/reflexion20'
];

// -- UTILIDADES --
const isNavigationRequest = (req) =>
  req.mode === 'navigate' || 
  (req.method === 'GET' && (req.headers.get('accept') || '').includes('text/html'));

const isImageRequest = (req) => {
  const url = new URL(req.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
};

// Limitar tamaño de caché
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Borrar los más viejos
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(key => cache.delete(key)));
    console.log(`[SW] Limpieza de ${cacheName}: ${toDelete.length} items eliminados`);
  }
}

// -- INSTALL: Precarga de recursos críticos --
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando v12...');
  
  event.waitUntil(
    Promise.all([
      // Cachear recursos estáticos
      caches.open(CACHE_STATIC).then(async (cache) => {
        console.log('[SW] Cacheando recursos estáticos...');
        try {
          await cache.addAll(STATIC_ASSETS);
          console.log('[SW] ✓ Recursos estáticos cacheados');
        } catch (error) {
          console.error('[SW] Error cacheando estáticos:', error);
          // Intentar uno por uno
          for (const asset of STATIC_ASSETS) {
            try {
              await cache.add(asset);
            } catch (e) {
              console.warn('[SW] No se pudo cachear:', asset);
            }
          }
        }
      }),
      
      // Precachear páginas HTML importantes
      caches.open(CACHE_DYNAMIC).then(async (cache) => {
        console.log('[SW] Precacheando páginas HTML...');
        for (const page of HTML_PAGES) {
          try {
            await cache.add(page);
          } catch (e) {
            console.warn('[SW] No se pudo precachear:', page);
          }
        }
      })
    ])
  );
  
  self.skipWaiting();
});

// -- ACTIVATE: Limpieza de cachés antiguos --
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando v12...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('el-rincon-') && 
                   cacheName !== CACHE_STATIC && 
                   cacheName !== CACHE_DYNAMIC &&
                   cacheName !== CACHE_IMAGES;
          })
          .map((cacheName) => {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] ✓ Activado y cachés limpios');
      return self.clients.claim();
    })
  );
});

// -- ESTRATEGIAS DE CACHÉ --

// Network First con timeout y fallback robusto
async function networkFirstStrategy(request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Cachear la respuesta exitosa
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, buscando en caché:', request.url);
    
    // Buscar en caché
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es navegación, devolver index.html
    if (isNavigationRequest(request)) {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        return indexCache;
      }
    }
    
    // Último recurso: página offline
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin conexión - Jeighost.lat</title>
        <style>
          body {
            font-family: 'Crimson Pro', serif;
            background: #0b0b0c;
            color: #d4af37;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
            padding: 2rem;
          }
          h1 { font-family: 'Cinzel', serif; font-size: 2rem; margin-bottom: 1rem; }
          p { color: #999; line-height: 1.6; }
          button {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: #d4af37;
            color: #0b0b0c;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>📡 Sin conexión</h1>
          <p>No hay conexión a internet en este momento.</p>
          <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
          <button onclick="window.location.reload()">Reintentar</button>
        </div>
      </body>
      </html>`,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html; charset=utf-8',
        }),
      }
    );
  }
}

// Cache First con actualización en segundo plano
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Actualizar en segundo plano
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {}); // Silenciar errores de actualización
    
    return cachedResponse;
  }
  
  // Si no está en caché, ir a la red
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      cache.put(request, response.clone());
      
      // Limitar tamaño del caché
      limitCacheSize(cacheName, cacheName === CACHE_IMAGES ? MAX_IMAGE_ITEMS : MAX_DYNAMIC_ITEMS);
    }
    return response;
  } catch (error) {
    console.log('[SW] No se pudo obtener:', request.url);
    throw error;
  }
}

// -- FETCH: Enrutamiento inteligente --
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar GET requests
  if (request.method !== 'GET') return;
  
  // Ignorar URLs de extensiones de navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // 1. Navegaciones HTML: Network First
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // 2. Imágenes: Cache First
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_IMAGES));
    return;
  }
  
  // 3. Recursos del mismo origen: Cache First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstStrategy(request, CACHE_DYNAMIC));
    return;
  }
  
  // 4. Recursos de terceros (CDN): Network First con caché
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const cache = caches.open(CACHE_DYNAMIC);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// -- NOTIFICACIONES PUSH --
self.addEventListener('push', (event) => {
  let data = { title: 'Jeighost.lat', body: 'Nueva reflexión disponible' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body || 'Nueva reflexión disponible',
    icon: '/jeighost-icons-pack/icon-192x192.png',
    badge: '/jeighost-icons-pack/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    tag: 'jeighost-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: '📖 Leer ahora', icon: '/jeighost-icons-pack/icon-192x192.png' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Jeighost.lat', options)
  );
});

// -- CLICK EN NOTIFICACIÓN --
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Buscar ventana existente
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Abrir nueva ventana
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// -- MENSAJES DEL CLIENTE --
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Comando para limpiar cachés
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('el-rincon-'))
            .map(name => caches.delete(name))
        );
      }).then(() => {
        console.log('[SW] Cachés limpiados');
      })
    );
  }
  
  // Obtener info de cachés
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      Promise.all([
        caches.open(CACHE_STATIC).then(c => c.keys()),
        caches.open(CACHE_DYNAMIC).then(c => c.keys()),
        caches.open(CACHE_IMAGES).then(c => c.keys())
      ]).then(([staticKeys, dynamicKeys, imageKeys]) => {
        event.ports[0].postMessage({
          static: staticKeys.length,
          dynamic: dynamicKeys.length,
          images: imageKeys.length,
          total: staticKeys.length + dynamicKeys.length + imageKeys.length
        });
      })
    );
  }
});

// -- SINCRONIZACIÓN EN SEGUNDO PLANO --
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(
      // Actualizar contenido cuando vuelva la conexión
      caches.open(CACHE_DYNAMIC).then(cache => {
        return cache.keys().then(requests => {
          return Promise.all(
            requests.map(request => {
              return fetch(request)
                .then(response => {
                  if (response && response.status === 200) {
                    return cache.put(request, response);
                  }
                })
                .catch(() => {});
            })
          );
        });
      })
    );
  }
});

console.log('%c[SW] 🚀 Jeighost.lat v12 MEJORADO activo', 'color: gold; font-weight: bold; font-size: 14px;');
console.log('[SW] Estrategias: Network First (HTML) | Cache First (Assets/Imágenes)');
console.log('[SW] Límites: Dinámico=' + MAX_DYNAMIC_ITEMS + ' | Imágenes=' + MAX_IMAGE_ITEMS);