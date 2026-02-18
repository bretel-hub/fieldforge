'use client'

import { Camera, MapPin, User, Calendar, MoreHorizontal, Eye, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useJobsData } from '@/hooks/useJobsData'
import { StoredJob } from '@/lib/offlineStorage'

const statusStyles: Record<string, string> = {
  'scheduled': 'bg-gray-100 text-gray-800',
  'starting-soon': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completing': 'bg-green-100 text-green-800',
  'completed': 'bg-green-100 text-green-800',
  'on-hold': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'cancelled': 'bg-red-100 text-red-800'
}

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const normalizeStatus = (status?: StoredJob['status']) => {
  if (!status) return 'scheduled'
  return status.replace('_', '-')
}

export function JobsTable() {
  const { jobs, loading, error, refresh } = useJobsData()

  const renderStatusBadge = (job: StoredJob) => {
    const normalizedStatus = normalizeStatus(job.status)
    const badgeClass = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-800'
    const progress = job.progress ?? 0
    return (
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
              {normalizedStatus.replace('-', ' ')}
            </span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                normalizedStatus === 'completed' ? 'bg-green-500' :
                normalizedStatus === 'in-progress' ? 'bg-yellow-500' :
                normalizedStatus === 'starting-soon' ? 'bg-blue-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
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
          <td colSpan={7} className="px-6 py-8">
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

    if (!jobs.length) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
            No jobs yet. Create your first job to kick off the Phase 1 MVP flow.
          </td>
        </tr>
      )
    }

    return jobs.map((job) => {
      const jobCode = job.jobNumber ?? job.id
      const customerName = job.customerName || 'Unassigned customer'
      const locationLabel = job.location?.label ?? job.location?.address ?? 'No location'
      const timeline = `${formatDate(job.scheduledDate)} - ${formatDate(job.estimatedCompletion)}`
      const photosCount = job.photosCount ?? job.photos?.length ?? 0
      const lastUpdate = job.lastUpdateNote ?? 'No updates yet'
      const assignee = job.technicianName ?? job.technicianId ?? 'Unassigned'

      return (
        <tr key={job.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {jobCode}
              </div>
              <div className="text-sm text-gray-600">
                {job.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(job.value)}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div>
              <div className="text-sm font-medium text-gray-900">{customerName}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {locationLabel}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {renderStatusBadge(job)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm text-gray-900">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              {assignee}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm">
              <Camera className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{photosCount}</span>
              <span className="text-gray-500 ml-1">photos</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {lastUpdate}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {timeline}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center space-x-2">
              <Link 
                href={`/jobs/${job.id}`}
                className="text-blue-600 hover:text-blue-500"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/jobs/${job.id}/photos`}
                className="text-green-600 hover:text-green-500"
              >
                <Camera className="h-4 w-4" />
              </Link>
              <button className="text-gray-400 hover:text-gray-500">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">All Jobs</h3>
          <div className="flex items-center space-x-2">
            <select className="rounded-md border-gray-300 text-sm">
              <option>All Status</option>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completing</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
            <select className="rounded-md border-gray-300 text-sm">
              <option>All Assignees</option>
              <option>Mike Johnson</option>
              <option>Sarah Chen</option>
              <option>Dave Rodriguez</option>
              <option>Alex Kim</option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer & Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
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
            Showing {jobs.length} jobs
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border rounded-md disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-sm border rounded-md">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
