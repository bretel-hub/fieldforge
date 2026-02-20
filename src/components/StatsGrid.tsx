'use client'

import { DollarSign, FileText, Camera, TrendingUp } from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '$127,500',
    change: '+12.3%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Proposals',
    value: '23',
    change: '+3 this week',
    changeType: 'positive',
    icon: FileText,
  },
  {
    name: 'Jobs in Progress',
    value: '12',
    change: '8 completing this week',
    changeType: 'neutral',
    icon: Camera,
  },
  {
    name: 'Win Rate',
    value: '68%',
    change: '+5.2%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

const changeTone = {
  positive: 'text-emerald-600 bg-emerald-50',
  neutral: 'text-gray-500 bg-gray-100',
  negative: 'text-rose-600 bg-rose-50'
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-[24px] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">{stat.name}</p>
              <p className="mt-3 text-3xl font-[Space Grotesk] text-[var(--text-primary)]">{stat.value}</p>
            </div>
            <span className="rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--accent)]">
              <stat.icon className="h-6 w-6" />
            </span>
          </div>
          <p className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${changeTone[stat.changeType as keyof typeof changeTone]}`}>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  )
}
