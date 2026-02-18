'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, SwitchCamera, X, Check, MapPin, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CameraService, type PhotoCapture } from '@/lib/cameraService'
import { offlineStorage } from '@/lib/offlineStorage'
import { toast } from '@/hooks/use-toast'

interface PhotoCaptureProps {
  onPhotoCapture: (photo: PhotoCapture) => void
  onClose: () => void
  jobId?: string
  taskId?: string
  defaultFacingMode?: 'user' | 'environment'
}

export function PhotoCaptureComponent({ 
  onPhotoCapture, 
  onClose, 
  jobId, 
  taskId,
  defaultFacingMode = 'environment'
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraService] = useState(() => new CameraService())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoCapture | null>(null)
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(defaultFacingMode)
  const [permissions, setPermissions] = useState({ camera: false, location: false })
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      cameraService.stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check permissions
      const perms = await cameraService.requestPermissions()
      setPermissions(perms)
      
      if (!perms.camera) {
        setError('Camera permission required. Please allow camera access and reload.')
        return
      }

      // Check location permission status
      if (perms.location) {
        setLocationStatus('granted')
      } else if ('geolocation' in navigator) {
        setLocationStatus('denied')
      } else {
        setLocationStatus('unavailable')
      }

      // Start camera
      const stream = await cameraService.startCamera(currentFacingMode)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(err instanceof Error ? err.message : 'Failed to access camera')
      setIsLoading(false)
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current) return

    try {
      setIsLoading(true)
      
      const photo = await cameraService.capturePhoto(videoRef.current, {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1080,
        jobId,
        taskId
      })
      
      setCapturedPhoto(photo)
      setIsLoading(false)
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture photo')
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!capturedPhoto) return

    try {
      setIsSaving(true)

      // Save to offline storage first
      await offlineStorage.savePhoto({
        id: capturedPhoto.id,
        jobId: capturedPhoto.jobId,
        taskId: capturedPhoto.taskId,
        fileName: capturedPhoto.fileName,
        blob: capturedPhoto.blob,
        dataUrl: capturedPhoto.dataUrl,
        mimeType: capturedPhoto.mimeType,
        size: capturedPhoto.size,
        capturedAt: capturedPhoto.timestamp.toISOString(),
        location: capturedPhoto.location ? {
          latitude: capturedPhoto.location.coords.latitude,
          longitude: capturedPhoto.location.coords.longitude,
          accuracy: capturedPhoto.location.coords.accuracy
        } : undefined,
        syncStatus: navigator.onLine ? 'pending' : 'pending'
      })

      // Try to upload immediately if online
      if (navigator.onLine) {
        try {
          const formData = new FormData()
          formData.append('file', capturedPhoto.blob, capturedPhoto.fileName)
          formData.append('jobId', capturedPhoto.jobId || '')
          formData.append('taskId', capturedPhoto.taskId || '')
          formData.append('capturedAt', capturedPhoto.timestamp.toISOString())
          
          if (capturedPhoto.location) {
            formData.append('latitude', capturedPhoto.location.coords.latitude.toString())
            formData.append('longitude', capturedPhoto.location.coords.longitude.toString())
          }

          const response = await fetch('/api/photos', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            // Update sync status
            await offlineStorage.savePhoto({
              id: capturedPhoto.id,
              jobId: capturedPhoto.jobId,
              taskId: capturedPhoto.taskId,
              fileName: capturedPhoto.fileName,
              blob: capturedPhoto.blob,
              dataUrl: capturedPhoto.dataUrl,
              mimeType: capturedPhoto.mimeType,
              size: capturedPhoto.size,
              capturedAt: capturedPhoto.timestamp.toISOString(),
              location: capturedPhoto.location ? {
                latitude: capturedPhoto.location.coords.latitude,
                longitude: capturedPhoto.location.coords.longitude,
                accuracy: capturedPhoto.location.coords.accuracy
              } : undefined,
              syncStatus: 'synced'
            })
            
            toast({
              title: "Photo uploaded",
              description: "Photo captured and uploaded successfully"
            })
          } else {
            throw new Error('Upload failed')
          }
        } catch (uploadError) {
          console.warn('Upload failed, photo saved offline:', uploadError)
          toast({
            title: "Photo saved offline",
            description: "Photo will sync when connection improves",
            variant: "default"
          })
        }
      } else {
        toast({
          title: "Photo saved offline",
          description: "Photo will sync when back online",
          variant: "default"
        })
      }

      // Return photo to parent component
      onPhotoCapture(capturedPhoto)
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save photo')
      toast({
        title: "Save failed",
        description: "Failed to save photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetake = () => {
    setCapturedPhoto(null)
  }

  const handleSwitchCamera = async () => {
    try {
      setIsLoading(true)
      const stream = await cameraService.switchCamera()
      setCurrentFacingMode(stream.getVideoTracks()[0]?.getSettings()?.facingMode as 'user' | 'environment' || currentFacingMode)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('Switch camera error:', err)
      setError('Failed to switch camera')
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Camera Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2">
            <Button onClick={startCamera} variant="outline" className="w-full">
              Try Again
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white text-sm">
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className={`h-4 w-4 ${locationStatus === 'granted' ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-white text-sm">
              {locationStatus === 'granted' ? 'GPS' : 'No GPS'}
            </span>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {!capturedPhoto ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <div>Starting camera...</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedPhoto.dataUrl}
            alt="Captured photo"
            className="w-full h-full object-cover"
          />
        )}

        {/* Photo Info Overlay */}
        {capturedPhoto && (
          <div className="absolute top-16 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div>Size: {Math.round(capturedPhoto.size / 1024)}KB</div>
                <div>Time: {capturedPhoto.timestamp.toLocaleTimeString()}</div>
              </div>
              {capturedPhoto.location && (
                <div className="text-right">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    GPS Location
                  </div>
                  <div className="text-xs opacity-75">
                    ±{Math.round(capturedPhoto.location.coords.accuracy || 0)}m
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onClose}
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>

            {!capturedPhoto ? (
              <>
                <Button
                  onClick={handleCapture}
                  size="lg"
                  className="rounded-full w-20 h-20 bg-white text-black hover:bg-gray-200 shadow-lg"
                  disabled={isLoading}
                >
                  <Camera className="h-10 w-10" />
                </Button>

                <Button
                  onClick={handleSwitchCamera}
                  size="lg"
                  variant="outline"
                  className="rounded-full w-12 h-12 border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10"
                  disabled={isLoading}
                >
                  <SwitchCamera className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleRetake}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 py-3 border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10"
                >
                  Retake
                </Button>

                <Button
                  onClick={handleConfirm}
                  size="lg"
                  className="rounded-full px-6 py-3 bg-green-600 hover:bg-green-700 shadow-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}