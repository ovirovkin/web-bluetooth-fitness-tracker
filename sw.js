self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('mi-band-static').then(function(cache) {
            return cache.addAll([
                '/',
                'js/app.js',
                'js/miBand.js',
                'css/styles.css'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.delete('mi-band-static-v2')
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request)
        })
    );
});

// 404 and offline handling
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         fetch(event.request).then(function(response) {
//             if (response.status == 404) {
//                 return fetch('https://media.giphy.com/media/qs6ev2pm8g9dS/giphy.gif');
//             }
//             return response;
//         }).catch(function() {
//             return new Response("You are offline");
//         })
//     );
// });