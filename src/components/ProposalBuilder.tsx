'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, DollarSign, Package, Building2 } from 'lucide-react'

interface LineItem {
  id: string
  category: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function ProposalBuilder() {
  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
  })
  
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    location: '',
    timeline: '',
  })

  const [items, setItems] = useState<LineItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

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

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
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
        // Redirect to proposals list
        router.push('/proposals')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
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
              Location
            </label>
            <input
              type="text"
              value={projectDetails.location}
              onChange={(e) => setProjectDetails({...projectDetails, location: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Main facility & warehouse"
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
            <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
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
                  <option value="Permits">Permits</option>
                  <option value="Other">Other</option>
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
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm rounded-md border-gray-300"
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
            onClick={() => alert('Preview modal coming soon!')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Preview
          </button>
          <button 
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Sending...' : 'Send Proposal'}
          </button>
        </div>
      </div>
    </div>
  )
}
