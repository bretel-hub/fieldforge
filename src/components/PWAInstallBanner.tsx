'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile')

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
    
    // Check device type and OS
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setDeviceType(isMobile ? 'mobile' : 'desktop')
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Don't show immediately - wait a bit for user to explore
      setTimeout(() => {
        const dismissed = sessionStorage.getItem('pwa-install-dismissed')
        const installDate = localStorage.getItem('pwa-install-shown')
        const now = Date.now()
        const oneDayAgo = now - (24 * 60 * 60 * 1000)
        
        // Show if not dismissed this session and not shown in last 24 hours
        if (!dismissed && (!installDate || parseInt(installDate) < oneDayAgo)) {
          setShowBanner(true)
          localStorage.setItem('pwa-install-shown', now.toString())
        }
      }, 10000) // Show after 10 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show install hint after some interaction
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('ios-install-dismissed')
        if (!dismissed) {
          setShowBanner(true)
        }
      }, 15000) // Show after 15 seconds on iOS
      
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isIOS, isStandalone])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowBanner(false)
        localStorage.setItem('pwa-installed', 'true')
      }
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    if (isIOS) {
      sessionStorage.setItem('ios-install-dismissed', 'true')
    } else {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already installed, not showing, or dismissed
  if (isStandalone || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg z-40 border-t border-blue-500">
      <div className="flex items-start justify-between max-w-4xl mx-auto">
        <div className="flex items-start space-x-3 flex-1">
          {deviceType === 'mobile' ? (
            <Smartphone className="h-6 w-6 mt-0.5 flex-shrink-0" />
          ) : (
            <Monitor className="h-6 w-6 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Install FieldForge</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              {isIOS ? (
                <>
                  Add to your home screen for quick access and offline capabilities.{' '}
                  <span className="font-medium">
                    Tap <span className="inline-block bg-blue-800 px-1.5 py-0.5 rounded text-xs mx-1">Share</span> then 
                    <span className="inline-block bg-blue-800 px-1.5 py-0.5 rounded text-xs mx-1">Add to Home Screen</span>
                  </span>
                </>
              ) : deviceType === 'mobile' ? (
                <>
                  Get the full app experience with offline access, push notifications, and native performance.
                  Perfect for field work without reliable internet.
                </>
              ) : (
                <>
                  Install as a desktop app for faster access, offline capabilities, and a native app experience.
                  Work seamlessly even without internet connection.
                </>
              )}
            </p>
            
            {/* Feature highlights */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-800 px-2 py-1 rounded">📷 Camera Access</span>
              <span className="bg-blue-800 px-2 py-1 rounded">🌐 Works Offline</span>
              <span className="bg-blue-800 px-2 py-1 rounded">📍 GPS Tagging</span>
              {deviceType === 'mobile' && (
                <span className="bg-blue-800 px-2 py-1 rounded">📱 Native Feel</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!isIOS && deferredPrompt && (
            <Button 
              onClick={handleInstall} 
              variant="secondary" 
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
            >
              <Download className="h-4 w-4 mr-1" />
              Install
            </Button>
          )}
          <Button 
            onClick={handleDismiss} 
            variant="ghost" 
            size="sm"
            className="text-blue-100 hover:text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress indicator for iOS users */}
      {isIOS && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-blue-200 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
            Tap Share
          </div>
          <div className="w-4 h-0.5 bg-blue-400"></div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
            Add to Home Screen
          </div>
          <div className="w-4 h-0.5 bg-blue-400"></div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
            Done!
          </div>
        </div>
      )}
    </div>
  )
}