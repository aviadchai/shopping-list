const CACHE_SHOPPING = 'shopping-v8';
const CACHE_FITNESS = 'fitness-v1';

const SHELL_SHOPPING = ['./index.html', './manifest.json', './fitness-icon-192.png', './fitness-icon-512.png'];
const SHELL_FITNESS  = ['./deal.html', './deal-manifest.json', './fitness-icon-192.png', './fitness-icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_SHOPPING).then(c => c.addAll(SHELL_SHOPPING)),
      caches.open(CACHE_FITNESS).then(c => c.addAll(SHELL_FITNESS)),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  const keep = [CACHE_SHOPPING, CACHE_FITNESS];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        const cacheName = e.request.url.includes('deal') ? CACHE_FITNESS : CACHE_SHOPPING;
        caches.open(cacheName).then(cache => cache.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications (requires subscription from server)
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'דיל כושר', body: 'אל תשכח את האימון היומי!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './fitness-icon-192.png',
      badge: './fitness-icon-192.png',
      dir: 'rtl',
      lang: 'he',
    })
  );
});
