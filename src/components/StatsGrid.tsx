'use client'

import { useState, useEffect } from 'react'
import { DollarSign, FileText, Camera, TrendingUp } from 'lucide-react'

const ACTIVE_STATUSES = ['pending', 'approved']

export function StatsGrid() {
  const [activeProposalCount, setActiveProposalCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/proposals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const count = (data.proposals as { status: string }[]).filter((p) =>
            ACTIVE_STATUSES.includes(p.status)
          ).length
          setActiveProposalCount(count)
        }
      })
      .catch(() => {/* leave as null */})
  }, [])

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
      value: activeProposalCount !== null ? String(activeProposalCount) : '…',
      change: '',
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

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
