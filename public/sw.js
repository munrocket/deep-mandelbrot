//Stale-while-revalidate strategy

// Fill here with your cache name-version.
const CACHE_NAME = 'deepmandel-0.0.4'

// This is the list of URLs to be cached by your Progressive Web App URLs.
const CACHED_URLS = [
  // '/',
  // '/build/bundle.css',
  // '/build/bundle.js',
  // '/images/icons/android-chrome-192x192.png',
  // '/images/icons/android-chrome-512x512.png',
  // '/images/doge.jpg',
  // '/images/loli.jpg',
  // '/images/rick.jpg',
  // '/index.html',
  // '/manifest.json',
  // 'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css',
]

let cache = null

// Open cache on install.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(currentCache => {
        // Store a reference to current cache, to be used on fetch event handler.
        cache = currentCache
        cache.addAll(CACHED_URLS)
      })
      .then(self.skipWaiting())
  )
})

// Handle fetch event with snippet from here: https://www.youtube.com/watch?v=TtXvE814SQA
self.addEventListener('fetch', event => {
  const request = event.request

  const networkResponsePromise = fetch(request).catch(ignore => {})
  const cachedResponsePromise = caches.match(request)

  event.respondWith(async function () {
    const cacheResponse = await cachedResponsePromise
    if (cacheResponse) return cacheResponse

    const networkResponse = await networkResponsePromise
    if (networkResponse) return networkResponse.clone()

    throw new Error(`Neither network nor cache had a response for ${request.url}`)
  }())

  event.waitUntil(async function () {
    const networkResponse = await networkResponsePromise

    if (networkResponse) cache.put(request, networkResponse.clone())
  }())
})

// Clean up caches other than current.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          const deleteThisCache = cacheName !== CACHE_NAME

          return deleteThisCache
        }).map(cacheName => caches.delete(cacheName))
      )
    })
  )
})