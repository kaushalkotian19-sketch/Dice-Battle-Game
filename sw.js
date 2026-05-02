// Bumped version to v5.2 to force a fresh install!
const CACHE_NAME = 'dice-battle-v5.2';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './assets/red-dice.png',
    './assets/green-dice.png' 
];

// 1. Install & Cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting())
    );
});

// 2. Clear Old Caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. Intercept Fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
