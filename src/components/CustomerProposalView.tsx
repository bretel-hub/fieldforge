'use client'

import { CheckCircle, Clock, Eye, Download } from 'lucide-react'

interface ProposalTier {
  name: string
  total: number
  description: string
  recommended?: boolean
}

interface Proposal {
  id: string
  title: string
  value: number
  status: string
  created: string
  lastViewed?: string
  signedAt?: string
  description: string
  tiers?: ProposalTier[]
}

interface CustomerProposalViewProps {
  proposal: Proposal
}

const statusStyles = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Awaiting Your Review' },
  'viewed': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye, label: 'Under Review' },
  'signed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' },
  'declined': { bg: 'bg-red-100', text: 'text-red-800', icon: Clock, label: 'Declined' },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CustomerProposalView({ proposal }: CustomerProposalViewProps) {
  const statusConfig = statusStyles[proposal.status as keyof typeof statusStyles]
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{proposal.title}</h3>
            <p className="text-sm text-gray-600 mt-1">Proposal {proposal.id}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="h-4 w-4 mr-2" />
              {statusConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <p className="text-gray-700 mb-6">{proposal.description}</p>

        {/* Pricing Options */}
        {proposal.tiers && proposal.tiers.length > 0 ? (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {proposal.tiers.map((tier, index) => (
                <div 
                  key={index}
                  className={`border-2 rounded-lg p-4 ${
                    tier.recommended 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <h5 className={`font-semibold mb-2 ${
                      tier.recommended ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {tier.name}
                    </h5>
                    {tier.recommended && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        Recommended
                      </span>
                    )}
                    <div className={`text-3xl font-bold mb-2 ${
                      tier.recommended ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {formatCurrency(tier.total)}
                    </div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(proposal.value)}
              </div>
              <p className="text-gray-600">Total project cost</p>
            </div>
          </div>
        )}

        {/* Status-specific content */}
        {proposal.status === 'pending' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-800 mb-2">Next Steps</h5>
            <p className="text-yellow-700 text-sm mb-3">
              Please review the proposal options above. If you have any questions, don't hesitate to contact us.
            </p>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Accept Proposal
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                Request Changes
              </button>
            </div>
          </div>
        )}

        {proposal.status === 'viewed' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Under Review</h5>
            <p className="text-blue-700 text-sm">
              Thank you for reviewing our proposal. We're here to answer any questions you may have.
            </p>
          </div>
        )}

        {proposal.status === 'signed' && proposal.signedAt && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-2">Proposal Approved!</h5>
            <p className="text-green-700 text-sm">
              Approved on {formatDate(proposal.signedAt)}. We'll be in touch soon to schedule the work.
            </p>
          </div>
        )}

        {/* Proposal Details */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Proposal Date:</span>
              <span className="ml-2 text-gray-900">{formatDate(proposal.created)}</span>
            </div>
            {proposal.lastViewed && (
              <div>
                <span className="text-gray-500">Last Viewed:</span>
                <span className="ml-2 text-gray-900">{formatDate(proposal.lastViewed)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              Contact Us About This Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}