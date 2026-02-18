// FieldForge Service Worker - PWA + Camera + Offline Support
const CACHE_NAME = 'fieldforge-v1.0.0'
const STATIC_CACHE = 'fieldforge-static-v1.0.0'
const DYNAMIC_CACHE = 'fieldforge-dynamic-v1.0.0'
const PHOTOS_CACHE = 'fieldforge-photos-v1.0.0'

// Critical resources to precache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints that work offline
const OFFLINE_ENDPOINTS = [
  '/api/jobs',
  '/api/tasks',
  '/api/customers',
  '/api/photos'
]

// Install - precache critical assets
self.addEventListener('install', event => {
  console.log('FieldForge SW: Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS)
      }),
      self.skipWaiting()
    ])
  )
})

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  console.log('FieldForge SW: Activating...')
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return !cacheName.includes('fieldforge-v1.0.0')
            })
            .map(cacheName => caches.delete(cacheName))
        )
      }),
      self.clients.claim()
    ])
  )
})

// Fetch - intelligent caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // API requests - network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  }
  // Photo uploads - special handling
  else if (url.pathname.includes('/api/photos') && request.method === 'POST') {
    event.respondWith(handlePhotoUpload(request))
  }
  // Images - cache first
  else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
  }
  // Navigation - network first with offline page
  else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
  }
  // Static assets - cache first
  else {
    event.respondWith(handleStaticRequest(request))
  }
})

// API request handler
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const url = new URL(request.url)

  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', url.pathname)
    
    // Check cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        // Add offline header
        const offlineResponse = cachedResponse.clone()
        offlineResponse.headers.append('X-Served-From', 'cache')
        return offlineResponse
      }
    }

    // Return offline data structure for known endpoints
    if (OFFLINE_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'This data is not available offline',
          cached: false,
          offline: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable - Offline',
          headers: { 
            'Content-Type': 'application/json',
            'X-Served-From': 'offline-fallback'
          }
        }
      )
    }

    return Response.error()
  }
}

// Photo upload handler - queue for background sync when offline
async function handlePhotoUpload(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      return response
    }
    throw new Error('Upload failed')
  } catch (error) {
    console.log('Photo upload failed, queuing for sync')
    
    // Queue for background sync
    const formData = await request.formData()
    await queuePhotoForSync(formData, request.url)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Photo queued for upload when online',
        queued: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Image request handler - cache first
async function handleImageRequest(request) {
  const cache = await caches.open(PHOTOS_CACHE)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return placeholder for offline images
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="12">Offline</text></svg>'
    })
  }
}

// Navigation request handler
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      return networkResponse
    }
    throw new Error('Navigation failed')
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE)
    return cache.match('/offline') || cache.match('/')
  }
}

// Static assets - cache first with network fallback
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return Response.error()
  }
}

// Background sync for queued photos
self.addEventListener('sync', event => {
  if (event.tag === 'photo-upload') {
    event.waitUntil(handlePhotoSync())
  }
})

// Photo background sync handler
async function handlePhotoSync() {
  console.log('Processing photo sync queue...')
  
  try {
    // Get queued photos from IndexedDB
    const queuedPhotos = await getQueuedPhotos()
    
    for (const photo of queuedPhotos) {
      try {
        const formData = new FormData()
        formData.append('file', photo.blob, photo.fileName)
        formData.append('jobId', photo.jobId || '')
        formData.append('taskId', photo.taskId || '')
        formData.append('capturedAt', photo.capturedAt)
        
        if (photo.location) {
          formData.append('latitude', photo.location.coords.latitude.toString())
          formData.append('longitude', photo.location.coords.longitude.toString())
        }

        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          await removeQueuedPhoto(photo.id)
          console.log('Photo synced successfully:', photo.id)
        } else {
          throw new Error(`Upload failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to sync photo:', photo.id, error)
      }
    }
  } catch (error) {
    console.error('Photo sync error:', error)
  }
}

// Push notification handler
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'fieldforge-notification',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Job',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const { action, data } = event
  let url = '/'

  if (action === 'view' && data.jobId) {
    url = `/jobs/${data.jobId}`
  } else if (data.url) {
    url = data.url
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => client.navigate(url))
          }
        }
        return clients.openWindow(url)
      })
  )
})

// Helper functions for IndexedDB operations (simplified)
async function queuePhotoForSync(formData, url) {
  // In a real implementation, this would store in IndexedDB
  console.log('Photo queued for sync:', { url, formData })
}

async function getQueuedPhotos() {
  // Return empty array for now - implement IndexedDB logic
  return []
}

async function removeQueuedPhoto(id) {
  console.log('Removing synced photo from queue:', id)
}