'use client'

import { useState, useEffect } from 'react'
import { Eye, Clock, DollarSign, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Proposal {
  id: string
  customer_name: string
  project_title: string
  total: number
  status: string
  created_at: string
  viewed_at?: string | null
}

const pillTone: Record<string, string> = {
  signed: 'bg-[#e3f3ff] text-[#0c6cf2]',
  pending: 'bg-[#fef4e6] text-[#b76a00]',
  viewed: 'bg-[#eefbf9] text-[#0f766e]',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

const stamp = (dateStr: string) => {
  const date = new Date(dateStr)
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
      <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 text-center text-[var(--text-muted)]">
        Loading proposals…
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 text-center text-[#b42318]">
        {error}
      </section>
    )
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Proposal radar</p>
          <h3 className="mt-2 text-2xl font-[Manrope] text-[var(--text)]">Active pursuits</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">
          <Activity className="h-3.5 w-3.5 text-[#0c6cf2]" />
          {proposals.length} live
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {proposals.map((proposal) => (
          <article key={proposal.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-[var(--text-muted)]">{proposal.id}</p>
                <h4 className="mt-1 text-lg font-semibold text-[var(--text)]">{proposal.customer_name}</h4>
                <p className="text-sm text-[var(--text-muted)]">{proposal.project_title}</p>
              </div>
              <div className="text-right text-sm text-[var(--text-muted)]">
                <p className="text-lg font-semibold text-[var(--text)]">{formatCurrency(proposal.total)}</p>
                <p className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', pillTone[proposal.status] ?? 'bg-[var(--surface-alt)] text-[var(--text)]')}>
                  {proposal.status}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-[#0c6cf2]" />
                Created {stamp(proposal.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3 text-[#0c6cf2]" />
                {proposal.viewed_at ? `Viewed ${stamp(proposal.viewed_at)}` : 'No views'}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-[#7a7a71]" />
                SLA 12h
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
