'use client'

import { Eye, Clock, DollarSign } from 'lucide-react'

const proposals = [
  {
    id: 1,
    customer: 'ABC Manufacturing',
    title: 'Security System Upgrade',
    value: '$45,300',
    status: 'pending',
    lastViewed: '2 hours ago',
    created: '3 days ago',
  },
  {
    id: 2,
    customer: 'Downtown Office Complex',
    title: 'HVAC Installation - 3 Floors',
    value: '$78,500',
    status: 'viewed',
    lastViewed: '1 day ago',
    created: '1 week ago',
  },
  {
    id: 3,
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    value: '$12,400',
    status: 'signed',
    lastViewed: 'Just signed',
    created: '2 days ago',
  },
  {
    id: 4,
    customer: 'Metro Health Clinic',
    title: 'Network Infrastructure',
    value: '$32,100',
    status: 'pending',
    lastViewed: 'Not yet viewed',
    created: '5 days ago',
  },
]

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  viewed: 'bg-blue-100 text-blue-800', 
  signed: 'bg-green-100 text-green-800',
}

export function ActiveProposals() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Proposals</h3>
          <span className="text-sm text-gray-500">23 total</span>
        </div>
        
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border-l-4 border-blue-400 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {proposal.customer}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[proposal.status as keyof typeof statusStyles]}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{proposal.title}</p>
                  <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {proposal.value}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {proposal.lastViewed}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {proposal.created}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all proposals →
          </button>
        </div>
      </div>
    </div>
  )
}