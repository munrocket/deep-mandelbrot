//Stale-while-revalidate strategy

// Fill here with your cache name-version.
const CACHE_NAME = 'deepfractal-0.1'

// This is the list of URLs to be cached by your Progressive Web App URLs.
const CACHED_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/events.js',
  '/src/render.js',
  '/src/shaders.js',
  '/sw.js',
  '/img/android-chrome-192x192.png',
  '/img/android-chrome-512x512.png'
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

// Handle fetch event with snippet stolen from here: https://www.youtube.com/watch?v=TtXvE814SQA
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