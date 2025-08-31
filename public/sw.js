const CACHE_NAME = 'cattle-breed-identification-v1.0.0';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const API_CACHE = 'api-cache-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index-CWAGvKiL.css',
  '/assets/browser-ponyfill-2Eg6Xrn4.js',
  '/assets/index-CWAGvKiL.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/breeds',
  '/api/photos',
  '/api/analytics',
  '/api/user/profile'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static files - cache first strategy
    if (isStaticFile(url.pathname)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // API requests - network first with cache fallback
    else if (isAPIRequest(url.pathname)) {
      event.respondWith(networkFirst(request, API_CACHE));
    }
    // Dynamic content - stale while revalidate
    else {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
  }
  // Handle POST requests for data submission
  else if (request.method === 'POST') {
    event.respondWith(handlePostRequest(request));
  }
});

// Cache first strategy for static files
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first error:', error);
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy for API requests
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline mode',
      message: 'Please check your internet connection'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Stale while revalidate strategy for dynamic content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cachedResponse || networkResponsePromise;
}

// Handle POST requests with background sync
async function handlePostRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('POST request failed, will retry when online:', error);
    
    // Store failed request for background sync
    const failedRequest = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.clone().text()
    };
    
    // Store in IndexedDB for background sync
    await storeFailedRequest(failedRequest);
    
    return new Response(JSON.stringify({
      error: 'Request queued for retry',
      message: 'Your request will be sent when you are back online'
    }), {
      status: 202,
      statusText: 'Accepted',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncFailedRequests());
  }
});

// Sync failed requests when back online
async function syncFailedRequests() {
  try {
    const failedRequests = await getFailedRequests();
    
    for (const failedRequest of failedRequests) {
      try {
        const response = await fetch(failedRequest.url, {
          method: failedRequest.method,
          headers: failedRequest.headers,
          body: failedRequest.body
        });
        
        if (response.ok) {
          await removeFailedRequest(failedRequest);
          console.log('Successfully synced failed request:', failedRequest.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New cattle breed identification data available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Cattle Breed Identification', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Helper functions
function isStaticFile(pathname) {
  return STATIC_FILES.some(file => pathname.includes(file)) ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg');
}

function isAPIRequest(pathname) {
  return API_ENDPOINTS.some(endpoint => pathname.includes(endpoint)) ||
         pathname.startsWith('/api/');
}

// IndexedDB operations for storing failed requests
async function storeFailedRequest(request) {
  return new Promise((resolve, reject) => {
    const requestDB = indexedDB.open('FailedRequestsDB', 1);
    
    requestDB.onerror = () => reject(requestDB.error);
    requestDB.onsuccess = () => {
      const db = requestDB.result;
      const transaction = db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');
      
      const addRequest = store.add({
        ...request,
        timestamp: Date.now()
      });
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    requestDB.onupgradeneeded = () => {
      const db = requestDB.result;
      if (!db.objectStoreNames.contains('failedRequests')) {
        db.createObjectStore('failedRequests', { keyPath: 'timestamp' });
      }
    };
  });
}

async function getFailedRequests() {
  return new Promise((resolve, reject) => {
    const requestDB = indexedDB.open('FailedRequestsDB', 1);
    
    requestDB.onerror = () => reject(requestDB.error);
    requestDB.onsuccess = () => {
      const db = requestDB.result;
      const transaction = db.transaction(['failedRequests'], 'readonly');
      const store = transaction.objectStore('failedRequests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removeFailedRequest(request) {
  return new Promise((resolve, reject) => {
    const requestDB = indexedDB.open('FailedRequestsDB', 1);
    
    requestDB.onerror = () => reject(requestDB.error);
    requestDB.onsuccess = () => {
      const db = requestDB.result;
      const transaction = db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');
      const deleteRequest = store.delete(request.timestamp);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');
