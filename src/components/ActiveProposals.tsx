'use client'

import { useState, useEffect } from 'react'
import { Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Proposal {
  id: string
  customer_name: string
  project_title: string
  total: number
  status: string
  created_at: string
}

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-rose-100 text-rose-800',
}

const ACTIVE_STATUSES = ['pending', 'approved']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return `${Math.floor(diff / 604800)} weeks ago`
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
          const active = (data.proposals as Proposal[]).filter((p) =>
            ACTIVE_STATUSES.includes(p.status)
          )
          setProposals(active)
        } else {
          setError('Failed to load proposals')
        }
      })
      .catch(() => setError('Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-['Cabinet_Grotesk'] text-[var(--text-primary)]">Active Proposals</h3>
        <span className="text-sm text-[var(--text-secondary)]">
          {loading ? '…' : `${proposals.length} total`}
        </span>
      </div>

      {loading && (
        <p className="text-sm text-[var(--text-secondary)] py-6 text-center">Loading…</p>
      )}

      {error && (
        <p className="text-sm text-rose-600 py-6 text-center">{error}</p>
      )}

      {!loading && !error && proposals.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)] py-6 text-center">No active proposals</p>
      )}

      <div className="mt-4 space-y-4">
        {proposals.slice(0, 4).map((proposal) => (
          <div key={proposal.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{proposal.customer_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{proposal.project_title}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[proposal.status] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {proposal.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(proposal.total)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(proposal.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Link
          href="/proposals"
          className="text-sm font-semibold text-[var(--accent)] hover:text-blue-700"
        >
          View all proposals →
        </Link>
      </div>
    </div>
  )
}
