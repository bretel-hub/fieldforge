'use client'

import { useEffect } from 'react'
import { offlineStorage } from '@/lib/offlineStorage'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('FieldForge SW registered:', registration.scope)
          
          // Initialize offline storage
          offlineStorage.init().catch(console.error)
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New version available')
                  if (confirm('A new version of FieldForge is available. Reload to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('FieldForge SW registration failed:', error)
        })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_STATUS') {
          console.log('Sync status:', event.data.status)
        }
      })

      // Periodic sync when online
      const handleOnline = () => {
        console.log('Back online - processing sync queue')
        offlineStorage.processSync()
      }

      const handleOffline = () => {
        console.log('Gone offline - queuing operations')
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Register background sync if supported
      navigator.serviceWorker.ready.then((registration) => {
        if ('sync' in registration) {
          // Register for background sync
          return (registration as any).sync.register('photo-upload')
        }
      }).catch((error) => {
        console.warn('Background sync not available:', error)
      })

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return null // This component doesn't render anything
}