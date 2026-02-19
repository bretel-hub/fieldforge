'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Edit, MoreHorizontal, Download, Send } from 'lucide-react'

interface Proposal {
  id: string
  proposal_number: string
  customer_name: string
  customer_address: string
  project_title: string
  total: number
  status: string
  created_at: string
  viewed_at?: string | null
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  viewed: 'bg-blue-100 text-blue-800',
  signed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProposalsTable() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <div className="text-gray-500">Loading proposals...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <div className="text-gray-500">No proposals yet. Create your first one!</div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">All Proposals</h3>
          <div className="flex items-center space-x-2">
            <select className="rounded-md border-gray-300 text-sm">
              <option>All Status</option>
              <option>Draft</option>
              <option>Pending</option>
              <option>Viewed</option>
              <option>Signed</option>
              <option>Declined</option>
            </select>
            <input
              type="search"
              placeholder="Search proposals..."
              className="rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proposal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/proposals/${proposal.id}/edit`} className="group">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {proposal.proposal_number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {proposal.project_title}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{proposal.customer_name}</div>
                  <div className="text-sm text-gray-500">{proposal.customer_address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(proposal.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[proposal.status as keyof typeof statusStyles]}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      0 views
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Last: {formatDate(proposal.viewed_at || null)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/proposals/${proposal.id}/edit`}
                      className="text-blue-600 hover:text-blue-500"
                      title="Edit proposal"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="text-gray-400 hover:text-gray-500">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-500">
                      <Send className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border rounded-md disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-sm border rounded-md">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}