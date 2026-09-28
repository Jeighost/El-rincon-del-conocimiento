// Service worker del sitio.
// La versión anterior guardaba CSS y JS en caché para siempre y los lectores
// no veían los cambios. Esta versión borra esas cachés viejas, no guarda nada
// y solo mantiene las notificaciones de nuevas reflexiones (OneSignal).
self.importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (nombres) {
        return Promise.all(nombres.map(function (n) { return caches.delete(n); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});
