'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, DollarSign, Package, Building2, Trash2 } from 'lucide-react'
import { offlineStorage } from '@/lib/offlineStorage'
import { ProposalPreview } from '@/components/ProposalPreview'
import { ConfettiCelebration } from '@/components/ConfettiCelebration'

interface LineItem {
  id: string
  category: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface ProposalBuilderProps {
  proposalId?: string
  proposalNumber?: string
  initialStatus?: string
  initialData?: {
    customer: { name: string; contact: string; email: string; address: string }
    projectDetails: { title: string; description: string; location: string; timeline: string }
    items: LineItem[]
  }
}

export function ProposalBuilder({ proposalId, proposalNumber, initialStatus, initialData }: ProposalBuilderProps = {}) {
  const [customer, setCustomer] = useState(
    initialData?.customer ?? { name: '', contact: '', email: '', address: '' }
  )

  const [projectDetails, setProjectDetails] = useState(
    initialData?.projectDetails ?? { title: '', description: '', location: '', timeline: '' }
  )

  const initItems = initialData?.items ?? []
  const initSubtotal = initItems.reduce((sum, item) => sum + item.total, 0)
  const initTax = initSubtotal * 0.0875

  const [items, setItems] = useState<LineItem[]>(initItems)
  const [subtotal, setSubtotal] = useState(initSubtotal)
  const [tax, setTax] = useState(initTax)
  const [total, setTotal] = useState(initSubtotal + initTax)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus ?? 'draft')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const router = useRouter()
  const isEditing = Boolean(proposalId)

  const recalculate = (updatedItems: LineItem[]) => {
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const newTax = newSubtotal * 0.0875
    setSubtotal(newSubtotal)
    setTax(newTax)
    setTotal(newSubtotal + newTax)
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      category: 'Labor',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
  }

  const updateLineItem = (itemId: string, field: keyof LineItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    })
    setItems(updatedItems)
    recalculate(updatedItems)
  }

  const removeLineItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId)
    setItems(updatedItems)
    recalculate(updatedItems)
  }

  const handleSave = async (status: string = 'draft') => {
    setSaving(true)
    setError(null)

    try {
      const url = isEditing ? `/api/proposals/${proposalId}` : '/api/proposals'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer,
          projectDetails,
          items,
          subtotal,
          tax,
          total,
          status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (status === 'approved' && proposalId) {
          const jobId = `JOB-${proposalId}`
          await offlineStorage.saveJob({
            id: jobId,
            jobNumber: proposalNumber ? `JOB-${proposalNumber}` : jobId,
            title: projectDetails.title,
            status: 'scheduled',
            customerId: customer.name || customer.contact,
            customerName: customer.name || customer.contact,
            technicianId: 'unassigned',
            scheduledDate: new Date().toISOString().split('T')[0],
            value: total,
            location: { address: customer.address },
            description: projectDetails.description,
            syncStatus: 'pending',
          })
          setShowConfetti(true)
        } else {
          router.push('/proposals')
        }
      } else {
        setError(data.error || 'Failed to save proposal')
      }
    } catch (err) {
      setError('An error occurred while saving the proposal')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!proposalId) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        router.push('/proposals')
      }
    } catch (err) {
      console.error('Failed to delete proposal:', err)
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      {showConfetti && (
        <ConfettiCelebration onComplete={() => router.push('/jobs')} />
      )}
    <div className="space-y-8 w-full">
      {/* Customer Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={customer.contact}
              onChange={(e) => setCustomer({...customer, contact: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({...customer, email: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="john@abc.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={customer.address}
              onChange={(e) => setCustomer({...customer, address: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="123 Business St, City, ST 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="ABC Manufacturing"
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={projectDetails.title}
              onChange={(e) => setProjectDetails({...projectDetails, title: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Security System Upgrade"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={projectDetails.description}
              onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Complete security system overhaul including cameras, access control, and monitoring..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeline
            </label>
            <input
              type="text"
              value={projectDetails.timeline}
              onChange={(e) => setProjectDetails({...projectDetails, timeline: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="2-3 weeks"
            />
          </div>
        </div>
      </div>

      {/* Line Items - Full Width */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Items for Project</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                  className="text-sm rounded-md border-gray-300"
                >
                  <option value="Labor">Labor</option>
                  <option value="Materials">Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                  <option value="Permits">Permits</option>
                </select>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="text-red-600 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                className="w-full text-sm rounded-md border-gray-300 mb-2"
                placeholder="Item description..."
              />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full text-sm rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm rounded-md border-gray-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total</label>
                  <div className="text-sm font-medium py-2">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => addLineItem()}
            className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.75%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      {isEditing ? (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Change Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-gray-300 text-sm shadow-sm"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Proposal
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Preview
            </button>
            <button
              onClick={() => handleSave(selectedStatus)}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Preview
            </button>
            <button
              onClick={() => handleSave('pending')}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Sending...' : 'Send Proposal'}
            </button>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && (
        <ProposalPreview
          proposalNumber={proposalNumber}
          customer={customer}
          projectDetails={projectDetails}
          items={items}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
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
                onClick={() => setShowDeleteConfirm(false)}
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
    </>
  )
}
