/**
 * ICARUS v5.0 - Service Worker
 * 
 * Implementa funcionalidades PWA:
 * - Cache de assets estáticos
 * - Modo offline para consultas
 * - Sincronização em background
 * - Push notifications
 * 
 * @version 1.0.0
 */

const CACHE_NAME = 'icarus-v5-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets para cache estático (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Rotas que podem funcionar offline
const OFFLINE_ROUTES = [
  '/dashboard',
  '/cirurgias-procedimentos',
  '/estoque-ia',
  '/gestao-cadastros',
];

// APIs que devem ser cacheadas com network-first
const API_ROUTES = [
  '/api/',
  'supabase.co',
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching app shell:', error);
      })
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estratégia para APIs: Network First
  if (API_ROUTES.some(route => url.href.includes(route))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estratégia para assets estáticos: Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estratégia para navegação: Network First com fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }
  
  // Default: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ============ ESTRATÉGIAS DE CACHE ============

/**
 * Cache First: Busca primeiro no cache, depois na rede
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First: Busca primeiro na rede, depois no cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale While Revalidate: Retorna cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Handler para navegação com suporte offline
 */
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation offline, serving cached page...');
    
    // Tentar retornar a página específica do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }
    
    // Último recurso: página de erro simples
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ICARUS - Offline</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0B0D16;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
          }
          .container {
            padding: 2rem;
          }
          h1 { color: #6366F1; }
          p { color: #94A3B8; }
          button {
            background: #6366F1;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔌 Você está offline</h1>
          <p>Verifique sua conexão com a internet e tente novamente.</p>
          <button onclick="location.reload()">Tentar Novamente</button>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// ============ HELPERS ============

/**
 * Verifica se é um asset estático
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// ============ PUSH NOTIFICATIONS ============
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'ICARUS',
    body: 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'icarus-notification',
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    requireInteraction: data.requireInteraction || false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============ NOTIFICATION CLICK ============
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tentar focar em uma janela existente
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Abrir nova janela se não houver nenhuma
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============ BACKGROUND SYNC ============
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
  
  if (event.tag === 'sync-offline-surgeries') {
    event.waitUntil(syncOfflineSurgeries());
  }
});

/**
 * Sincroniza dados pendentes quando online
 */
async function syncPendingData() {
  try {
    // Abrir IndexedDB e buscar dados pendentes
    const db = await openIndexedDB();
    const pendingData = await getAllPendingData(db);
    
    for (const item of pendingData) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          await deletePendingData(db, item.id);
          console.log('[SW] Synced pending data:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync item:', item.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Sincroniza cirurgias registradas offline
 */
async function syncOfflineSurgeries() {
  console.log('[SW] Syncing offline surgeries...');
  // Implementação específica para sincronização de cirurgias
}

// ============ INDEXED DB HELPERS ============

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('icarus-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-sync', 'readonly');
    const store = transaction.objectStore('pending-sync');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingData(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-sync', 'readwrite');
    const store = transaction.objectStore('pending-sync');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ PERIODIC SYNC ============
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'check-alerts') {
    event.waitUntil(checkAlerts());
  }
  
  if (event.tag === 'update-stock-cache') {
    event.waitUntil(updateStockCache());
  }
});

async function checkAlerts() {
  console.log('[SW] Checking for new alerts...');
  // Verificar alertas pendentes e notificar
}

async function updateStockCache() {
  console.log('[SW] Updating stock cache...');
  // Atualizar cache de estoque para consulta offline
}

console.log('[SW] ICARUS Service Worker loaded');

