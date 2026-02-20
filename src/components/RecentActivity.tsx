'use client'

import { FileText, Camera, DollarSign, User, CheckCircle } from 'lucide-react'

const activities = [
  { id: 1, icon: FileText, color: '#0c6cf2', message: 'Riverside Restaurant signed Kitchen Electrical Work', detail: '$12,400 · 02:32' },
  { id: 2, icon: Camera, color: '#14b8a6', message: 'Mike Johnson uploaded 8 roof photos', detail: 'Auto-sync · 03:18' },
  { id: 3, icon: DollarSign, color: '#b76a00', message: 'Deposit cleared from Metro Health Clinic', detail: '$5,200 · Yesterday' },
  { id: 4, icon: CheckCircle, color: '#0f9d58', message: 'Sarah Chen closed Office Park security install', detail: '09:54 Yesterday' },
  { id: 5, icon: User, color: '#7a7a71', message: 'TechStart Coworking Space onboarding started', detail: '2 days ago' },
]

export function RecentActivity() {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <h3 className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Event stream</h3>
      <div className="mt-4 space-y-5">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative pl-10">
            {idx !== activities.length - 1 && (
              <span className="absolute left-4 top-8 h-full w-px bg-[var(--surface-alt)]" />
            )}
            <span
              className="absolute left-0 top-3 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
            >
              <activity.icon className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--text)]">{activity.message}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{activity.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
