'use client'

import { useState } from 'react'
import { Camera, MapPin, Calendar, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useJobsData } from '@/hooks/useJobsData'
import { StoredJob, offlineStorage } from '@/lib/offlineStorage'
import { JobCompleteCelebration } from '@/components/JobCompleteCelebration'

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'scheduled',   label: 'Scheduled'   },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete'     },
  { value: 'on-hold',     label: 'On Hold'      },
] as const

const statusStyles: Record<string, string> = {
  'not-started': 'bg-gray-100 text-gray-800',
  'scheduled':   'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'complete':    'bg-green-100 text-green-800',
  'on-hold':     'bg-red-100 text-red-800',
}

const statusLabel = (status: string) =>
  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const normalizeStatus = (status?: StoredJob['status']) => {
  if (!status) return 'not-started'
  // Migrate legacy status values to new set
  const s = status as string
  if (s === 'completed' || s === 'completing') return 'complete'
  if (s === 'starting-soon' || s === 'pending') return 'scheduled'
  if (s === 'in_progress') return 'in-progress'
  if (s === 'cancelled') return 'on-hold'
  return status
}

export function JobsTable() {
  const { jobs, loading, error, refresh } = useJobsData()
  const router = useRouter()
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const handleStatusChange = async (job: StoredJob, newStatus: string) => {
    const normalized = normalizeStatus(job.status)
    if (newStatus === normalized) return
    setUpdatingStatus(job.id)
    try {
      await offlineStorage.saveJob({
        ...job,
        status: newStatus as StoredJob['status'],
        syncStatus: 'pending',
      })
      await refresh()
      if (newStatus === 'complete') {
        setShowCelebration(true)
      }
    } catch (err) {
      console.error('Failed to update job status', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredJobs =
    statusFilter === 'all'
      ? jobs
      : jobs.filter((j) => normalizeStatus(j.status) === statusFilter)

  const renderStatusCell = (job: StoredJob) => {
    const normalized = normalizeStatus(job.status)
    const badgeClass = statusStyles[normalized] ?? 'bg-gray-100 text-gray-800'
    const progress = job.progress ?? 0
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <select
            value={normalized}
            disabled={updatingStatus === job.id}
            onChange={(e) => handleStatusChange(job, e.target.value)}
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${badgeClass}`}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500 ml-2">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              normalized === 'complete'    ? 'bg-green-500'  :
              normalized === 'in-progress' ? 'bg-yellow-500' :
              normalized === 'scheduled'   ? 'bg-blue-500'   :
              normalized === 'on-hold'     ? 'bg-red-400'    :
              'bg-gray-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span>Loading job data…</span>
            </div>
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-8">
            <div className="flex flex-col items-center text-sm text-red-600 space-y-3">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
              <button
                onClick={refresh}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
              >
                Try again
              </button>
            </div>
          </td>
        </tr>
      )
    }

    if (!filteredJobs.length) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
            {statusFilter === 'all'
              ? 'No jobs yet. Create your first job to kick off the Phase 1 MVP flow.'
              : `No jobs with status "${statusLabel(statusFilter)}".`}
          </td>
        </tr>
      )
    }

    return filteredJobs.map((job) => {
      const jobCode      = job.jobNumber ?? job.id
      const customerName = job.customerName || 'Unassigned customer'
      const locationLabel = job.location?.label ?? job.location?.address ?? 'No location'
      const timeline     = `${formatDate(job.scheduledDate)} - ${formatDate(job.estimatedCompletion)}`
      const photosCount  = job.photosCount ?? job.photos?.length ?? 0
      const lastUpdate   = job.lastUpdateNote ?? 'No updates yet'
      return (
        <tr
          key={job.id}
          className="hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push(`/jobs/${job.id}`)}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{jobCode}</div>
            <div className="text-sm text-gray-600">{job.title}</div>
            <div className="text-xs text-gray-500 mt-1">{formatCurrency(job.value)}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{customerName}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {locationLabel}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[160px]" onClick={(e) => e.stopPropagation()}>
            {renderStatusCell(job)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm">
              <Camera className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{photosCount}</span>
              <span className="text-gray-500 ml-1">photos</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{lastUpdate}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {timeline}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="text-blue-600 hover:text-blue-500 text-xs font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              View Job
            </button>
          </td>
        </tr>
      )
    })
  }

  return (
    <>
      {showCelebration && (
        <JobCompleteCelebration onComplete={() => setShowCelebration(false)} />
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Jobs</h3>
            <div className="flex items-center space-x-2">
              <select
                className="rounded-md border-gray-300 text-xs px-2 py-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                type="search"
                placeholder="Search jobs..."
                className="rounded-md border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              {statusFilter !== 'all' && ` · ${statusLabel(statusFilter)}`}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border rounded-md disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 text-sm border rounded-md">Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
