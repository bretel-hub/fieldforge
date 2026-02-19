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
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
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
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Proposals</h3>
          <span className="text-sm text-gray-500">
            {loading ? '…' : `${proposals.length} total`}
          </span>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 py-4 text-center">Loading…</p>
        )}

        {error && (
          <p className="text-sm text-red-500 py-4 text-center">{error}</p>
        )}

        {!loading && !error && proposals.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">No active proposals</p>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border-l-4 border-blue-400 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {proposal.customer_name}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[proposal.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{proposal.project_title}</p>
                  <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(proposal.total)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo(proposal.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Link
            href="/proposals"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all proposals →
          </Link>
        </div>
      </div>
    </div>
  )
}
