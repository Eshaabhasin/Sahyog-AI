const CACHE_NAME = 'sahyogai-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Skip caching in development mode
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (!isDevelopment) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache))
        .catch((error) => console.log('Cache failed:', error))
    );
  }
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip caching for development server resources
  if (isDevelopment && (
    event.request.url.includes('@vite') ||
    event.request.url.includes('@react-refresh') ||
    event.request.url.includes('?t=') ||
    event.request.url.includes('localhost:5173')
  )) {
    return;
  }

  // Skip caching for API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          if (!isDevelopment) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline page or cached content
        return caches.match('/');
      })
  );
});