// Camera Service for FieldForge - PWA Photo Capture with GPS
export interface PhotoCapture {
  id: string
  blob: Blob
  dataUrl: string
  timestamp: Date
  location?: GeolocationPosition
  jobId?: string
  taskId?: string
  fileName: string
  mimeType: string
  size: number
}

export interface CameraConstraints {
  video: {
    facingMode: 'user' | 'environment'
    width?: { ideal: number }
    height?: { ideal: number }
    aspectRatio?: { ideal: number }
  }
  audio: false
}

export class CameraService {
  private stream: MediaStream | null = null
  private currentFacingMode: 'user' | 'environment' = 'environment'

  async requestPermissions(): Promise<{
    camera: boolean
    location: boolean
  }> {
    const permissions = { camera: false, location: false }

    try {
      // Check camera permission
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ 
          name: 'camera' as PermissionName 
        })
        permissions.camera = cameraPermission.state === 'granted'
      } else {
        // Fallback - assume granted if no permission API
        permissions.camera = true
      }

      // Check location permission
      if ('geolocation' in navigator && 'permissions' in navigator) {
        const locationPermission = await navigator.permissions.query({ 
          name: 'geolocation' as PermissionName 
        })
        permissions.location = locationPermission.state === 'granted'
      }
    } catch (error) {
      console.warn('Permission check failed:', error)
      // Assume permissions are available
      permissions.camera = true
      permissions.location = true
    }

    return permissions
  }

  async startCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
    this.currentFacingMode = facingMode

    const constraints: CameraConstraints = {
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.stream
    } catch (error) {
      console.error('Camera access error:', error)
      
      // Try with basic constraints if advanced ones fail
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        })
        return this.stream
      } catch (fallbackError) {
        throw new Error('Unable to access camera. Please check permissions and ensure you\'re using HTTPS.')
      }
    }
  }

  async switchCamera(): Promise<MediaStream> {
    if (this.stream) {
      this.stopCamera()
    }

    // Toggle camera
    const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user'
    return this.startCamera(newFacingMode)
  }

  async capturePhoto(
    videoElement: HTMLVideoElement,
    options: {
      quality?: number
      maxWidth?: number
      maxHeight?: number
      jobId?: string
      taskId?: string
    } = {}
  ): Promise<PhotoCapture> {
    const {
      quality = 0.85,
      maxWidth = 1920,
      maxHeight = 1080,
      jobId,
      taskId
    } = options

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!

    // Calculate dimensions maintaining aspect ratio
    let { videoWidth, videoHeight } = videoElement
    
    if (videoWidth > maxWidth || videoHeight > maxHeight) {
      const aspectRatio = videoWidth / videoHeight
      
      if (videoWidth > videoHeight) {
        videoWidth = maxWidth
        videoHeight = maxWidth / aspectRatio
      } else {
        videoHeight = maxHeight
        videoWidth = maxHeight * aspectRatio
      }
    }

    canvas.width = videoWidth
    canvas.height = videoHeight
    
    // Draw and compress image
    context.drawImage(videoElement, 0, 0, videoWidth, videoHeight)

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to capture photo'))
          return
        }

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const location = await this.getCurrentLocation()
        const timestamp = new Date()
        const fileName = `fieldforge-${timestamp.getTime()}.jpg`

        resolve({
          id: crypto.randomUUID(),
          blob,
          dataUrl,
          timestamp,
          location,
          jobId,
          taskId,
          fileName,
          mimeType: 'image/jpeg',
          size: blob.size
        })
      }, 'image/jpeg', quality)
    })
  }

  private async getCurrentLocation(): Promise<GeolocationPosition | undefined> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(undefined)
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location captured:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          resolve(position)
        },
        (error) => {
          console.warn('Location access failed:', error.message)
          resolve(undefined)
        },
        options
      )
    })
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        console.log('Camera track stopped:', track.kind)
      })
      this.stream = null
    }
  }

  // Utility: Convert blob to base64 for storage
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to convert blob to base64'))
      reader.readAsDataURL(blob)
    })
  }

  // Utility: Get image dimensions
  static getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.src = dataUrl
    })
  }

  // Check camera availability
  static async isCameraAvailable(): Promise<boolean> {
    try {
      if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        return false
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(device => device.kind === 'videoinput')
    } catch (error) {
      console.error('Camera availability check failed:', error)
      return false
    }
  }

  // Get available cameras
  static async getAvailableCameras(): Promise<Array<{ deviceId: string; label: string; facingMode?: string }>> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          facingMode: device.label.toLowerCase().includes('front') ? 'user' : 'environment'
        }))
    } catch (error) {
      console.error('Failed to enumerate cameras:', error)
      return []
    }
  }
}