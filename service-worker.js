// ============================================
// SERVICE WORKER - El rincón del conocimiento
// ============================================

const CACHE_NAME = 'el-rincon-v7.0';
const CACHE_DYNAMIC = 'el-rincon-dynamic-v7.0';

// Recursos críticos para cachear en instalación
const urlsToCache = [
  '/',
  '/index.html',
  '/galeria.html',
  '/reflexiones.html',
  '/sobre-mi.html',
  '/reflexion1.html',
  '/reflexion2.html',
  '/reflexion3.html',
  '/reflexion4.html',
  '/reflexion5.html',
  '/reflexion6.html',
  '/reflexion7.html',
  '/reflexion8.html',
  '/reflexion9.html',
  '/reflexion10.html',
  '/reflexion11.html',
  '/reflexion12.html',
  '/style.css',
  '/menu-mejorado.css',
  '/header-optimizado.css',
  '/features.css',
  '/splash-screen.css',
  '/particles.js',
  '/menu.js',
  '/features.js',
  '/favoritos.js',
  '/advanced-features.js',
  '/install.js',
  '/notifications.js',
  '/analytics.js',
  '/auto-update.js',
  '/auto-notifications.js',
  '/reflexiones.js',
  '/lectura.js',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Pro:wght@300;400&display=swap',
  'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Playfair+Display:wght@600&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando v7.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache abierto');
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
  console.log('🔄 Service Worker: Activando v7.0...');
  
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
  console.log('✅ Service Worker v7.0 activado');
});

// Estrategia de fetch híbrida
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http')) {
    return;
  }

  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('doubleclick.net')) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  if (isCacheFirstResource(url)) {
    return cacheFirst(request);
  }
  
  if (url.pathname.includes('reflexion')) {
    return networkFirst(request);
  }
  
  return staleWhileRevalidate(request);
}

function isCacheFirstResource(url) {
  const extensions = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2'];
  return extensions.some(ext => url.pathname.endsWith(ext)) || 
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

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
    
    const offlinePage = await cache.match('/index.html');
    return offlinePage || new Response('Contenido no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

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

self.addEventListener('push', (event) => {
  console.log('🔔 Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva reflexión disponible',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'new-reflection',
    requireInteraction: false,
    data: {
      url: '/reflexiones.html',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'explore', title: 'Leer ahora', icon: '/icon-192.png' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('El Rincón del Conocimiento', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data.url || '/reflexiones.html';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

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

console.log('✅ Service Worker v7.0 cargado correctamente para jeighost.lat');