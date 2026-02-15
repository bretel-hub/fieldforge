'use client'

import { Eye, Edit, MoreHorizontal, Download, Send } from 'lucide-react'

const proposals = [
  {
    id: 'PROP-001',
    customer: 'ABC Manufacturing',
    title: 'Security System Upgrade',
    value: 45300,
    status: 'pending',
    created: '2026-02-12',
    lastViewed: '2026-02-15 14:30',
    viewCount: 3,
  },
  {
    id: 'PROP-002', 
    customer: 'Downtown Office Complex',
    title: 'HVAC Installation - 3 Floors',
    value: 78500,
    status: 'viewed',
    created: '2026-02-08',
    lastViewed: '2026-02-14 09:15',
    viewCount: 7,
  },
  {
    id: 'PROP-003',
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    value: 12400,
    status: 'signed',
    created: '2026-02-13',
    lastViewed: '2026-02-15 11:45',
    viewCount: 2,
  },
  {
    id: 'PROP-004',
    customer: 'Metro Health Clinic', 
    title: 'Network Infrastructure Setup',
    value: 32100,
    status: 'draft',
    created: '2026-02-10',
    lastViewed: null,
    viewCount: 0,
  },
  {
    id: 'PROP-005',
    customer: 'Greenfield Apartments',
    title: 'Building Security Cameras',
    value: 23800,
    status: 'declined',
    created: '2026-02-05',
    lastViewed: '2026-02-07 16:20',
    viewCount: 1,
  },
]

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
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {proposal.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {proposal.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{proposal.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(proposal.value)}
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
                      {proposal.viewCount} views
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Last: {formatDate(proposal.lastViewed)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-500">
                      <Edit className="h-4 w-4" />
                    </button>
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
            Showing 5 of 23 proposals
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