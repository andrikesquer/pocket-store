// Nombres de las caches (cambiar la version para forzar actualizacion)
const CACHE_SHELL = 'pocketstore-shell-v1';
const CACHE_DATOS = 'pocketstore-datos-v1';

// Archivos del App Shell
const ARCHIVOS_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// INSTALL: se guarda el App Shell en cache
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache => cache.addAll(ARCHIVOS_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: se borran caches viejas
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(nombres => {
      return Promise.all(
        nombres
          .filter(nombre => nombre !== CACHE_SHELL && nombre !== CACHE_DATOS)
          .map(nombre => caches.delete(nombre))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: interceptar peticiones
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Peticiones a la API -> primero red, si falla se usa la cache
  if (url.hostname === 'jsonplaceholder.typicode.com') {
    event.respondWith(
      fetch(event.request)
        .then(respuesta => {
          const copia = respuesta.clone();
          caches.open(CACHE_DATOS).then(cache => cache.put(event.request, copia));
          return respuesta;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Archivos del App Shell -> primero cache, si no esta se va a la red
  event.respondWith(
    caches.match(event.request).then(respuestaCache => {
      return respuestaCache || fetch(event.request);
    })
  );
});
