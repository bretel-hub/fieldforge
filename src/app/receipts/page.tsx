'use client'

import { FormEvent, useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  Camera,
  Loader2,
  Mail,
  UploadCloud,
  X,
  Tag,
  ClipboardCheck
} from 'lucide-react'
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
    fetchReceipts()
  }, [])

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

  const handleAssign = async (receipt: ReceiptRecord, nextStatus: 'assigned' | 'archived', extras?: Record<string, unknown>) => {
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
    <div className="space-y-8">
      <header className="rounded-[28px] border border-[var(--border)] bg-white px-6 py-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Receipts</p>
            <h1 className="text-3xl font-[Manrope] text-[var(--text)]">Capture receipts</h1>
            <p className="text-[var(--text-muted)]">Snap a photo or forward your email receipts to keep every job on budget.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#0c6cf2] px-5 text-sm font-semibold text-[#0c6cf2]"
              onClick={() => setShowCapture(true)}
            >
              <Camera className="h-4 w-4" /> Scan receipt
            </button>
            <Link
              href="mailto:receipts@fieldforge.app"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)]"
            >
              <Mail className="h-4 w-4" /> Email receipts
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-6 py-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id)
                fetchReceipts(tab.id)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === tab.id
                  ? 'bg-[#0c6cf2] text-white'
                  : 'bg-[var(--surface-alt)] text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-[#b42318]">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center px-6 py-10 text-[var(--text-muted)]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading receipts…
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
            Nothing in this view yet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filteredReceipts.map((receipt) => {
              const source = sourceMeta[receipt.source] || sourceMeta.scan
              return (
                <li
                  key={receipt.id}
                  className="flex flex-col gap-2 px-6 py-4 hover:bg-[var(--surface-alt)]/60 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => setSelected(receipt)}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-alt)] text-[#0c6cf2]">
                        <source.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{receipt.vendor_name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Captured via {source.label}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">
                      {receipt.job_reference ? `Job: ${receipt.job_reference}` : 'Unassigned'}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 text-sm text-[var(--text)] sm:items-end">
                    <span className="font-semibold">{currencyFormat(receipt.total, receipt.currency ?? 'USD')}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        receipt.status === 'assigned'
                          ? 'bg-[#eefbf9] text-[#0f766e]'
                          : receipt.status === 'archived'
                            ? 'bg-[var(--surface-alt)] text-[var(--text-muted)]'
                            : 'bg-[#e3f3ff] text-[#0c6cf2]'
                      }`}
                    >
                      {receipt.status}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Receipt</p>
                <h2 className="text-2xl font-[Manrope] text-[var(--text)]">{selected.vendor_name}</h2>
              </div>
              <button className="rounded-full border border-[var(--border)] p-2" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Total</dt>
                <dd className="font-semibold">{currencyFormat(selected.total, selected.currency ?? 'USD')}</dd>
              </div>
              {selected.category && (
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--text-muted)]">Category</dt>
                  <dd>{selected.category}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Status</dt>
                <dd className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  <Tag className="h-3 w-3" /> {selected.status}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Job reference</dt>
                <dd>{selected.job_reference || 'None'}</dd>
              </div>
              {selected.notes && (
                <div>
                  <dt className="text-[var(--text-muted)]">Notes</dt>
                  <dd>{selected.notes}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium text-[var(--text)]">Assign to job</label>
              <input
                type="text"
                value={selected.job_reference || ''}
                onChange={(e) => setSelected({ ...selected, job_reference: e.target.value })}
                className="w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="e.g. Job 204 - Riverside"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-[#0f766e] text-sm font-semibold text-[#0f766e]"
                  onClick={() =>
                    handleAssign(selected, 'assigned', {
                      jobReference: selected.job_reference || null
                    })
                  }
                >
                  <ClipboardCheck className="h-4 w-4" /> Mark assigned
                </button>
                <button
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)]"
                  onClick={() => handleAssign(selected, 'archived')}
                >
                  Archive
                </button>
                <button
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-[#c0392b] px-4 text-sm font-semibold text-[#c0392b]"
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
            className="w-full max-w-lg space-y-4 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-[Manrope] text-[var(--text)]">Capture receipt</h2>
              <button type="button" className="rounded-full border border-[var(--border)] p-2" onClick={() => setShowCapture(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Vendor
                <input
                  type="text"
                  required
                  value={form.vendorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, vendorName: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Total amount
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.total}
                  onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Category
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Materials, Fuel, Permits…"
                  className="mt-1 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Job reference
                <input
                  type="text"
                  value={form.jobReference}
                  onChange={(e) => setForm((prev) => ({ ...prev, jobReference: e.target.value }))}
                  placeholder="Job 204"
                  className="mt-1 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Payment method
                <input
                  type="text"
                  value={form.paymentMethod}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  placeholder="Company card, cash…"
                  className="mt-1 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text)]">
                Source
                <select
                  value={form.source}
                  onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm"
                >
                  <option value="scan">Scan</option>
                  <option value="email">Email</option>
                  <option value="upload">Upload</option>
                </select>
              </label>
            </div>

            <label className="text-sm font-medium text-[var(--text)]">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Any extra context"
                rows={3}
              />
            </label>

            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)]/60 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              Image/OCR pipeline coming next. For now attach via FieldForge inbox or add notes.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--text)]"
                onClick={() => setShowCapture(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#0c6cf2] bg-[#0c6cf2] px-6 text-sm font-semibold text-white disabled:opacity-50"
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
