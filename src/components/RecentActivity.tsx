'use client'

import { FileText, Camera, DollarSign, User, CheckCircle, Clock } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'proposal_signed',
    message: 'Riverside Restaurant signed proposal for Kitchen Electrical Work',
    value: '$12,400',
    time: '2 hours ago',
    icon: FileText,
    accent: 'text-emerald-500 bg-emerald-50',
  },
  {
    id: 2,
    type: 'job_photo_uploaded',
    message: 'Mike Johnson uploaded 8 photos to Riverside Restaurant project',
    time: '3 hours ago',
    icon: Camera,
    accent: 'text-sky-500 bg-sky-50',
  },
  {
    id: 3,
    type: 'proposal_viewed',
    message: 'Downtown Office Complex viewed HVAC Installation proposal',
    time: '1 day ago',
    icon: FileText,
    accent: 'text-amber-500 bg-amber-50',
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Received $5,200 deposit from Metro Health Clinic',
    value: '$5,200',
    time: '1 day ago',
    icon: DollarSign,
    accent: 'text-emerald-500 bg-emerald-50',
  },
  {
    id: 5,
    type: 'job_completed',
    message: 'Sarah Chen marked Office Park Building security installation as completed',
    time: '2 days ago',
    icon: CheckCircle,
    accent: 'text-emerald-500 bg-emerald-50',
  },
  {
    id: 6,
    type: 'proposal_created',
    message: 'New proposal created for ABC Manufacturing - Security System Upgrade',
    value: '$45,300',
    time: '3 days ago',
    icon: FileText,
    accent: 'text-sky-500 bg-sky-50',
  },
  {
    id: 7,
    type: 'job_started',
    message: 'Dave Rodriguez started HVAC maintenance at Greenfield Apartments',
    time: '4 days ago',
    icon: Clock,
    accent: 'text-amber-500 bg-amber-50',
  },
  {
    id: 8,
    type: 'customer_added',
    message: 'New customer added: TechStart Coworking Space',
    time: '5 days ago',
    icon: User,
    accent: 'text-violet-500 bg-violet-50',
  },
]

export function RecentActivity() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <h3 className="text-lg font-['Cabinet_Grotesk'] text-[var(--text-primary)] mb-4">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative pl-12">
            {idx !== activities.length - 1 && (
              <span className="absolute left-[22px] top-12 h-full w-px bg-[var(--border)]" />
            )}
            <span className={`absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-full ${activity.accent}`}>
              <activity.icon className="h-4.5 w-4.5" />
            </span>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/70 px-4 py-3">
              <p className="text-sm text-[var(--text-primary)]">
                {activity.message}
                {activity.value && (
                  <span className="ml-2 font-semibold text-emerald-600">{activity.value}</span>
                )}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button className="text-sm font-semibold text-[var(--accent)] hover:text-blue-700">
          View all activity →
        </button>
      </div>
    </div>
  )
}
