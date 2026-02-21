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
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-rose-100 text-rose-800',
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
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

          let projectDescription = ''
          let projectLocation = proposal.customer_address
          let customerContact = proposal.customer_contact || ''
          let customerEmail = proposal.customer_email || ''
          let customerAddress = proposal.customer_address || ''
          let lineItems: Array<{ id: string; category: string; description: string; quantity: number; unitPrice: number; total: number }> = []
          let subtotal: number | undefined
          let taxAmount: number | undefined
          try {
            const fullRes = await fetch(`/api/proposals/${proposal.id}`)
            const fullData = await fullRes.json()
            if (fullData.success && fullData.proposal) {
              const fp = fullData.proposal
              projectDescription = fp.project_description || ''
              projectLocation = fp.project_location || proposal.customer_address
              customerContact = fp.customer_contact || customerContact
              customerEmail = fp.customer_email || customerEmail
              customerAddress = fp.customer_address || customerAddress
              subtotal = fp.subtotal
              taxAmount = fp.tax_amount
              lineItems = (fp.items ?? []).map((item: any) => ({
                id: item.id,
                category: item.category,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                total: item.total,
              }))
            }
          } catch {
            // non-fatal
          }

          await offlineStorage.saveJob({
            id: jobId,
            jobNumber: `JOB-${proposal.proposal_number}`,
            title: proposal.project_title,
            status: 'scheduled',
            customerId: proposal.customer_name || proposal.customer_contact,
            customerName: proposal.customer_name || proposal.customer_contact,
            customerContact,
            customerEmail,
            customerAddress,
            technicianId: 'unassigned',
            scheduledDate: new Date().toISOString().split('T')[0],
            value: proposal.total,
            location: { address: projectLocation },
            description: projectDescription,
            projectLocation: projectLocation || undefined,
            lineItems: lineItems.length > 0 ? lineItems : undefined,
            subtotal,
            taxAmount,
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
      `Please find attached the proposal ${proposal.proposal_number} for ${proposal.project_title}.\n\nTotal: ${formatCurrency(
        proposal.total
      )}\n\nPlease let us know if you have any questions.`
    )
    window.open(`mailto:${proposal.customer_email || ''}?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-12 text-center text-[var(--text-secondary)]">
        Loading proposals...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-12 text-center text-rose-600">
        {error}
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 p-12 text-center text-[var(--text-secondary)]">
        No proposals yet. Create your first one!
      </div>
    )
  }

  return (
    <>
      {showConfetti && (
        <ConfettiCelebration
          onComplete={() => {
            setShowConfetti(false)
            router.push('/jobs')
          }}
        />
      )}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/95 shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-['Sora'] text-[var(--text-primary)]">All Proposals</h3>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                className="h-10 rounded-full border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-secondary)]"
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
                className="h-10 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-secondary)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--surface-alt)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  Proposal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-white">
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                    No proposals match your filters.
                  </td>
                </tr>
              )}
              {filteredProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-[var(--surface-alt)] cursor-pointer"
                  onClick={() => router.push(`/proposals/${proposal.id}/edit`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {proposal.proposal_number}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {proposal.project_title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{proposal.customer_name || proposal.customer_contact}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{proposal.customer_address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(proposal.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={proposal.status}
                      onChange={(e) => handleStatusChange(proposal, e.target.value)}
                      disabled={updatingStatus === proposal.id}
                      className={`h-9 rounded-full border-0 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60 ${
                        statusStyles[proposal.status as keyof typeof statusStyles]
                      }`}
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
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                        title="Edit proposal"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(proposal.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]"
                        title="Download PDF"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => handleEmail(proposal)}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        title="Email proposal"
                      >
                        <Mail className="h-3.5 w-3.5" /> Email
                      </button>
                      <button
                        onClick={() => setDeleteTarget(proposal)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"
                        title="Delete proposal"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-alt)]/70 px-6 py-4 text-sm text-[var(--text-secondary)]">
          <div>
            Showing {filteredProposals.length} of {proposals.length}{' '}
            {proposals.length === 1 ? 'proposal' : 'proposals'}
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)]" disabled>
              Previous
            </button>
            <button className="h-9 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)]">
              Next
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Delete Proposal</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Are you sure want to delete this proposal?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full border border-rose-500 bg-rose-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
