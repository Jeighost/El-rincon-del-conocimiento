// ============================================
// SERVICE WORKER MEJORADO - El rincón del conocimiento
// ============================================

const CACHE_NAME = 'el-rincon-v6.5';
const CACHE_DYNAMIC = 'el-rincon-dynamic-v6.5';
const BASE_PATH = '/El-rincon-del-conocimiento';

// Recursos críticos para cachear en instalación
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/galeria.html`,
  `${BASE_PATH}/reflexiones.html`,
  `${BASE_PATH}/sobre-mi.html`,
  `${BASE_PATH}/reflexion1.html`,
  `${BASE_PATH}/reflexion2.html`,
  `${BASE_PATH}/reflexion3.html`,
  `${BASE_PATH}/reflexion4.html`,
  `${BASE_PATH}/reflexion5.html`,
  `${BASE_PATH}/reflexion6.html`,
  `${BASE_PATH}/reflexion7.html`,
  `${BASE_PATH}/reflexion8.html`,
  `${BASE_PATH}/reflexion9.html`,
  `${BASE_PATH}/reflexion10.html`,
  `${BASE_PATH}/reflexion11.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/menu-mejorado.css`,
  `${BASE_PATH}/header-optimizado.css`,
  `${BASE_PATH}/features.css`,
  `${BASE_PATH}/splash-screen.css`,
  `${BASE_PATH}/particles.js`,
  `${BASE_PATH}/menu.js`,
  `${BASE_PATH}/features.js`,
  `${BASE_PATH}/favoritos.js`,
  `${BASE_PATH}/advanced-features.js`,
  `${BASE_PATH}/install.js`,
  `${BASE_PATH}/notifications.js`,
  `${BASE_PATH}/analytics.js`,
  `${BASE_PATH}/auto-update.js`,
  `${BASE_PATH}/auto-notifications.js`,
  `${BASE_PATH}/reflexiones.js`,
  `${BASE_PATH}/lectura.js`,
  `${BASE_PATH}/favicon.svg`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`,
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Pro:wght@300;400&display=swap',
  'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Playfair+Display:wght@600&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache abierto');
        // Cachear en paralelo con Promise.allSettled para no fallar si algún recurso falla
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ No se pudo cachear: ${url}`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Recursos críticos cacheados');
      })
  );
  
  self.skipWaiting();
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== CACHE_DYNAMIC) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
  console.log('✅ Service Worker activado');
});

// Estrategia de fetch híbrida
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no son HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar peticiones a analytics y APIs externas
  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('doubleclick.net')) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

// Función principal de manejo de peticiones
async function handleFetch(request) {
  const url = new URL(request.url);
  
  // Estrategia Cache First para recursos estáticos
  if (isCacheFirstResource(url)) {
    return cacheFirst(request);
  }
  
  // Estrategia Network First para reflexiones (contenido dinámico)
  if (url.pathname.includes('reflexion')) {
    return networkFirst(request);
  }
  
  // Estrategia Stale While Revalidate para páginas principales
  return staleWhileRevalidate(request);
}

// Determinar si un recurso debe usar Cache First
function isCacheFirstResource(url) {
  const extensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2'];
  return extensions.some(ext => url.pathname.endsWith(ext)) || 
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

// Estrategia: Cache First (para recursos estáticos)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Error en Cache First:', error);
    return new Response('Recurso no disponible offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Estrategia: Network First (para contenido dinámico)
async function networkFirst(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback a página offline
    const offlinePage = await cache.match(`${BASE_PATH}/index.html`);
    return offlinePage || new Response('Contenido no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estrategia: Stale While Revalidate (para páginas)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('Error en fetch:', error);
      return null;
    });
  
  return cached || fetchPromise || new Response('Contenido no disponible', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('🔔 Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva reflexión disponible',
    icon: `${BASE_PATH}/icon-192.png`,
    badge: `${BASE_PATH}/icon-96.png`,
    vibrate: [200, 100, 200],
    tag: 'new-reflection',
    requireInteraction: false,
    data: {
      url: `${BASE_PATH}/reflexiones.html`,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'explore', title: 'Leer ahora', icon: `${BASE_PATH}/icon-96.png` },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('El Rincón del Conocimiento', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data.url || `${BASE_PATH}/reflexiones.html`;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Buscar ventana existente
          for (let client of windowClients) {
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

// Limpiar caches viejos periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== CACHE_DYNAMIC) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

console.log('✅ Service Worker cargado correctamente');