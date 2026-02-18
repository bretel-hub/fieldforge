'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Pencil,
  Users
} from 'lucide-react'
import { useCustomersData, CustomerRecord } from '@/hooks/useCustomersData'
import { toast } from '@/hooks/use-toast'

interface CustomerFormState {
  name: string
  email?: string
  phone?: string
  address: string
}

const statusStyles: Record<string, string> = {
  synced: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}

const defaultFormState: CustomerFormState = {
  name: '',
  email: '',
  phone: '',
  address: ''
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function CustomerFormModal({
  open,
  onClose,
  onSubmit,
  initial
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: CustomerFormState) => Promise<void>
  initial?: CustomerRecord | null
}) {
  const [formState, setFormState] = useState<CustomerFormState>(initial ?? defaultFormState)
  const [submitting, setSubmitting] = useState(false)

  // Reset form when initial changes or modal opens/closes
  useEffect(() => {
    if (initial) {
      setFormState({
        name: initial.name,
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        address: initial.address
      })
    } else {
      setFormState({ ...defaultFormState })
    }
  }, [initial, open])

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formState)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {initial ? 'Edit customer' : 'Add customer'}
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business / Customer name</label>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Riverside Restaurant Group"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="ops@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Service area</label>
            <textarea
              required
              rows={2}
              value={formState.address}
              onChange={(e) => setFormState((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="123 River St, Cityville, ST"
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CustomersTable() {
  const {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    removeCustomer,
    refresh
  } = useCustomersData()

  const [search, setSearch] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null)

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers
    const term = search.toLowerCase()
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.address.toLowerCase().includes(term)
    )
  }, [customers, search])

  const totalCustomers = customers.length
  const totalJobs = customers.reduce((sum, c) => sum + c.jobCount, 0)
  const pendingSync = customers.filter((c) => c.syncStatus !== 'synced').length

  const openCreateModal = () => {
    setEditingCustomer(null)
    setModalOpen(true)
  }

  const openEditModal = (customer: CustomerRecord) => {
    setEditingCustomer(customer)
    setModalOpen(true)
  }

  const handleSubmit = async (values: CustomerFormState) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values)
        toast({ title: 'Customer updated', description: `${values.name} saved locally` })
      } else {
        await addCustomer(values)
        toast({ title: 'Customer created', description: `${values.name} ready for syncing` })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Something went wrong', description: 'Unable to save customer', variant: 'destructive' })
    }
  }

  const handleDelete = async (customer: CustomerRecord) => {
    const confirmed = window.confirm(`Remove ${customer.name}? This only affects local data for now.`)
    if (!confirmed) return

    try {
      await removeCustomer(customer.id)
      toast({ title: 'Customer removed', description: `${customer.name} deleted from offline cache` })
    } catch (err) {
      console.error(err)
      toast({ title: 'Delete failed', description: 'Unable to delete customer', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Active customers</p>
          <p className="text-2xl font-semibold text-gray-900">{totalCustomers}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Jobs linked</p>
          <p className="text-2xl font-semibold text-gray-900">{totalJobs}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Pending sync</p>
          <p className="text-2xl font-semibold text-gray-900">{pendingSync}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Directory</h3>
            <p className="text-sm text-gray-500">Offline-ready records powering proposals & jobs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers…"
                className="pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300"
              />
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add customer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      Loading customers…
                    </div>
                  </td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10">
                    <div className="flex flex-col items-center text-sm text-red-600 gap-3">
                      <AlertTriangle className="h-5 w-5" />
                      {error}
                      <button
                        onClick={refresh}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No customers match “{search}”.
                  </td>
                </tr>
              )}

              {!loading && !error && filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-600">
                      {customer.email && (
                        <div className="flex items-center"><Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center"><Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />{customer.phone}</div>
                      )}
                      <div className="flex items-center text-gray-500 text-xs">
                        <MapPin className="h-3.5 w-3.5 mr-1" />{customer.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.jobCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[customer.syncStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {customer.syncStatus === 'synced' ? 'Synced' : 'Pending sync'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.lastModified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="text-blue-600 hover:text-blue-500"
                        title="Edit customer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-500"
                        title="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerFormModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editingCustomer}
      />
    </div>
  )
}
