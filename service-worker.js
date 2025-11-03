// ============================================
// SERVICE WORKER - El rincón del conocimiento
// ============================================

const CACHE_NAME = 'el-rincon-v2';
const urlsToCache = [
  '/El-rincon-del-conocimiento/',
  '/El-rincon-del-conocimiento/index.html',
  '/El-rincon-del-conocimiento/galeria.html',
  '/El-rincon-del-conocimiento/reflexiones.html',
  '/El-rincon-del-conocimiento/reflexion1.html',
  '/El-rincon-del-conocimiento/reflexion2.html',
  '/El-rincon-del-conocimiento/reflexion3.html',
  '/El-rincon-del-conocimiento/reflexion4.html',
  '/El-rincon-del-conocimiento/reflexion5.html',
  '/El-rincon-del-conocimiento/reflexion6.html',
  '/El-rincon-del-conocimiento/reflexion7.html',
  '/El-rincon-del-conocimiento/style.css',
  '/El-rincon-del-conocimiento/particles.js',
  '/El-rincon-del-conocimiento/reflexiones.js',
  '/El-rincon-del-conocimiento/lectura.js',
  '/El-rincon-del-conocimiento/install.js',
  '/El-rincon-del-conocimiento/favicon.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, devolver del cache
        if (response) {
          return response;
        }

        // Si no, hacer petición a la red
        return fetch(event.request).then((response) => {
          // Si la respuesta no es válida, devolverla sin cachear
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          // Guardar en cache para futuras peticiones
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Si falla todo, mostrar página offline personalizada (opcional)
        return caches.match('/El-rincon-del-conocimiento/index.html');
      })
  );
});