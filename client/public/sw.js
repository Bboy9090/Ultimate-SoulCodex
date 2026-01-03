// ═══════════════════════════════════════════════════════════════════════════
// SOUL CODEX - SERVICE WORKER
// Production-Ready PWA with Offline Support
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v2';
const CACHE_NAME = `soul-codex-${CACHE_VERSION}`;
const RUNTIME_CACHE = `soul-codex-runtime-${CACHE_VERSION}`;
const API_CACHE = `soul-codex-api-${CACHE_VERSION}`;

// Assets to precache for offline support
const PRECACHE_URLS = [
  '/',
  '/manifest.json'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000,  // 7 days for static assets
  api: 5 * 60 * 1000,               // 5 minutes for API responses
  fonts: 30 * 24 * 60 * 60 * 1000   // 30 days for fonts
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(PRECACHE_URLS).catch(err => {
          console.error('Failed to cache some URLs during install:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (url.origin !== self.location.origin) {
    return;
  }
  
  if (request.method !== 'GET') {
    return;
  }
  
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - API request failed' }),
          { headers: { 'Content-Type': 'application/json' }, status: 503 }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Soul Codex';
  const options = {
    body: data.body || 'How is your frequency in this moment?',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'ema-notification',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'log',
        title: 'Log Now'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'log') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/life-current')
    );
  } else if (event.action === 'dismiss') {
    return;
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
