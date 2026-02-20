'use client'

import { FileText, Camera, DollarSign, User, CheckCircle, Clock } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'proposal_signed',
    message: 'Riverside Restaurant signed Kitchen Electrical Work',
    value: '$12,400',
    time: '02:32 · Voice ack',
    icon: FileText,
  },
  {
    id: 2,
    type: 'job_photo_uploaded',
    message: 'Mike Johnson uploaded 8 roof photos',
    time: '03:18 · Auto-sync',
    icon: Camera,
  },
  {
    id: 3,
    type: 'payment_received',
    message: 'Deposit cleared from Metro Health Clinic',
    value: '$5,200',
    time: 'Yesterday 18:11',
    icon: DollarSign,
  },
  {
    id: 4,
    type: 'job_completed',
    message: 'Sarah Chen closed Office Park security install',
    time: 'Yesterday 09:54',
    icon: CheckCircle,
  },
  {
    id: 5,
    type: 'customer_added',
    message: 'TechStart Coworking Space onboarding started',
    time: '2 days ago',
    icon: User,
  },
  {
    id: 6,
    type: 'job_started',
    message: 'Dave Rodriguez dispatched to Greenfield HVAC',
    time: '4 days ago',
    icon: Clock,
  },
]

const colorMap: Record<string, string> = {
  proposal_signed: '#6CFFBA',
  job_photo_uploaded: '#51F4FF',
  payment_received: '#F5B755',
  job_completed: '#6CFFBA',
  customer_added: '#F34AFF',
  job_started: '#FFFFFF',
}

export function RecentActivity() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#090d16]/80 p-6">
      <h3 className="text-xs uppercase tracking-[0.45em] text-white/50">Event Stream</h3>
      <p className="mt-2 text-2xl font-[Chakra Petch] text-white">Telemetry feed</p>
      <div className="mt-6 space-y-6">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative pl-10">
            {idx !== activities.length - 1 && (
              <span className="absolute left-4 top-8 h-full w-px bg-gradient-to-b from-white/30 to-transparent" />
            )}
            <span
              className="absolute left-0 top-3 h-6 w-6 rounded-full border border-white/20 bg-white/10 flex items-center justify-center"
              style={{ boxShadow: `0 0 18px ${colorMap[activity.type]}33` }}
            >
              <activity.icon className="h-3.5 w-3.5" style={{ color: colorMap[activity.type] }} />
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white">{activity.message}</p>
                {activity.value && (
                  <span className="text-xs font-semibold text-[#6cffba]">{activity.value}</span>
                )}
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-white/40">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 inline-flex items-center gap-2 text-sm text-[#51f4ff]">
        Open full journal ↗
      </button>
    </section>
  )
}
