'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { PhotoCaptureComponent } from '@/components/PhotoCapture'
import {
  Camera, MapPin, User, Loader2, ArrowLeft,
  DollarSign, CheckCircle2, AlertCircle, Save,
  Mail, Phone, ChevronDown, ChevronUp,
  StickyNote, Plus, Trash2, Pencil, X,
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

const CATEGORY_COLORS: Record<string, string> = {
  'Labor':     'bg-blue-50 text-blue-700',
  'Materials': 'bg-emerald-50 text-emerald-700',
  'Equipment': 'bg-purple-50 text-purple-700',
  'Permits':   'bg-orange-50 text-orange-700',
  'Other':     'bg-gray-100 text-gray-600',
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

const formatDateTime = (isoStr: string) => {
  try {
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<StoredJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [savedPhotos, setSavedPhotos] = useState<StoredPhoto[]>([])

  // Status editing
  const [status, setStatus] = useState<string>('not-started')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Items section
  const [itemsOpen, setItemsOpen] = useState(false)

  // Log section
  const [logTab, setLogTab] = useState<'notes' | 'photos'>('notes')
  const [newNote, setNewNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  // Editing
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editEstCompletion, setEditEstCompletion] = useState('')
  const [editTechnician, setEditTechnician] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadPhotos = async () => {
    const photos = await offlineStorage.getPhotosByJob(jobId)
    setSavedPhotos(photos)
  }

  useEffect(() => {
    async function loadJob() {
      try {
        let stored = await offlineStorage.getJob(jobId)
        if (stored) {
          // If job was created from a proposal, fetch missing customer data and line items
          const missingCustomerData =
            !stored.customerName ||
            !stored.customerEmail ||
            !stored.customerAddress ||
            !stored.customerContact
          const missingLineItems = !stored.lineItems || stored.lineItems.length === 0
          if ((missingCustomerData || missingLineItems) && stored.id.startsWith('JOB-')) {
            const proposalId = stored.id.slice(4) // Remove 'JOB-' prefix
            // Only fetch if it looks like a UUID (not a seed job like JOB-001)
            if (proposalId.length > 10) {
              try {
                const res = await fetch(`/api/proposals/${proposalId}`)
                const data = await res.json()
                if (data.success && data.proposal) {
                  const p = data.proposal
                  const proposalItems = (p.items || []).map((item: any) => ({
                    id: item.id,
                    category: item.category,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    total: item.total,
                  }))
                  const updated: StoredJob = {
                    ...stored,
                    customerName: stored.customerName || p.customer_name || p.customer_contact || '',
                    customerContact: stored.customerContact || p.customer_contact || '',
                    customerEmail: stored.customerEmail || p.customer_email || '',
                    customerAddress: stored.customerAddress || p.customer_address || '',
                    lineItems: stored.lineItems && stored.lineItems.length > 0 ? stored.lineItems : proposalItems.length > 0 ? proposalItems : undefined,
                    subtotal: stored.subtotal ?? p.subtotal ?? undefined,
                    taxAmount: stored.taxAmount ?? p.tax_amount ?? undefined,
                    value: stored.value ?? p.total ?? undefined,
                  }
                  await offlineStorage.saveJob(updated)
                  stored = updated
                }
              } catch {
                // non-fatal — use whatever data we have
              }
            }
          }
          setJob(stored)
          setStatus(normalizeStatus(stored.status))
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
    await loadPhotos()
    setLogTab('photos')
  }

  const handleSaveStatus = async () => {
    if (!job) return
    setSaving(true)
    try {
      const updatedJob: Omit<StoredJob, 'lastModified'> = {
        ...job,
        status: status as StoredJob['status'],
        syncStatus: 'pending',
      }
      await offlineStorage.saveJob(updatedJob)
      setJob({ ...updatedJob, lastModified: Date.now() })
      setDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save job', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!job || !newNote.trim()) return
    setNoteSaving(true)
    try {
      const entry = {
        id: crypto.randomUUID(),
        text: newNote.trim(),
        timestamp: new Date().toISOString(),
      }
      const updatedEntries = [entry, ...(job.noteEntries ?? [])]
      const updatedJob: Omit<StoredJob, 'lastModified'> = {
        ...job,
        noteEntries: updatedEntries,
        syncStatus: 'pending',
      }
      await offlineStorage.saveJob(updatedJob)
      setJob({ ...updatedJob, lastModified: Date.now() })
      setNewNote('')
    } catch (err) {
      console.error('Failed to save note', err)
    } finally {
      setNoteSaving(false)
    }
  }

  const handleStartEdit = () => {
    if (!job) return
    setEditTitle(job.title)
    setEditDescription(job.description || '')
    setEditEstCompletion(job.estimatedCompletion || '')
    setEditTechnician(job.technicianName || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!job) return
    setSaving(true)
    try {
      const updatedJob: Omit<StoredJob, 'lastModified'> = {
        ...job,
        title: editTitle,
        description: editDescription,
        estimatedCompletion: editEstCompletion || undefined,
        technicianName: editTechnician || undefined,
        syncStatus: 'pending',
      }
      await offlineStorage.saveJob(updatedJob)
      setJob({ ...updatedJob, lastModified: Date.now() })
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save job', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!job) return
    setDeleting(true)
    try {
      await offlineStorage.deleteJob(job.id)
      router.push('/jobs')
    } catch (err) {
      console.error('Failed to delete job', err)
    } finally {
      setDeleting(false)
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
  const noteEntries = job.noteEntries ?? []
  const hasItems = job.lineItems && job.lineItems.length > 0

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
              onClick={() => { setShowCamera(true) }}
              className="bg-green-600 hover:bg-green-700 shrink-0"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>

          {/* Compact status bar */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setDirty(true) }}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColor}`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {dirty && (
              <Button onClick={handleSaveStatus} disabled={saving} size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-3">
                {saving
                  ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Saving…</>
                  : <><Save className="h-3 w-3 mr-1.5" />Save</>
                }
              </Button>
            )}
            {saveSuccess && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* ── Customer Information ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contact</p>
                  <p className="text-gray-900">{job.customerContact || '—'}</p>
                </div>
              </div>
              {job.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                    <a href={`tel:${job.customerPhone}`} className="text-blue-600 hover:underline">{job.customerPhone}</a>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                  {job.customerEmail ? (
                    <a href={`mailto:${job.customerEmail}`} className="text-blue-600 hover:underline">{job.customerEmail}</a>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Address</p>
                  <p className="text-gray-900">{job.customerAddress || job.location?.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Project Details ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
            Project Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Job Title</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{job.title}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Description / Scope of Work</p>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                    placeholder="Scope of work..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description || '—'}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Est. Completion</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editEstCompletion}
                    onChange={(e) => setEditEstCompletion(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(job.estimatedCompletion) || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Assigned To</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTechnician}
                    onChange={(e) => setEditTechnician(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                    placeholder="Technician name"
                  />
                ) : (
                  <p className="text-gray-900">{job.technicianName || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Proposal Line Items (collapsible, own card) ── */}
        {hasItems && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setItemsOpen(o => !o)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <DollarSign className="h-4 w-4 text-gray-400" />
                Proposal Line Items
                <span className="text-xs font-normal text-gray-400">({job.lineItems!.length} items)</span>
              </span>
              {itemsOpen
                ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              }
            </button>

            {itemsOpen && (
              <div className="border-t border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-16">Qty</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Unit Price</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {job.lineItems!.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/60">
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Other']}`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-700">{item.description}</td>
                          <td className="px-5 py-3 text-right text-gray-700">{item.quantity}</td>
                          <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-200">
                      {job.subtotal != null && (
                        <tr>
                          <td colSpan={4} className="px-5 py-2 text-right text-sm text-gray-500">Subtotal</td>
                          <td className="px-5 py-2 text-right text-sm text-gray-700">{formatCurrency(job.subtotal)}</td>
                        </tr>
                      )}
                      {job.taxAmount != null && (
                        <tr>
                          <td colSpan={4} className="px-5 py-2 text-right text-sm text-gray-500">Tax</td>
                          <td className="px-5 py-2 text-right text-sm text-gray-700">{formatCurrency(job.taxAmount)}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-5 py-3 text-right font-semibold text-gray-900">Total</td>
                        <td className="px-5 py-3 text-right text-base font-bold text-green-700">{formatCurrency(job.value)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Job
            </button>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* ── Job Log (Notes | Photos) ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center border-b border-gray-200">
            <button
              onClick={() => setLogTab('notes')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                logTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <StickyNote className="h-4 w-4" />
              Notes
              {noteEntries.length > 0 && (
                <span className="ml-0.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 leading-none">
                  {noteEntries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setLogTab('photos')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                logTab === 'photos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="h-4 w-4" />
              Photos
              {savedPhotos.length > 0 && (
                <span className="ml-0.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 leading-none">
                  {savedPhotos.length}
                </span>
              )}
            </button>

            {logTab === 'photos' && (
              <div className="ml-auto pr-5">
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
            )}
          </div>

          {/* Notes tab */}
          {logTab === 'notes' && (
            <div className="p-6">
              {/* Add note form */}
              <div className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note, field update, or observation…"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddNote}
                    disabled={noteSaving || !newNote.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {noteSaving
                      ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                      : <><Plus className="h-3.5 w-3.5 mr-1.5" />Add Note</>
                    }
                  </Button>
                </div>
              </div>

              {/* Notes feed */}
              {noteEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                  <StickyNote className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notes yet</p>
                  <p className="text-xs mt-1">Add the first note above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noteEntries.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 min-w-0">
                        <p className="text-xs text-gray-400 mb-1.5">{formatDateTime(entry.timestamp)}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Photos tab */}
          {logTab === 'photos' && (
            <div className="p-6">
              {savedPhotos.length === 0 ? (
                <div className="text-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No photos yet</p>
                  <p className="text-xs mt-1">Tap "Add Photo" or use "Take Photo" to document work</p>
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
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Delete Job</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
