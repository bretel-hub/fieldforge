'use client'

import { useEffect } from 'react'
import { X, Printer } from 'lucide-react'

interface LineItem {
  id: string
  category: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface ProposalPreviewProps {
  proposalNumber?: string
  customer: {
    name: string
    contact: string
    email: string
    address: string
  }
  projectDetails: {
    title: string
    description: string
    location: string
    timeline: string
  }
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  onClose: () => void
}

const CONTRACTOR_NAME = 'Apex Field Services'
const CONTRACTOR_TAGLINE = 'Professional Field Services & Solutions'
const CONTRACTOR_PHONE = '(555) 867-5309'
const CONTRACTOR_EMAIL = 'info@apexfieldservices.com'
const CONTRACTOR_ADDRESS = '1200 Industrial Blvd, Suite 400, Austin, TX 78745'

const categoryColors: Record<string, string> = {
  Labor: '#1d4ed8',
  Materials: '#15803d',
  Equipment: '#b45309',
  Permits: '#7c3aed',
  Other: '#374151',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

// Group line items by category for a cleaner layout
function groupByCategory(items: LineItem[]) {
  const groups: Record<string, LineItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

export function ProposalPreview({
  proposalNumber,
  customer,
  projectDetails,
  items,
  subtotal,
  tax,
  total,
  onClose,
}: ProposalPreviewProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePrint = () => window.print()

  const today = formatDate(new Date())
  const groupedItems = groupByCategory(items)
  const categoryList = Object.keys(groupedItems)

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body > *:not(#proposal-print-root) { display: none !important; }
          #proposal-print-root { position: static !important; }
          .no-print { display: none !important; }
          .print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
          }
        }
      `}</style>

      {/* Modal overlay */}
      <div
        id="proposal-print-root"
        className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Action bar */}
        <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-blue-500 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Paper document */}
        <div
          className="print-page bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden mt-12"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* ── CONTRACTOR HEADER ── */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }} className="px-10 py-8">
            <div className="flex items-center justify-between">
              {/* Logo placeholder */}
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-xl text-white font-bold text-2xl"
                  style={{
                    width: 64,
                    height: 64,
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontFamily: 'sans-serif',
                    letterSpacing: '-1px',
                  }}
                >
                  AFS
                </div>
                <div>
                  <div className="text-white font-bold text-2xl" style={{ fontFamily: 'sans-serif', letterSpacing: '-0.5px' }}>
                    {CONTRACTOR_NAME}
                  </div>
                  <div className="text-blue-200 text-sm mt-0.5" style={{ fontFamily: 'sans-serif' }}>
                    {CONTRACTOR_TAGLINE}
                  </div>
                </div>
              </div>

              {/* Contractor contact */}
              <div className="text-right text-sm text-blue-100" style={{ fontFamily: 'sans-serif' }}>
                <div>{CONTRACTOR_PHONE}</div>
                <div>{CONTRACTOR_EMAIL}</div>
                <div className="mt-1 text-xs text-blue-200">{CONTRACTOR_ADDRESS}</div>
              </div>
            </div>
          </div>

          {/* ── PROPOSAL TITLE BAR ── */}
          <div className="flex items-center justify-between px-10 py-4 border-b-2" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontFamily: 'sans-serif' }}>
                Project Proposal
              </div>
              <div className="text-xl font-bold text-gray-900 mt-0.5" style={{ fontFamily: 'sans-serif' }}>
                {projectDetails.title || 'Untitled Project'}
              </div>
            </div>
            <div className="text-right" style={{ fontFamily: 'sans-serif' }}>
              {proposalNumber && (
                <div className="text-sm font-semibold text-blue-700">{proposalNumber}</div>
              )}
              <div className="text-sm text-gray-500">Date: {today}</div>
              {projectDetails.timeline && (
                <div className="text-sm text-gray-500">Timeline: {projectDetails.timeline}</div>
              )}
            </div>
          </div>

          <div className="px-10 py-8 space-y-8">
            {/* ── CUSTOMER INFORMATION ── */}
            <div className="flex gap-8">
              <div className="flex-1">
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                  style={{ fontFamily: 'sans-serif', color: '#1e3a5f', borderColor: '#bfdbfe' }}
                >
                  Prepared For
                </div>
                <div className="space-y-1 text-sm text-gray-800">
                  {customer.name && (
                    <div className="font-semibold text-base text-gray-900" style={{ fontFamily: 'sans-serif' }}>
                      {customer.name}
                    </div>
                  )}
                  {customer.contact && (
                    <div style={{ fontFamily: 'sans-serif' }}>Attn: {customer.contact}</div>
                  )}
                  {customer.email && (
                    <div className="text-gray-500" style={{ fontFamily: 'sans-serif' }}>{customer.email}</div>
                  )}
                  {customer.address && (
                    <div className="text-gray-600 mt-1" style={{ fontFamily: 'sans-serif', whiteSpace: 'pre-wrap' }}>
                      {customer.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Project summary box */}
              <div
                className="flex-1 rounded-lg px-5 py-4"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ fontFamily: 'sans-serif', color: '#1e3a5f' }}
                >
                  Project Details
                </div>
                {projectDetails.location && (
                  <div className="flex gap-2 text-sm mb-1" style={{ fontFamily: 'sans-serif' }}>
                    <span className="text-gray-500 w-20 shrink-0">Location:</span>
                    <span className="text-gray-800">{projectDetails.location}</span>
                  </div>
                )}
                {projectDetails.timeline && (
                  <div className="flex gap-2 text-sm mb-1" style={{ fontFamily: 'sans-serif' }}>
                    <span className="text-gray-500 w-20 shrink-0">Timeline:</span>
                    <span className="text-gray-800">{projectDetails.timeline}</span>
                  </div>
                )}
                <div className="flex gap-2 text-sm" style={{ fontFamily: 'sans-serif' }}>
                  <span className="text-gray-500 w-20 shrink-0">Prepared:</span>
                  <span className="text-gray-800">{today}</span>
                </div>
              </div>
            </div>

            {/* ── PROJECT DESCRIPTION ── */}
            {projectDetails.description && (
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                  style={{ fontFamily: 'sans-serif', color: '#1e3a5f', borderColor: '#bfdbfe' }}
                >
                  Scope of Work
                </div>
                <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>
                  {projectDetails.description}
                </p>
              </div>
            )}

            {/* ── LINE ITEMS ── */}
            {items.length > 0 && (
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                  style={{ fontFamily: 'sans-serif', color: '#1e3a5f', borderColor: '#bfdbfe' }}
                >
                  Itemized Pricing
                </div>

                <table className="w-full text-sm border-collapse" style={{ fontFamily: 'sans-serif' }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: 'white' }}>
                      <th className="text-left px-3 py-2 font-semibold rounded-tl-md" style={{ width: '44%' }}>Description</th>
                      <th className="text-center px-3 py-2 font-semibold" style={{ width: '14%' }}>Category</th>
                      <th className="text-center px-3 py-2 font-semibold" style={{ width: '10%' }}>Qty</th>
                      <th className="text-right px-3 py-2 font-semibold" style={{ width: '16%' }}>Unit Price</th>
                      <th className="text-right px-3 py-2 font-semibold rounded-tr-md" style={{ width: '16%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryList.map((category) =>
                      groupedItems[category].map((item, idx) => {
                        const isFirst = idx === 0
                        const isLastInGroup = idx === groupedItems[category].length - 1
                        const isLastRow =
                          category === categoryList[categoryList.length - 1] && isLastInGroup
                        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                        return (
                          <tr key={item.id} style={{ background: rowBg }}>
                            <td
                              className="px-3 py-2 text-gray-800"
                              style={{ borderBottom: isLastRow ? 'none' : '1px solid #e5e7eb' }}
                            >
                              {isFirst && (
                                <span
                                  className="inline-block text-xs font-bold uppercase mr-2 px-1.5 py-0.5 rounded"
                                  style={{
                                    background: categoryColors[category] ?? '#374151',
                                    color: 'white',
                                    fontSize: '9px',
                                    letterSpacing: '0.05em',
                                  }}
                                >
                                  {category}
                                </span>
                              )}
                              {item.description || <em className="text-gray-400">No description</em>}
                            </td>
                            <td
                              className="px-3 py-2 text-center text-gray-500"
                              style={{ borderBottom: isLastRow ? 'none' : '1px solid #e5e7eb' }}
                            >
                              {isFirst ? '—' : ''}
                            </td>
                            <td
                              className="px-3 py-2 text-center text-gray-700"
                              style={{ borderBottom: isLastRow ? 'none' : '1px solid #e5e7eb' }}
                            >
                              {item.quantity}
                            </td>
                            <td
                              className="px-3 py-2 text-right text-gray-700"
                              style={{ borderBottom: isLastRow ? 'none' : '1px solid #e5e7eb' }}
                            >
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td
                              className="px-3 py-2 text-right font-medium text-gray-900"
                              style={{ borderBottom: isLastRow ? 'none' : '1px solid #e5e7eb' }}
                            >
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── PRICING SUMMARY ── */}
            <div className="flex justify-end">
              <div className="w-64">
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                  style={{ fontFamily: 'sans-serif', color: '#1e3a5f', borderColor: '#bfdbfe' }}
                >
                  Summary
                </div>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'sans-serif' }}>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8.75%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-base pt-2 mt-1"
                    style={{
                      borderTop: '2px solid #1e3a5f',
                      color: '#1e3a5f',
                    }}
                  >
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TERMS & SIGNATURE ── */}
            <div
              className="rounded-lg px-6 py-5 text-xs text-gray-500 leading-relaxed"
              style={{ fontFamily: 'sans-serif', background: '#f9fafb', border: '1px solid #e5e7eb' }}
            >
              <div className="font-semibold text-gray-700 mb-1 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                Terms &amp; Conditions
              </div>
              This proposal is valid for 30 days from the date of issue. A 50% deposit is required to begin work.
              Final payment is due upon project completion. All work is subject to our standard service agreement.
              Prices are subject to change if project scope changes. {CONTRACTOR_NAME} is fully licensed and insured.
            </div>

            {/* ── ACCEPTANCE ── */}
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4 pb-1 border-b"
                style={{ fontFamily: 'sans-serif', color: '#1e3a5f', borderColor: '#bfdbfe' }}
              >
                Acceptance
              </div>
              <div className="grid grid-cols-2 gap-10 text-xs text-gray-600" style={{ fontFamily: 'sans-serif' }}>
                <div>
                  <div className="border-b border-gray-400 mb-1 mt-6" />
                  <div>Customer Signature</div>
                  <div className="mt-3 border-b border-gray-400 mb-1" />
                  <div>Date</div>
                </div>
                <div>
                  <div className="border-b border-gray-400 mb-1 mt-6" />
                  <div>Authorized Representative — {CONTRACTOR_NAME}</div>
                  <div className="mt-3 border-b border-gray-400 mb-1" />
                  <div>Date</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            className="px-10 py-4 text-center text-xs text-gray-400 border-t"
            style={{ fontFamily: 'sans-serif', borderColor: '#e5e7eb' }}
          >
            {CONTRACTOR_NAME} &bull; {CONTRACTOR_PHONE} &bull; {CONTRACTOR_EMAIL}
            {proposalNumber && <> &bull; {proposalNumber}</>}
          </div>
        </div>
      </div>
    </>
  )
}
