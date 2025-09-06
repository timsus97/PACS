// Clinton Medical PACS Service Worker
// Provides offline support and caching for the PACS system

const CACHE_NAME = 'clinton-pacs-v1';
const urlsToCache = [
    '/',
    '/config/app-config.js',
    '/config/customizations.js',
    '/config/custom-styles.css',
    '/app.bundle.js',
    '/app.bundle.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.log('❌ Cache failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(function() {
                // Fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});