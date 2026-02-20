'use client'

import { useState, useEffect } from 'react'
import { Eye, Clock, DollarSign, Activity } from 'lucide-react'

interface Proposal {
  id: string
  customer_name: string
  project_title: string
  total: number
  status: string
  created_at: string
  viewed_at?: string | null
}

const statusToWidth = (status: string) => {
  if (status === 'signed') return '100%'
  if (status === 'pending') return '70%'
  if (status === 'viewed') return '45%'
  return '20%'
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

const timeStampLabel = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000)
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActiveProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/proposals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProposals(data.proposals.slice(0, 4))
        } else {
          setError('Failed to load proposals')
        }
      })
      .catch(() => setError('Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-[#090d16]/80 p-6 text-center text-white/70">
        Loading proposals...
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-[#090d16]/80 p-6 text-center text-[#f34aff]">
        {error}
      </section>
    )
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#090d16]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/50">Proposal radar</p>
          <h3 className="mt-2 text-2xl font-[Chakra Petch] text-white">Active pursuits</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
          <Activity className="h-3.5 w-3.5 text-[#51f4ff]" />
          {proposals.length} live
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {proposals.map((proposal) => (
          <article
            key={proposal.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4"
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'linear-gradient(120deg, rgba(81,244,255,0.4) 0%, transparent 60%)' }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">{proposal.id}</p>
                <h4 className="mt-1 text-lg font-semibold text-white">{proposal.customer_name}</h4>
                <p className="text-sm text-white/60">{proposal.project_title}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p className="font-semibold text-white">{formatCurrency(proposal.total)}</p>
                <p>{proposal.status}</p>
              </div>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-[#f5b755]" />
                {timeStampLabel(proposal.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3 text-[#51f4ff]" />
                {proposal.viewed_at ? timeStampLabel(proposal.viewed_at) : 'No views'}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-white/50" />
                SLA 12h
              </div>
            </div>
            <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#f34aff] via-[#51f4ff] to-[#6cffba]"
                style={{ width: statusToWidth(proposal.status) }}
              />
            </div>
          </article>
        ))}
      </div>

      <button className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30">
        Launch proposal matrix →
      </button>
    </section>
  )
}
