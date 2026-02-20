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
  draft: { label: 'Draft', color: 'text-white bg-white/10' },
  pending: { label: 'Pending', color: 'text-[#f5b755] bg-[#f5b7551a]' },
  viewed: { label: 'Viewed', color: 'text-[#51f4ff] bg-[#51f4ff1a]' },
  signed: { label: 'Signed', color: 'text-[#6cffba] bg-[#6cffba1a]' },
  declined: { label: 'Declined', color: 'text-[#f34aff] bg-[#f34aff1a]' },
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
      <div className="rounded-[32px] border border-white/10 bg-[#080c15]/80 p-12 text-center text-white/70">
        Loading proposals...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#080c15]/80 p-12 text-center text-[#f34aff]">
        {error}
      </div>
    )
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080c15]/80 p-6">
      <header className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">All proposals</p>
          <p className="text-2xl font-[Chakra Petch] text-white">
            {filteredProposals.length || 'No'} records
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              placeholder="Search customers or numbers"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 rounded-full border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            />
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.4em] text-white/60 md:inline-flex">
            <Filter className="h-4 w-4" />
            Filters
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-3 py-1 capitalize transition ${
              activeFilter === filter
                ? 'border-white bg-white text-[#0f1729]'
                : 'border-white/15 text-white/60 hover:border-white/40'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredProposals.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/60">
          Nothing matches your filters. Try switching the segment or clearing search.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/5">
          <div className="hidden bg-white/5 px-6 py-4 text-xs uppercase tracking-[0.4em] text-white/50 md:grid md:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.8fr_0.5fr]">
            <span>Proposal</span>
            <span>Customer</span>
            <span>Value</span>
            <span>Status</span>
            <span>Last activity</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {filteredProposals.map((proposal) => (
              <article
                key={proposal.id}
                className="grid gap-6 bg-[#090f1a] px-6 py-5 text-sm text-white md:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.8fr_0.5fr]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                    {proposal.proposal_number}
                  </p>
                  <p className="mt-1 font-semibold">{proposal.project_title}</p>
                  <p className="text-xs text-white/50">Created {formatDate(proposal.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium">{proposal.customer_name}</p>
                  <p className="text-xs text-white/50">Operations · Tier 2</p>
                </div>
                <div className="font-semibold">{formatCurrency(proposal.total)}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                      statusTokens[proposal.status]?.color ?? 'bg-white/10 text-white'
                    }`}
                  >
                    {statusTokens[proposal.status]?.label ?? proposal.status}
                  </span>
                </div>
                <div className="text-white/70">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#51f4ff]" />
                    {proposal.viewed_at ? 'Opened' : 'No views yet'}
                  </div>
                  <p className="text-xs text-white/40">{formatDate(proposal.viewed_at || null)}</p>
                </div>
                <div className="flex items-center justify-end gap-2 text-white/60">
                  <button className="rounded-full border border-white/15 p-2 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded-full border border-white/15 p-2 hover:text-white">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-full border border-white/15 p-2 hover:text-white">
                    <Send className="h-4 w-4" />
                  </button>
                  <button className="rounded-full border border-white/15 p-2 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
