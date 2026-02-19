'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Download, Mail, Trash2 } from 'lucide-react'
import { ProposalPreview } from '@/components/ProposalPreview'
import { ConfettiCelebration } from '@/components/ConfettiCelebration'
import { offlineStorage } from '@/lib/offlineStorage'

interface Proposal {
  id: string
  proposal_number: string
  customer_name: string
  customer_contact: string
  customer_email: string
  customer_address: string
  project_title: string
  total: number
  status: string
  created_at: string
}

interface FullProposal {
  proposal_number: string
  customer_name: string
  customer_contact: string
  customer_email: string
  customer_address: string
  project_title: string
  project_description: string
  project_location: string
  project_timeline: string
  subtotal: number
  tax_amount: number
  total: number
  items: Array<{
    id: string
    category: string
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}


export function ProposalsTable() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [previewProposal, setPreviewProposal] = useState<FullProposal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const filteredProposals = useMemo(() => {
    let result = proposals

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.proposal_number.toLowerCase().includes(term) ||
          p.project_title.toLowerCase().includes(term) ||
          (p.customer_name || '').toLowerCase().includes(term) ||
          (p.customer_contact || '').toLowerCase().includes(term) ||
          (p.customer_address || '').toLowerCase().includes(term)
      )
    }

    return result
  }, [proposals, statusFilter, search])

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

  const handleStatusChange = async (proposal: Proposal, newStatus: string) => {
    if (newStatus === proposal.status) return
    setUpdatingStatus(proposal.id)
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposal.id ? { ...p, status: newStatus } : p))
        )
        if (newStatus === 'approved') {
          const jobId = `JOB-${proposal.id}`

          // Fetch full proposal to get description, location, timeline
          let projectDescription = ''
          let projectLocation = proposal.customer_address
          let projectTimeline = ''
          try {
            const fullRes = await fetch(`/api/proposals/${proposal.id}`)
            const fullData = await fullRes.json()
            if (fullData.success && fullData.proposal) {
              projectDescription = [
                fullData.proposal.project_description,
                fullData.proposal.project_timeline ? `Timeline: ${fullData.proposal.project_timeline}` : '',
              ].filter(Boolean).join('\n\n')
              projectLocation = fullData.proposal.project_location || proposal.customer_address
              projectTimeline = fullData.proposal.project_timeline || ''
            }
          } catch {
            // non-fatal — proceed with basic data
          }

          await offlineStorage.saveJob({
            id: jobId,
            jobNumber: `JOB-${proposal.proposal_number}`,
            title: proposal.project_title,
            status: 'scheduled',
            customerId: proposal.customer_name || proposal.customer_contact,
            customerName: proposal.customer_name || proposal.customer_contact,
            technicianId: 'unassigned',
            scheduledDate: new Date().toISOString().split('T')[0],
            value: proposal.total,
            location: { address: projectLocation },
            description: projectDescription,
            notes: projectTimeline ? `Timeline: ${projectTimeline}` : undefined,
            syncStatus: 'pending',
          })
          setShowConfetti(true)
        }
      }
    } catch (err) {
      console.error('Failed to update proposal status:', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}`)
      const data = await response.json()
      if (data.success) {
        setPreviewProposal(data.proposal)
      }
    } catch (err) {
      console.error('Failed to fetch proposal for PDF:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/proposals/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setProposals((prev) => prev.filter((p) => p.id !== deleteTarget.id))
        setDeleteTarget(null)
      }
    } catch (err) {
      console.error('Failed to delete proposal:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleEmail = (proposal: Proposal) => {
    const subject = encodeURIComponent(
      `Proposal ${proposal.proposal_number}: ${proposal.project_title}`
    )
    const body = encodeURIComponent(
      `Please find attached the proposal ${proposal.proposal_number} for ${proposal.project_title}.\n\nTotal: ${formatCurrency(proposal.total)}\n\nPlease let us know if you have any questions.`
    )
    window.open(`mailto:${proposal.customer_email || ''}?subject=${subject}&body=${body}`)
  }

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
    <>
      {showConfetti && (
        <ConfettiCelebration onComplete={() => setShowConfetti(false)} />
      )}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Proposals</h3>
            <div className="flex items-center space-x-2">
              <select
                className="rounded-md border-gray-300 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
              <input
                type="search"
                placeholder="Search proposals..."
                className="rounded-md border-gray-300 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No proposals match your filters.
                  </td>
                </tr>
              )}
              {filteredProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/proposals/${proposal.id}/edit`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {proposal.proposal_number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {proposal.project_title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {proposal.customer_name || proposal.customer_contact}
                    </div>
                    <div className="text-sm text-gray-500">{proposal.customer_address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(proposal.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={proposal.status}
                      onChange={(e) => handleStatusChange(proposal, e.target.value)}
                      disabled={updatingStatus === proposal.id}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${statusStyles[proposal.status as keyof typeof statusStyles] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/proposals/${proposal.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit proposal"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(proposal.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => handleEmail(proposal)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                        title="Email proposal"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </button>
                      <button
                        onClick={() => setDeleteTarget(proposal)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete proposal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
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
              Showing {filteredProposals.length} of {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Delete Proposal</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure want to delete this proposal?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewProposal && (
        <ProposalPreview
          proposalNumber={previewProposal.proposal_number}
          customer={{
            name: previewProposal.customer_name,
            contact: previewProposal.customer_contact,
            email: previewProposal.customer_email,
            address: previewProposal.customer_address,
          }}
          projectDetails={{
            title: previewProposal.project_title,
            description: previewProposal.project_description,
            location: previewProposal.project_location,
            timeline: previewProposal.project_timeline,
          }}
          items={previewProposal.items.map((item) => ({
            id: item.id,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
          }))}
          subtotal={previewProposal.subtotal}
          tax={previewProposal.tax_amount}
          total={previewProposal.total}
          onClose={() => setPreviewProposal(null)}
        />
      )}
    </>
  )
}
