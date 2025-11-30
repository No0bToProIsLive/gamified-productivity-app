const CACHE_NAME = 'gamified-productivity-v1'
const STATIC_CACHE = 'static-cache'
const DYNAMIC_CACHE = 'dynamic-cache'

// Static files to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // App assets
  '/_next/static/',
]

// API routes that should use network-first strategy
const NETWORK_FIRST_ROUTES = [
  '/api/auth/',
  '/api/tasks/',
  '/api/habits/',
  '/api/goals/',
  '/api/leaderboard/',
  '/api/user-stats/',
]

// API routes that can be cached (non-critical)
const CACHE_FIRST_ROUTES = [
  '/api/user-profile/',
  '/api/achievements/',
  '/api/daily-challenges/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service worker installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service worker install failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request))
  } else if (isAPIRoute(url.pathname)) {
    event.respondWith(handleAPIRequest(request))
  } else {
    event.respondWith(handleNavigationRequest(request))
  }
})

// Check if request is for static asset
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  )
}

// Check if request is for API route
function isAPIRoute(pathname) {
  return pathname.startsWith('/api/')
}

// Handle static asset requests
function handleStaticRequest(request) {
  return caches.match(STATIC_CACHE)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      // If not in cache, fetch and cache
      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(STATIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch((error) => {
          console.error('Static asset fetch failed:', error)
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        })
    })
}

// Handle API requests
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  try {
    // Check if user is offline
    const isOnline = navigator.onLine

    // Network-first for critical API routes
    if (NETWORK_FIRST_ROUTES.some(route => pathname.startsWith(route))) {
      if (isOnline) {
        const response = await fetch(request)

        // Cache the response for offline use
        if (response.ok) {
          const responseClone = response.clone()
          const cache = await caches.open(DYNAMIC_CACHE)
          cache.put(request, responseClone)
        }

        return response
      } else {
        // Try to get from cache when offline
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          return cachedResponse
        }

        // Return offline response
        return new Response(JSON.stringify({
          error: 'Offline - Please check your connection',
          offline: true
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Cache-first for non-critical API routes
    if (CACHE_FIRST_ROUTES.some(route => pathname.startsWith(route))) {
      const cachedResponse = await caches.match(request)

      if (cachedResponse && !isStale(cachedResponse)) {
        return cachedResponse
      }

      if (isOnline) {
        const response = await fetch(request)

        if (response.ok) {
          const responseClone = response.clone()
          const cache = await caches.open(DYNAMIC_CACHE)
          cache.put(request, responseClone)
        }

        return response
      } else if (cachedResponse) {
        return cachedResponse
      }
    }

    // Default to network
    return fetch(request)
  } catch (error) {
    console.error('API request failed:', error)

    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    return new Response(JSON.stringify({
      error: 'Request failed',
      message: 'Please try again later'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle navigation requests
function handleNavigationRequest(request) {
  // Always try network first for navigation
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        return response
      }

      // If network fails for navigation, return cached page or offline page
      return caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // Return offline fallback page
          return caches.match('/offline.html') ||
            new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - Gamified Productivity</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <link href="/_next/static/css/" rel="stylesheet">
                </head>
                <body class="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                  <div class="text-center p-8">
                    <div class="mb-4">
                      <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8m-1-4l4-4m4.5V5a2 2 0 00-2-2h-1m-6 0l-1 1m1-4l4-4m1.5V5a2 2 0 00-2-2H9m-6 0H7a2 2 0 00-2 2v5a2 2 0 002 2h6m-6 0v6m6-6v6m6-6h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're Offline</h1>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                      Check your internet connection and try again.
                    </p>
                    <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                      Try Again
                    </button>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-4">
                      Your cached data is available when you're back online.
                    </p>
                  </div>
                </body>
              </html>
            `, {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            })
        })
    })
    .catch((error) => {
      console.error('Navigation request failed:', error)
      return new Response('Network Error', { status: 503 })
    })
}

// Check if cached response is stale (5 minutes for dynamic content)
function isStale(response) {
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return true

  const cacheTime = new Date(dateHeader).getTime()
  const now = Date.now()
  const staleTime = 5 * 60 * 1000 // 5 minutes

  return (now - cacheTime) > staleTime
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Process queued offline actions
      processOfflineQueue()
    )
  }
})

// Process offline queue
async function processOfflineQueue() {
  try {
    const queue = await getOfflineQueue()

    for (const action of queue) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })

        if (response.ok) {
          await removeFromOfflineQueue(action.id)
          console.log('Synced offline action:', action.type)
        } else {
          console.error('Failed to sync offline action:', action.type)
        }
      } catch (error) {
        console.error('Error syncing offline action:', error)
      }
    }
  } catch (error) {
    console.error('Failed to process offline queue:', error)
  }
}

// Get offline queue from IndexedDB
async function getOfflineQueue() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array
  return []
}

// Remove action from offline queue
async function removeFromOfflineQueue(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removed action from queue:', actionId)
}

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})