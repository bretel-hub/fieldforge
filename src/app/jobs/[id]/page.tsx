'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { PhotoCaptureComponent } from '@/components/PhotoCapture'
import { Camera, MapPin, Clock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoCapture } from '@/lib/cameraService'
import { offlineStorage, StoredJob } from '@/lib/offlineStorage'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Not Started',
  'scheduled':   'Scheduled',
  'in-progress': 'In Progress',
  'complete':    'Complete',
  'on-hold':     'On Hold',
}

const STATUS_COLORS: Record<string, string> = {
  'not-started': 'bg-gray-100 text-gray-800',
  'scheduled':   'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'complete':    'bg-green-100 text-green-800',
  'on-hold':     'bg-red-100 text-red-800',
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [jobPhotos, setJobPhotos] = useState<PhotoCapture[]>([])
  const [job, setJob] = useState<StoredJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJob() {
      try {
        const stored = await offlineStorage.getJob(params.id)
        setJob(stored ?? null)
      } catch (err) {
        console.error('Failed to load job', err)
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [params.id])

  const handlePhotoCapture = (photo: PhotoCapture) => {
    setJobPhotos((prev) => [...prev, photo])
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          Loading job…
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-32 text-gray-500">
          <p className="text-lg">Job not found.</p>
          <p className="text-sm mt-1 text-gray-400">ID: {params.id}</p>
        </div>
      </DashboardLayout>
    )
  }

  const normalizedStatus = (() => {
    const s = job.status as string
    if (s === 'completed' || s === 'completing') return 'complete'
    if (s === 'starting-soon' || s === 'pending') return 'scheduled'
    if (s === 'in_progress') return 'in-progress'
    if (s === 'cancelled') return 'on-hold'
    return s
  })()

  const statusLabel = STATUS_LABELS[normalizedStatus] ?? normalizedStatus
  const statusColor = STATUS_COLORS[normalizedStatus] ?? 'bg-gray-100 text-gray-800'

  const address = job.location?.label
    ? `${job.location.label}${job.location.address ? ` · ${job.location.address}` : ''}`
    : job.location?.address ?? '—'

  const photosCount = job.photosCount ?? job.photos?.length ?? jobPhotos.length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3">{job.jobNumber ?? job.id}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 shrink-0" />
                  {job.customerName || 'Unassigned customer'}
                  {job.technicianName && (
                    <span className="ml-4 text-gray-400">Technician: {job.technicianName}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 shrink-0" />
                  {address}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 shrink-0" />
                  {job.scheduledDate
                    ? new Date(job.scheduledDate).toLocaleDateString()
                    : '—'}
                  {job.estimatedCompletion && (
                    <span className="ml-2 text-gray-400">
                      → {new Date(job.estimatedCompletion).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setShowCamera(true)} className="bg-green-600 hover:bg-green-700 shrink-0">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>

          {job.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{job.description}</p>
            </div>
          )}

          {job.notes && (
            <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs font-medium text-yellow-700 mb-1 uppercase tracking-wide">Notes</p>
              <p className="text-sm text-yellow-900">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Value */}
        {job.value != null && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2">Contract Value</h2>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(job.value)}
            </p>
          </div>
        )}

        {/* Progress */}
        {job.progress != null && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Progress</h2>
              <span className="text-sm text-gray-600">{job.progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            {job.lastUpdateNote && (
              <p className="text-xs text-gray-400 mt-2">{job.lastUpdateNote}</p>
            )}
          </div>
        )}

        {/* Photo Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Photos</h2>
            <span className="text-sm text-gray-600">{photosCount + jobPhotos.length} photos</span>
          </div>

          {jobPhotos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photos taken yet</p>
              <p className="text-sm">Tap "Take Photo" to document your work</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jobPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt={`Job photo ${photo.id}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <div>{photo.timestamp.toLocaleTimeString()}</div>
                      {photo.location && (
                        <div className="flex items-center justify-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Status */}
        <div className="fixed bottom-4 right-4 z-30">
          <div className={`px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
            typeof navigator !== 'undefined' && navigator.onLine
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                typeof navigator !== 'undefined' && navigator.onLine ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <PhotoCaptureComponent
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          jobId={job.id}
        />
      )}
    </DashboardLayout>
  )
}
