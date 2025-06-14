// Mahara PWA Service Worker
const CACHE_NAME = 'mahara-v1.0.0';
const STATIC_CACHE = 'mahara-static-v1.0.0';
const DYNAMIC_CACHE = 'mahara-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/rtl.css',
    '/js/config.js',
    '/js/translations.js',
    '/js/api.js',
    '/js/auth.js',
    '/js/main.js',
    '/images/logo.png',
    '/images/default-avatar.png',
    '/images/default-service.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/categories/,
    /\/api\/services\/featured/,
    /\/api\/auth\/verify/
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
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files', error);
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
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // For API requests, try to fetch fresh data in background
                    if (isAPIRequest(request)) {
                        fetchAndCache(request);
                    }
                    return cachedResponse;
                }

                // Fetch from network
                return fetchAndCache(request);
            })
            .catch(() => {
                // Network failed, try to serve offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                
                // For other requests, return a generic offline response
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Fetch and cache helper function
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // Don't cache if response is not ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response
            const responseToCache = response.clone();
            const cacheName = isAPIRequest(request) ? DYNAMIC_CACHE : STATIC_CACHE;

            // Cache the response
            caches.open(cacheName)
                .then((cache) => {
                    cache.put(request, responseToCache);
                });

            return response;
        });
}

// Check if request is an API request
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || 
           API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Background sync implementation
function doBackgroundSync() {
    // Get pending actions from IndexedDB and sync them
    return new Promise((resolve) => {
        console.log('Service Worker: Performing background sync');
        // Implementation would sync offline actions when connection is restored
        resolve();
    });
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from Mahara',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/images/icons/view-24x24.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/icons/close-24x24.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Mahara', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.payload);
                })
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered', event.tag);
    
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

// Sync content in background
function syncContent() {
    return fetch('/api/sync')
        .then((response) => response.json())
        .then((data) => {
            console.log('Service Worker: Content synced', data);
            // Update cached content
            return caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    // Update cache with fresh content
                    return cache.addAll(data.urls || []);
                });
        })
        .catch((error) => {
            console.error('Service Worker: Content sync failed', error);
        });
}

// Handle app updates
self.addEventListener('appinstalled', (event) => {
    console.log('Service Worker: App installed successfully');
    
    // Track app installation
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('app-installed');
        });
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Loaded successfully');

