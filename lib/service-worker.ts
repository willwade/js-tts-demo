// This file would be compiled and placed in the public directory
// For a real implementation, you'd need to set up a build process for this

// Define cache name and assets to cache
const CACHE_NAME = "tts-client-demo-v1"
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache assets
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      // Make network request
      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Handle offline SherpaOnnx model downloads
// This would need to be expanded for a real implementation
self.addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "DOWNLOAD_MODEL") {
    // Handle model download and caching
    // This is a placeholder for the actual implementation
    event.ports[0].postMessage({
      status: "success",
      message: "Model downloaded successfully",
    })
  }
})
