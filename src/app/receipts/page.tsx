'use client'

import { FormEvent, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Camera, Loader2, Mail, UploadCloud, X, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/DashboardLayout'
import { offlineStorage, StoredJob } from '@/lib/offlineStorage'

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

const RECEIPT_CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Permits', 'Other']

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
  const [projects, setProjects] = useState<StoredJob[]>([])
  const [form, setForm] = useState({
    vendorName: '',
    total: '',
    category: '',
    projectId: '',
    notes: ''
  })

  const filteredReceipts = useMemo(() => {
    if (filter === 'all') return receipts
    return receipts.filter((receipt) => receipt.status === filter)
  }, [receipts, filter])

  useEffect(() => {
    fetchReceipts(filter)
  }, [filter])

  useEffect(() => {
    offlineStorage.getAllJobs().then((jobs) => {
      const active = jobs.filter((j) => j.status !== 'complete')
      setProjects(active)
    }).catch(console.error)
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
      const selectedProject = projects.find((p) => p.id === form.projectId)
      const payload = {
        vendorName: form.vendorName,
        total: Number(form.total),
        category: form.category || null,
        source: 'scan',
        jobReference: selectedProject ? (selectedProject.jobNumber || selectedProject.title) : null,
        jobId: form.projectId || null,
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
      setForm({ vendorName: '', total: '', category: '', projectId: '', notes: '' })
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
    <DashboardLayout>
    <div className="space-y-8">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 px-6 py-5 shadow-[var(--shadow-soft)]">
        <h1 className="text-3xl font-['Sora'] text-[var(--text-primary)]">Receipts</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Scan paper receipts or forward emailed receipts so every expense lands on the right job.
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Email receipts to{' '}
          <Link href="mailto:receipts@fieldforge.app" className="text-[var(--accent)]">
            receipts@fieldforge.app
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
            onClick={() => setShowCapture(true)}
          >
            <Camera className="h-4 w-4" /> Scan receipt
          </button>
          <Link
            href="mailto:receipts@fieldforge.app"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
          >
            <Mail className="h-4 w-4" /> Email inbox
          </Link>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/95 shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id)
                  fetchReceipts(tab.id)
                }}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  filter === tab.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="px-6 py-4 text-sm text-rose-600">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center px-6 py-12 text-[var(--text-secondary)]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading receipts…
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
            Nothing here yet. Scan a receipt or forward an email.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filteredReceipts.map((receipt) => {
              const source = sourceMeta[receipt.source] || sourceMeta.scan
              return (
                <li
                  key={receipt.id}
                  className="flex flex-col gap-2 px-6 py-4 hover:bg-[var(--surface-alt)] cursor-pointer md:flex-row md:items-center md:justify-between"
                  onClick={() => setSelected(receipt)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <source.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{receipt.vendor_name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Captured via {source.label}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {receipt.job_reference ? `Job: ${receipt.job_reference}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-primary)] md:text-right">
                    <p className="font-semibold">{currencyFormat(receipt.total, receipt.currency ?? 'USD')}</p>
                    <p className="text-xs text-[var(--text-secondary)] capitalize">{receipt.status}</p>
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
            className="flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-white shadow-[var(--shadow-soft)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex-none flex items-center justify-between border-b border-[var(--border)] px-6 py-4"
              style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Receipt</p>
                <h2 className="text-lg font-[Space Grotesk] text-[var(--text-primary)]">{selected.vendor_name}</h2>
              </div>
              <button className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)]" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto space-y-4 px-6 py-4 text-sm"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Total</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {currencyFormat(selected.total, selected.currency ?? 'USD')}
                </span>
              </div>
              {selected.category && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Category</span>
                  <span>{selected.category}</span>
                </div>
              )}
              <div>
                <label className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Job reference</label>
                <input
                  type="text"
                  value={selected.job_reference || ''}
                  onChange={(e) => setSelected({ ...selected, job_reference: e.target.value })}
                  className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
                  placeholder="e.g. Job 204"
                />
              </div>
              {selected.notes && (
                <div>
                  <label className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Notes</label>
                  <p className="mt-1 text-[var(--text-primary)]">{selected.notes}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() =>
                    handleAssign(selected, 'assigned', {
                      jobReference: selected.job_reference || null
                    })
                  }
                >
                  <ClipboardCheck className="h-4 w-4" /> Assign to job
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
                  onClick={() => handleAssign(selected, 'archived')}
                >
                  Archive
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40" onClick={() => setShowCapture(false)}>
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
          <form
            onSubmit={handleCreateReceipt}
            className="w-full max-w-lg space-y-4 rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-[Space Grotesk] text-[var(--text-primary)]">Scan receipt</h2>
              <button type="button" className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)]" onClick={() => setShowCapture(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text-primary)] md:col-span-2">
                Project
                <select
                  value={form.projectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
                >
                  <option value="">— Select a project —</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.jobNumber ? `${project.jobNumber} – ` : ''}{project.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Vendor
                <input
                  type="text"
                  required
                  value={form.vendorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, vendorName: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Total amount
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.total}
                  onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-[var(--text-primary)] md:col-span-2">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
                >
                  <option value="">— Select a category —</option>
                  {RECEIPT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-sm font-medium text-[var(--text-primary)]">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
                rows={3}
              />
            </label>

            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)]/70 px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
              Image + OCR pipeline coming next. For now, attach via email or add context in notes.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
                onClick={() => setShowCapture(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Save receipt
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  )
}
