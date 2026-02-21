'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, SwitchCamera, X, Check, MapPin, Loader2, AlertTriangle, ImagePlus } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraService] = useState(() => new CameraService())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoCapture | null>(null)
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(defaultFacingMode)
  const [permissions, setPermissions] = useState({ camera: false, location: false })
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking')
  const [isSaving, setIsSaving] = useState(false)
  const [useNativeCamera, setUseNativeCamera] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      cameraService.stopCamera()
    }
  }, [])

  // Handle file input change (native camera / gallery pick)
  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Compress the image on a canvas
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      // Resize / compress via canvas
      const img = new window.Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = dataUrl
      })

      const maxWidth = 1920
      const maxHeight = 1080
      let { width, height } = { width: img.width, height: img.height }

      if (width > maxWidth || height > maxHeight) {
        const ratio = width / height
        if (width > height) {
          width = maxWidth
          height = maxWidth / ratio
        } else {
          height = maxHeight
          width = maxHeight * ratio
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      const quality = 0.85
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Blob conversion failed'))),
          'image/jpeg',
          quality
        )
      })

      // Try to get GPS location
      let location: GeolocationPosition | undefined
      if ('geolocation' in navigator) {
        try {
          location = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 300000,
            })
          })
        } catch {
          // GPS not available — continue without it
        }
      }

      const timestamp = new Date()
      const photo: PhotoCapture = {
        id: crypto.randomUUID(),
        blob,
        dataUrl: compressedDataUrl,
        timestamp,
        location,
        jobId,
        taskId,
        fileName: `fieldforge-${timestamp.getTime()}.jpg`,
        mimeType: 'image/jpeg',
        size: blob.size,
      }

      setCapturedPhoto(photo)
      setIsLoading(false)
    } catch (err) {
      console.error('File capture error:', err)
      setError('Failed to process photo')
      setIsLoading(false)
    }

    // Reset input so the same file can be selected again
    e.target.value = ''
  }, [jobId, taskId])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check permissions
      const perms = await cameraService.requestPermissions()
      setPermissions(perms)

      if (!perms.camera) {
        // Fall back to native file input on mobile
        setUseNativeCamera(true)
        setIsLoading(false)
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
      // Fall back to native file input instead of showing error
      setUseNativeCamera(true)
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

  // Open native file picker for camera
  const openNativeCamera = () => {
    fileInputRef.current?.click()
  }

  if (error && !useNativeCamera) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="text-center text-white p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Camera Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2">
            <Button onClick={startCamera} variant="outline" className="w-full">
              Try Again
            </Button>
            <Button onClick={openNativeCamera} variant="outline" className="w-full">
              <ImagePlus className="h-4 w-4 mr-2" />
              Use Phone Camera
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Native camera fallback mode — full-screen UI with file input
  if (useNativeCamera && !capturedPhoto) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5 mr-1" />
            Close
          </Button>
          <span className="text-white text-sm font-medium">Take Photo</span>
          <div className="w-16" />
        </div>

        {/* Center content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {isLoading ? (
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <div>Processing photo...</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8">
                <Camera className="h-16 w-16 text-white/70" />
              </div>
              <Button
                onClick={openNativeCamera}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                <Camera className="h-6 w-6 mr-3" />
                Open Camera
              </Button>
              <p className="text-gray-400 text-sm mt-4">
                Tap to open your phone&apos;s camera
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Hidden file input always available as fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Status Bar - hidden during photo confirmation */}
      {!capturedPhoto && (
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
      )}

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