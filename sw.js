const CACHE = 'offshore-scale-v2';

const ARQUIVOS = [
  '/',
  '/index.html',
  '/calendario.html',
  '/style.css',
  '/calendario.css',
  '/calculos.js',
  '/cal-embarque.js',
  '/cal-consulta.js',
  '/calculo.js',
  '/perfis.js',
  '/consulta.js',
  '/calendario.js',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  // HTML sempre da rede (fallback cache se offline)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Assets (CSS, JS, imagens) cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
