'use client'

import { Camera, MapPin, User, Calendar, MoreHorizontal, Eye } from 'lucide-react'
import Link from 'next/link'

const jobs = [
  {
    id: 'JOB-001',
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    status: 'in-progress',
    progress: 75,
    assignee: 'Mike Johnson',
    location: '123 River St, Downtown',
    startDate: '2026-02-12',
    estimatedCompletion: '2026-02-18',
    photosCount: 24,
    lastUpdate: '3 hours ago',
    value: 12400,
  },
  {
    id: 'JOB-002',
    customer: 'Office Park Building A',
    title: 'Security Camera Installation',
    status: 'scheduled',
    progress: 0,
    assignee: 'Sarah Chen',
    location: '456 Business Blvd',
    startDate: '2026-02-17',
    estimatedCompletion: '2026-02-22',
    photosCount: 0,
    lastUpdate: 'Scheduled',
    value: 28900,
  },
  {
    id: 'JOB-003',
    customer: 'Greenfield Apartments',
    title: 'HVAC Maintenance - Units 12-24',
    status: 'in-progress',
    progress: 45,
    assignee: 'Dave Rodriguez',
    location: '789 Green Ave',
    startDate: '2026-02-10',
    estimatedCompletion: '2026-02-20',
    photosCount: 15,
    lastUpdate: '1 day ago',
    value: 8200,
  },
  {
    id: 'JOB-004',
    customer: 'Metro Health Clinic',
    title: 'Network Infrastructure Setup',
    status: 'starting-soon',
    progress: 10,
    assignee: 'Alex Kim',
    location: '321 Health Way',
    startDate: '2026-02-19',
    estimatedCompletion: '2026-03-05',
    photosCount: 8,
    lastUpdate: 'Site survey completed',
    value: 32100,
  },
  {
    id: 'JOB-005',
    customer: 'Downtown Retail Complex',
    title: 'Lighting System Upgrade',
    status: 'completed',
    progress: 100,
    assignee: 'Sarah Chen',
    location: '555 Main St',
    startDate: '2026-02-01',
    estimatedCompletion: '2026-02-10',
    photosCount: 42,
    lastUpdate: 'Completed 5 days ago',
    value: 15600,
  },
]

const statusStyles = {
  'scheduled': 'bg-gray-100 text-gray-800',
  'starting-soon': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completing': 'bg-green-100 text-green-800',
  'completed': 'bg-green-100 text-green-800',
  'on-hold': 'bg-red-100 text-red-800',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function JobsTable() {
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
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {job.id}
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
                    <div className="text-sm font-medium text-gray-900">{job.customer}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[job.status as keyof typeof statusStyles]}`}>
                          {job.status.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'in-progress' ? 'bg-yellow-500' :
                            job.status === 'starting-soon' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {job.assignee}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <Camera className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{job.photosCount}</span>
                    <span className="text-gray-500 ml-1">photos</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {job.lastUpdate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(job.startDate)} - {formatDate(job.estimatedCompletion)}
                    </div>
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
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 5 of 12 jobs
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