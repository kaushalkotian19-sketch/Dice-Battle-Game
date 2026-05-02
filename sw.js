// Bumped version number to force browsers to fetch the updated assets
const CACHE_NAME = 'dice-battle-v5.1';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './assets/red-dice.png',
    './assets/Green-dice.png'
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

// 2. Clear Old Caches (This is crucial for the new images to be recognized)
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

// 3. Intercept Fetch (Required for PWA Install Prompt)
self.addEventListener('fetch', event => {
    // Only intercept basic GET requests to prevent errors with Firebase or external Ads
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached version if it exists, otherwise fetch from the network
            return response || fetch(event.request);
        })
    );
});
