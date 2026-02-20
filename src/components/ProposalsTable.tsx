'use client'

import { useState, useEffect, useMemo } from 'react'
import { Eye, Edit, MoreHorizontal, Download, Send, Search, Filter } from 'lucide-react'

interface Proposal {
  id: string
  proposal_number: string
  customer_name: string
  project_title: string
  total: number
  status: string
  created_at: string
  viewed_at?: string | null
}

const statusTokens: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-[#7a7a71] bg-[#f3f1ed]' },
  pending: { label: 'Pending', color: 'text-[#b76a00] bg-[#fef4e6]' },
  viewed: { label: 'Viewed', color: 'text-[#0f766e] bg-[#eefbf9]' },
  signed: { label: 'Signed', color: 'text-[#0c6cf2] bg-[#e3f3ff]' },
  declined: { label: 'Declined', color: 'text-[#b42318] bg-[#feeceb]' },
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const filters = ['all', 'draft', 'pending', 'viewed', 'signed', 'declined']

export function ProposalsTable() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await fetch('/api/proposals')
        const data = await response.json()

        if (data.success) {
          setProposals(data.proposals)
        } else {
          setError(data.error || 'Failed to load proposals')
        }
      } catch (err) {
        setError('An error occurred while loading proposals')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [])

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesFilter =
        activeFilter === 'all' ? true : proposal.status === activeFilter
      const matchesQuery =
        proposal.customer_name.toLowerCase().includes(query.toLowerCase()) ||
        proposal.project_title.toLowerCase().includes(query.toLowerCase()) ||
        proposal.proposal_number.toLowerCase().includes(query.toLowerCase())

      return matchesFilter && matchesQuery
    })
  }, [proposals, activeFilter, query])

  if (loading) {
    return (
      <div className="rounded-[32px] border border-[var(--border)] bg-white p-12 text-center text-[var(--text-muted)]">
        Loading proposals…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-[var(--border)] bg-white p-12 text-center text-[#b42318]">
        {error}
      </div>
    )
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <header className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">All proposals</p>
          <p className="text-2xl font-[Manrope] text-[var(--text)]">
            {filteredProposals.length || 'No'} records
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search customers or numbers"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-full border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#0c6cf2]"
            />
          </label>
          <span className="hidden items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] md:inline-flex">
            <Filter className="h-4 w-4" /> Filters
          </span>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-3 py-1 capitalize ${
              activeFilter === filter
                ? 'border-[#0c6cf2] bg-[#e3f3ff] text-[#0c6cf2]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredProposals.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--text-muted)]">
          Nothing matches your filters. Try clearing search.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm text-[var(--text)]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                <th className="pb-3 pr-4 font-medium">Proposal</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Value</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Last activity</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="align-top">
                  <td className="py-4 pr-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">{proposal.proposal_number}</p>
                    <p className="font-semibold">{proposal.project_title}</p>
                    <p className="text-xs text-[var(--text-muted)]">Created {formatDate(proposal.created_at)}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-medium">{proposal.customer_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Operations · Tier 2</p>
                  </td>
                  <td className="py-4 pr-4 font-semibold">{formatCurrency(proposal.total)}</td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusTokens[proposal.status]?.color ?? 'bg-[var(--surface-alt)] text-[var(--text)]'}`}>
                      {statusTokens[proposal.status]?.label ?? proposal.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#0c6cf2]" />
                      {proposal.viewed_at ? 'Opened' : 'No views yet'}
                    </div>
                    <p className="text-xs">{formatDate(proposal.viewed_at || null)}</p>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex flex-wrap gap-2">
                      {[Edit, Download, Send, MoreHorizontal].map((Icon, idx) => (
                        <button key={idx} className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[#0c6cf2]">
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
