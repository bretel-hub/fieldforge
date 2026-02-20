'use client'

import { DollarSign, FileText, Camera, TrendingUp } from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '$127,500',
    change: '+12.3% vs last cycle',
    tone: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Proposals',
    value: '23',
    change: '3 escalated today',
    tone: 'signal',
    icon: FileText,
  },
  {
    name: 'Jobs in Progress',
    value: '12',
    change: '8 near completion',
    tone: 'neutral',
    icon: Camera,
  },
  {
    name: 'Win Rate',
    value: '68%',
    change: '+5.2% lift',
    tone: 'positive',
    icon: TrendingUp,
  },
]

const toneMap = {
  positive: 'text-[#6CFFBA] bg-[#6cffba14]',
  signal: 'text-[#51f4ff] bg-[#51f4ff14]',
  neutral: 'text-white/70 bg-white/5',
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#090d16]/80 p-6 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]"
        >
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle at ${20 + index * 15}% 0%, var(--accent-cyan), transparent 55%)`
          }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">{stat.name}</p>
              <p className="mt-3 text-4xl font-[Chakra Petch] text-white">{stat.value}</p>
            </div>
            <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
              <stat.icon className="h-6 w-6" />
            </span>
          </div>
          <p className={`mt-6 inline-flex rounded-full px-3 py-1 text-[13px] font-medium ${toneMap[stat.tone as keyof typeof toneMap]}`}>
            {stat.change}
          </p>
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#f34aff] via-[#51f4ff] to-[#6cffba]"
              style={{ width: `${60 + index * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
