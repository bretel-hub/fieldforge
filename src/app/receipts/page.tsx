'use client'

import { FormEvent, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Camera, Loader2, Mail, UploadCloud, X, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

interface ReceiptRecord {
  id: string
  vendor_name: string
  total: number
  subtotal?: number | null
  tax?: number | null
  currency?: string | null
  status: string
  source: string
  job_reference?: string | null
  job_id?: string | null
  proposal_id?: string | null
  category?: string | null
  payment_method?: string | null
  media_url?: string | null
  notes?: string | null
  created_at?: string
}

type IconRenderer = ComponentType<{ className?: string }>

const statusTabs = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All' }
]

const sourceMeta: Record<string, { label: string; icon: IconRenderer }> = {
  scan: { label: 'Scan', icon: Camera },
  email: { label: 'Email', icon: Mail },
  upload: { label: 'Upload', icon: UploadCloud }
}

const currencyFormat = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value)

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('inbox')
  const [selected, setSelected] = useState<ReceiptRecord | null>(null)
  const [showCapture, setShowCapture] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    vendorName: '',
    total: '',
    category: '',
    source: 'scan',
    jobReference: '',
    paymentMethod: '',
    notes: ''
  })

  const filteredReceipts = useMemo(() => {
    if (filter === 'all') return receipts
    return receipts.filter((receipt) => receipt.status === filter)
  }, [receipts, filter])

  useEffect(() => {
    fetchReceipts(filter)
  }, [filter])

  const fetchReceipts = async (status?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = status ? `?status=${status}` : ''
      const response = await fetch(`/api/receipts${params}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to load receipts')
      setReceipts(data.receipts)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReceipt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.vendorName || !form.total) return

    setSubmitting(true)
    try {
      const payload = {
        vendorName: form.vendorName,
        total: Number(form.total),
        category: form.category,
        source: form.source,
        jobReference: form.jobReference || null,
        paymentMethod: form.paymentMethod || null,
        notes: form.notes || null
      }

      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to save receipt')

      setReceipts((prev) => [data.receipt, ...prev])
      setShowCapture(false)
      setForm({ vendorName: '', total: '', category: '', source: 'scan', jobReference: '', paymentMethod: '', notes: '' })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to save receipt')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async (
    receipt: ReceiptRecord,
    nextStatus: 'assigned' | 'archived',
    extras?: Record<string, unknown>
  ) => {
    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, ...(extras || {}) })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to update receipt')
      setReceipts((prev) => prev.map((item) => (item.id === receipt.id ? data.receipt : item)))
      setSelected(data.receipt)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to update receipt')
    }
  }

  const handleDelete = async (receipt: ReceiptRecord) => {
    if (!confirm('Delete this receipt?')) return
    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to delete receipt')
      setReceipts((prev) => prev.filter((item) => item.id !== receipt.id))
      setSelected(null)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to delete receipt')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-600">
            Scan paper receipts or forward emailed receipts so every expense lands on the right job.
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Email receipts to <Link href="mailto:receipts@fieldforge.app" className="text-blue-600">receipts@fieldforge.app</Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
            onClick={() => setShowCapture(true)}
          >
            <Camera className="h-4 w-4" /> Scan receipt
          </button>
          <Link
            href="mailto:receipts@fieldforge.app"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
          >
            <Mail className="h-4 w-4" /> Email inbox
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id)
                  fetchReceipts(tab.id)
                }}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  filter === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center px-6 py-12 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading receipts…
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nothing here yet. Scan a receipt or forward an email.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => {
              const source = sourceMeta[receipt.source] || sourceMeta.scan
              return (
                <li
                  key={receipt.id}
                  className="flex flex-col gap-2 px-6 py-4 hover:bg-gray-50 cursor-pointer md:flex-row md:items-center md:justify-between"
                  onClick={() => setSelected(receipt)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <source.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{receipt.vendor_name}</p>
                      <p className="text-xs text-gray-500">Captured via {source.label}</p>
                      <p className="text-xs text-gray-500">
                        {receipt.job_reference ? `Job: ${receipt.job_reference}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 md:text-right">
                    <p className="font-semibold">{currencyFormat(receipt.total, receipt.currency ?? 'USD')}</p>
                    <p className="text-xs text-gray-500 capitalize">{receipt.status}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Receipt</p>
                <h2 className="text-lg font-semibold text-gray-900">{selected.vendor_name}</h2>
              </div>
              <button className="rounded-full border border-gray-200 p-2 text-gray-500" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold">{currencyFormat(selected.total, selected.currency ?? 'USD')}</span>
              </div>
              {selected.category && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Category</span>
                  <span>{selected.category}</span>
                </div>
              )}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Job reference</label>
                <input
                  type="text"
                  value={selected.job_reference || ''}
                  onChange={(e) => setSelected({ ...selected, job_reference: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="e.g. Job 204"
                />
              </div>
              {selected.notes && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500">Notes</label>
                  <p className="mt-1 text-gray-700">{selected.notes}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white"
                  onClick={() =>
                    handleAssign(selected, 'assigned', {
                      jobReference: selected.job_reference || null
                    })
                  }
                >
                  <ClipboardCheck className="h-4 w-4" /> Assign to job
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                  onClick={() => handleAssign(selected, 'archived')}
                >
                  Archive
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600"
                  onClick={() => handleDelete(selected)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCapture(false)}>
          <form
            onSubmit={handleCreateReceipt}
            className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Scan receipt</h2>
              <button type="button" className="rounded-full border border-gray-200 p-2 text-gray-500" onClick={() => setShowCapture(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Vendor
                <input
                  type="text"
                  required
                  value={form.vendorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, vendorName: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Total amount
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.total}
                  onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Category
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Materials, fuel, permits…"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Job reference
                <input
                  type="text"
                  value={form.jobReference}
                  onChange={(e) => setForm((prev) => ({ ...prev, jobReference: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Payment method
                <input
                  type="text"
                  value={form.paymentMethod}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Source
                <select
                  value={form.source}
                  onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="scan">Scan</option>
                  <option value="email">Email</option>
                  <option value="upload">Upload</option>
                </select>
              </label>
            </div>

            <label className="text-sm font-medium text-gray-700">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </label>

            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
              Image + OCR pipeline coming next. For now, attach via email or add context in notes.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                onClick={() => setShowCapture(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Save receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
