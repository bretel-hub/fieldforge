'use client'

import { Camera, MapPin, User } from 'lucide-react'

const jobs = [
  {
    id: 1,
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    status: 'in-progress',
    progress: 75,
    assignee: 'Mike Johnson',
    location: '123 River St',
    lastUpdate: '3 hours ago',
    photosCount: 24,
  },
  {
    id: 2,
    customer: 'Office Park Building A',
    title: 'Security Camera Installation',
    status: 'scheduled',
    progress: 0,
    assignee: 'Sarah Chen',
    location: '456 Business Blvd',
    lastUpdate: 'Starts Monday',
    photosCount: 0,
  },
  {
    id: 3,
    customer: 'Greenfield Apartments',
    title: 'HVAC Maintenance - Units 12-24',
    status: 'in-progress',
    progress: 45,
    assignee: 'Dave Rodriguez',
    location: '789 Green Ave',
    lastUpdate: '1 day ago',
    photosCount: 15,
  },
  {
    id: 4,
    customer: 'Metro Health Clinic',
    title: 'Network Infrastructure',
    status: 'starting-soon',
    progress: 10,
    assignee: 'Alex Kim',
    location: '321 Health Way',
    lastUpdate: 'Site survey completed',
    photosCount: 8,
  },
]

const statusStyles = {
  'scheduled': 'bg-gray-100 text-gray-800',
  'starting-soon': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completing': 'bg-green-100 text-green-800',
}

export function ActiveJobs() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-['Cabinet_Grotesk'] text-[var(--text-primary)]">Active Jobs</h3>
        <span className="text-sm text-[var(--text-secondary)]">12 total</span>
      </div>

      <div className="mt-4 space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{job.customer}</p>
                <p className="text-sm text-[var(--text-secondary)]">{job.title}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status as keyof typeof statusStyles]}`}>
                {job.status.replace('-', ' ')}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Progress</span>
                <span className="text-[var(--text-primary)]">{job.progress}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-indigo-400"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {job.assignee}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Camera className="h-3 w-3" />
                {job.photosCount} photos
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">Last update: {job.lastUpdate}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button className="text-sm font-semibold text-[var(--accent)] hover:text-blue-700">
          View all jobs →
        </button>
      </div>
    </div>
  )
}
