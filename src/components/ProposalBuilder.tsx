'use client'

import { useState } from 'react'
import { Plus, X, DollarSign, Package, Users, Building2 } from 'lucide-react'

interface LineItem {
  id: string
  category: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface ProposalTier {
  name: 'good' | 'better' | 'best'
  label: string
  items: LineItem[]
  subtotal: number
  tax: number
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

  const [tiers, setTiers] = useState<ProposalTier[]>([
    {
      name: 'good',
      label: 'Essential Package',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    {
      name: 'better',
      label: 'Professional Package',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    {
      name: 'best',
      label: 'Premium Package',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  ])

  const addLineItem = (tierIndex: number) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      category: 'Labor',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    
    const updatedTiers = [...tiers]
    updatedTiers[tierIndex].items.push(newItem)
    setTiers(updatedTiers)
  }

  const updateLineItem = (tierIndex: number, itemId: string, field: keyof LineItem, value: any) => {
    const updatedTiers = [...tiers]
    const item = updatedTiers[tierIndex].items.find(item => item.id === itemId)
    
    if (item) {
      (item as any)[field] = value
      if (field === 'quantity' || field === 'unitPrice') {
        item.total = item.quantity * item.unitPrice
      }
      
      // Recalculate tier totals
      const tier = updatedTiers[tierIndex]
      tier.subtotal = tier.items.reduce((sum, item) => sum + item.total, 0)
      tier.tax = tier.subtotal * 0.0875 // 8.75% tax
      tier.total = tier.subtotal + tier.tax
    }
    
    setTiers(updatedTiers)
  }

  const removeLineItem = (tierIndex: number, itemId: string) => {
    const updatedTiers = [...tiers]
    updatedTiers[tierIndex].items = updatedTiers[tierIndex].items.filter(item => item.id !== itemId)
    
    // Recalculate tier totals
    const tier = updatedTiers[tierIndex]
    tier.subtotal = tier.items.reduce((sum, item) => sum + item.total, 0)
    tier.tax = tier.subtotal * 0.0875
    tier.total = tier.subtotal + tier.tax
    
    setTiers(updatedTiers)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
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

      {/* Good-Better-Best Tiers */}
      <div className="space-y-6">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Proposal Options</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((tier, tierIndex) => (
            <div key={tier.name} className={`bg-white shadow rounded-lg overflow-hidden ${tier.name === 'better' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className={`px-6 py-4 ${tier.name === 'good' ? 'bg-gray-50' : tier.name === 'better' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{tier.label}</h3>
                  {tier.name === 'better' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {tier.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <select
                        value={item.category}
                        onChange={(e) => updateLineItem(tierIndex, item.id, 'category', e.target.value)}
                        className="text-sm rounded-md border-gray-300"
                      >
                        <option value="Labor">Labor</option>
                        <option value="Materials">Materials</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Permits">Permits</option>
                        <option value="Other">Other</option>
                      </select>
                      <button
                        onClick={() => removeLineItem(tierIndex, item.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateLineItem(tierIndex, item.id, 'description', e.target.value)}
                      className="w-full text-sm rounded-md border-gray-300 mb-2"
                      placeholder="Item description..."
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(tierIndex, item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full text-sm rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(tierIndex, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
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
                  onClick={() => addLineItem(tierIndex)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </button>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(tier.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.75%):</span>
                    <span>{formatCurrency(tier.tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(tier.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Save as Draft
        </button>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Preview
          </button>
          <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500">
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  )
}