'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { PhotoCaptureComponent } from '@/components/PhotoCapture'
import {
  Camera, MapPin, Clock, User, Loader2, ArrowLeft,
  DollarSign, CheckCircle2, AlertCircle, FileText, Save,
  Mail, Phone, Building2, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoCapture } from '@/lib/cameraService'
import { offlineStorage, StoredJob, StoredPhoto } from '@/lib/offlineStorage'

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'scheduled',   label: 'Scheduled'   },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete'     },
  { value: 'on-hold',     label: 'On Hold'      },
]

const STATUS_COLORS: Record<string, string> = {
  'not-started': 'bg-gray-100 text-gray-800 border-gray-300',
  'scheduled':   'bg-blue-100 text-blue-800 border-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'complete':    'bg-green-100 text-green-800 border-green-300',
  'on-hold':     'bg-red-100 text-red-800 border-red-300',
}

const normalizeStatus = (status?: string): string => {
  if (!status) return 'not-started'
  const s = status as string
  if (s === 'completed' || s === 'completing') return 'complete'
  if (s === 'starting-soon' || s === 'pending') return 'scheduled'
  if (s === 'in_progress') return 'in-progress'
  if (s === 'cancelled') return 'on-hold'
  return s
}

const formatCurrency = (amount?: number) => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<StoredJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [savedPhotos, setSavedPhotos] = useState<StoredPhoto[]>([])

  // Editable fields
  const [status, setStatus] = useState<string>('not-started')
  const [progress, setProgress] = useState<number>(0)
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadPhotos = async () => {
    const photos = await offlineStorage.getPhotosByJob(jobId)
    setSavedPhotos(photos)
  }

  useEffect(() => {
    async function loadJob() {
      try {
        const stored = await offlineStorage.getJob(jobId)
        if (stored) {
          setJob(stored)
          setStatus(normalizeStatus(stored.status))
          setProgress(stored.progress ?? 0)
        }
        await loadPhotos()
      } catch (err) {
        console.error('Failed to load job', err)
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [jobId])

  const handlePhotoCapture = async (_photo: PhotoCapture) => {
    // Reload persisted photos from IndexedDB to reflect the new save
    await loadPhotos()
  }

  const handleSave = async () => {
    if (!job) return
    setSaving(true)
    try {
      const updatedNotes = newNote.trim()
        ? `${new Date().toLocaleDateString()}: ${newNote.trim()}${job.notes ? '\n\n' + job.notes : ''}`
        : job.notes

      const updatedJob: Omit<StoredJob, 'lastModified'> = {
        ...job,
        status: status as StoredJob['status'],
        progress,
        notes: updatedNotes,
        syncStatus: 'pending',
      }
      await offlineStorage.saveJob(updatedJob)
      setJob({ ...updatedJob, lastModified: Date.now() })
      setNewNote('')
      setDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save job', err)
    } finally {
      setSaving(false)
    }
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
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700">Job not found</p>
          <p className="text-sm mt-1 text-gray-400 mb-6">ID: {jobId}</p>
          <Button onClick={() => router.push('/jobs')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS['not-started']
  const address = job.location?.label
    ? `${job.location.label}${job.location.address ? ` · ${job.location.address}` : ''}`
    : job.location?.address ?? '—'

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Back + Header */}
        <div>
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {job.jobNumber ?? jobId}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            </div>
            <Button
              onClick={() => setShowCamera(true)}
              className="bg-green-600 hover:bg-green-700 shrink-0"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            Customer Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customer</p>
                  <p className="text-gray-900 font-medium">{job.customerName || '—'}</p>
                </div>
              </div>
              {job.customerContact && job.customerContact !== job.customerName && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contact</p>
                    <p className="text-gray-900">{job.customerContact}</p>
                  </div>
                </div>
              )}
              {job.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                    <a href={`mailto:${job.customerEmail}`} className="text-blue-600 hover:underline">{job.customerEmail}</a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {job.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                    <a href={`tel:${job.customerPhone}`} className="text-blue-600 hover:underline">{job.customerPhone}</a>
                  </div>
                </div>
              )}
              {job.customerAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
                    <p className="text-gray-900">{job.customerAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Project Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Job Location</p>
                  <p className="text-gray-900">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contract Value</p>
                  <p className="text-gray-900 font-semibold text-green-700">{formatCurrency(job.value)}</p>
                </div>
              </div>
              {job.projectTimeline && (
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Timeline</p>
                    <p className="text-gray-900">{job.projectTimeline}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Scheduled</p>
                  <p className="text-gray-900">{formatDate(job.scheduledDate)}</p>
                </div>
              </div>
              {job.estimatedCompletion && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Est. Completion</p>
                    <p className="text-gray-900">{formatDate(job.estimatedCompletion)}</p>
                  </div>
                </div>
              )}
              {job.technicianName && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Assigned To</p>
                    <p className="text-gray-900">{job.technicianName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {job.description && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Scope of Work</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.notes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide mb-1">Notes & Updates</p>
              <p className="text-sm text-yellow-900 whitespace-pre-line">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Status</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setDirty(true) }}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColor}`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {(dirty || saveSuccess) && (
            <div className="mt-4 flex items-center justify-end gap-3">
              {saveSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
              {dirty && (
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                    : <><Save className="h-4 w-4 mr-2" />Save Changes</>
                  }
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-gray-400" />
              Photos
              <span className="text-xs font-normal text-gray-400 ml-1">({savedPhotos.length})</span>
            </h2>
            <Button
              onClick={() => setShowCamera(true)}
              size="sm"
              variant="outline"
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Add Photo
            </Button>
          </div>

          {savedPhotos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No photos yet</p>
              <p className="text-xs mt-1">Tap "Add Photo" to document your work</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {savedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100"
                  style={{ aspectRatio: '1' }}
                >
                  {photo.dataUrl ? (
                    <img
                      src={photo.dataUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {new Date(photo.capturedAt).toLocaleString()}
                      </p>
                      {photo.location && (
                        <div className="flex items-center text-white/80 text-xs mt-0.5">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" />
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

      </div>

      {showCamera && (
        <PhotoCaptureComponent
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          jobId={jobId}
        />
      )}
    </DashboardLayout>
  )
}
