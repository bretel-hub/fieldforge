'use client'

import { Camera, MapPin, User } from 'lucide-react'

const jobs = [
  {
    id: 'Z4',
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    status: 'IN-PROGRESS',
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
    status: 'SCHEDULED',
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
    status: 'IN-PROGRESS',
    progress: 45,
    assignee: 'Dave Rodriguez',
    location: '789 Green Ave',
    lastUpdate: '14 tasks open',
    photosCount: 15,
  },
  {
    id: 'M8',
    customer: 'Metro Health Clinic',
    title: 'Network Infrastructure',
    status: 'STARTING',
    progress: 5,
    assignee: 'Alex Kim',
    location: '321 Health Way',
    lastUpdate: 'Site survey logged',
    photosCount: 8,
  },
]

const statusTone: Record<string, string> = {
  'IN-PROGRESS': 'text-[#f5b755] bg-[#f5b7551f]',
  'SCHEDULED': 'text-[#51f4ff] bg-[#51f4ff12]',
  'STARTING': 'text-white/70 bg-white/10',
}

export function ActiveJobs() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080c15]/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/50">Field crews</p>
          <h3 className="mt-2 text-2xl font-[Chakra Petch] text-white">Live jobs</h3>
        </div>
        <div className="text-right text-sm text-white/60">
          <p>12 active</p>
          <p className="text-white/40">3 off-grid</p>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">{job.id}</p>
                <h4 className="text-lg font-semibold text-white">{job.customer}</h4>
                <p className="text-sm text-white/60">{job.title}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusTone[job.status]}`}>
                {job.status}
              </span>
            </header>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-white/80" />
                {job.assignee}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#51f4ff]" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-[#f34aff]" />
                {job.photosCount} photos
              </div>
            </div>

            <p className="mt-2 text-xs text-white/50">{job.lastUpdate}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Progress</span>
                <span className="text-white">{job.progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f34aff] via-[#51f4ff] to-[#6cffba]"
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
