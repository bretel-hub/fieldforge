'use client'

import { Camera, MapPin, User } from 'lucide-react'

const jobs = [
  {
    id: 'Z4',
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    status: 'In progress',
    progress: 75,
    assignee: 'Mike Johnson',
    location: '123 River St',
    lastUpdate: 'Breaker panel cleared · 3h ago',
    photosCount: 24,
  },
  {
    id: 'Q9',
    customer: 'Office Park Building A',
    title: 'Security Camera Installation',
    status: 'Scheduled',
    progress: 10,
    assignee: 'Sarah Chen',
    location: '456 Business Blvd',
    lastUpdate: 'Kit arrival ETA 12h',
    photosCount: 0,
  },
  {
    id: 'H2',
    customer: 'Greenfield Apartments',
    title: 'HVAC Maintenance · Units 12-24',
    status: 'In progress',
    progress: 45,
    assignee: 'Dave Rodriguez',
    location: '789 Green Ave',
    lastUpdate: '14 tasks open',
    photosCount: 15,
  },
]

export function ActiveJobs() {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Field crews</p>
          <h3 className="mt-2 text-2xl font-[Manrope] text-[var(--text)]">Live jobs</h3>
        </div>
        <div className="text-right text-sm text-[var(--text-muted)]">
          <p>12 active</p>
          <p>3 off-grid</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-[var(--text-muted)]">{job.id}</p>
                <h4 className="text-lg font-semibold text-[var(--text)]">{job.customer}</h4>
                <p className="text-sm text-[var(--text-muted)]">{job.title}</p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[#0c6cf2]">
                {job.status}
              </span>
            </header>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#0c6cf2]" />
                {job.assignee}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#0c6cf2]" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-[#7a7a71]" />
                {job.photosCount} photos
              </div>
            </div>

            <p className="mt-2 text-xs text-[var(--text-muted)]">{job.lastUpdate}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Progress</span>
                <span className="text-[var(--text)]">{job.progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--surface-alt)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0c6cf2] to-[#14b8a6]"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
