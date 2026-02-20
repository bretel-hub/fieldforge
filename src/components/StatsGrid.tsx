'use client'

import { DollarSign, FileText, Camera, TrendingUp } from 'lucide-react'

const stats = [
  {
    name: 'Total revenue',
    value: '$127,500',
    change: '+12.3% vs last cycle',
    tone: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active proposals',
    value: '23',
    change: '3 escalated today',
    tone: 'info',
    icon: FileText,
  },
  {
    name: 'Jobs in progress',
    value: '12',
    change: '8 near completion',
    tone: 'neutral',
    icon: Camera,
  },
  {
    name: 'Win rate',
    value: '68%',
    change: '+5.2% lift',
    tone: 'positive',
    icon: TrendingUp,
  },
]

const toneMap = {
  positive: 'text-[#0c6cf2] bg-[#0c6cf20d]',
  info: 'text-[#14b8a6] bg-[#14b8a60d]',
  neutral: 'text-[#7a7a71] bg-[#7a7a7111]',
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">{stat.name}</p>
              <p className="mt-3 text-4xl font-[Manrope] text-[var(--text)]">{stat.value}</p>
            </div>
            <span className="rounded-2xl bg-[var(--surface-alt)] p-3 text-[#0c6cf2]">
              <stat.icon className="h-6 w-6" />
            </span>
          </div>
          <p className={`mt-6 inline-flex rounded-full px-3 py-1 text-[13px] font-medium ${toneMap[stat.tone as keyof typeof toneMap]}`}>
            {stat.change}
          </p>
          <div className="mt-4 h-[4px] w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0c6cf2] via-[#14b8a6] to-[#7c3aed]"
              style={{ width: stat.tone === 'neutral' ? '55%' : '80%' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
