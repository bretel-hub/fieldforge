'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Trash2, Upload, FileText, MapPin, DollarSign, Shield, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPhone } from '@/lib/utils'

interface Cost {
  id: string
  amount: string
  unit: string
  unitCustom: string
}

interface PartnerFormProps {
  partnerId?: string
  initialData?: {
    name: string
    companyName: string
    phone: string
    email: string
    website: string
    address: string
    city: string
    state: string
    zip: string
    costs: Cost[]
    insuranceStartDate: string
    insuranceEndDate: string
    insuranceDocumentUrl: string
    insuranceDocumentName: string
  }
}

const UNIT_OPTIONS = ['Hour', 'Day', 'Per Person', 'Sq Ft', 'Linear Foot', 'Other']

export function PartnerForm({ partnerId, initialData }: PartnerFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(partnerId)

  const [name, setName] = useState(initialData?.name ?? '')
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? '')
  const [phone, setPhone] = useState(formatPhone(initialData?.phone ?? ''))
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [website, setWebsite] = useState(initialData?.website ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [city, setCity] = useState(initialData?.city ?? '')
  const [state, setState] = useState(initialData?.state ?? '')
  const [zip, setZip] = useState(initialData?.zip ?? '')
  const [costs, setCosts] = useState<Cost[]>(initialData?.costs ?? [])
  const [insuranceStartDate, setInsuranceStartDate] = useState(initialData?.insuranceStartDate ?? '')
  const [insuranceEndDate, setInsuranceEndDate] = useState(initialData?.insuranceEndDate ?? '')
  const [insuranceDocumentUrl, setInsuranceDocumentUrl] = useState(initialData?.insuranceDocumentUrl ?? '')
  const [insuranceDocumentName, setInsuranceDocumentName] = useState(initialData?.insuranceDocumentName ?? '')
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const addCost = () => {
    setCosts((prev) => [
      ...prev,
      { id: `cost-${Date.now()}`, amount: '', unit: 'Hour', unitCustom: '' },
    ])
  }

  const updateCost = (id: string, field: keyof Cost, value: string) => {
    setCosts((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const removeCost = (id: string) => {
    setCosts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    setError(null)
    try {
      const filePath = `partners/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { error: uploadError } = await supabase.storage
        .from('partner-insurance')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('partner-insurance')
        .getPublicUrl(filePath)
      setInsuranceDocumentUrl(publicUrl)
      setInsuranceDocumentName(file.name)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload document. Make sure the storage bucket exists and is accessible.')
    } finally {
      setUploadingDoc(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const url = isEditing ? `/api/partners/${partnerId}` : '/api/partners'
      const method = isEditing ? 'PATCH' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName,
          phone,
          email,
          website,
          address,
          city,
          state,
          zip,
          costs: costs.map((c, i) => ({
            amount: parseFloat(c.amount) || 0,
            unit: c.unit,
            unitCustom: c.unit === 'Other' ? c.unitCustom : '',
            sortOrder: i,
          })),
          insuranceStartDate,
          insuranceEndDate,
          insuranceDocumentUrl,
          insuranceDocumentName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        router.push('/partners')
      } else {
        setError(data.error || 'Failed to save partner')
      }
    } catch {
      setError('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!partnerId) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/partners/${partnerId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        router.push('/partners')
      }
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Partner Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-5">
          <User className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Partner Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Company or business name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="555-000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-5">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Location</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="City"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Costs</h2>
          </div>
          <button
            onClick={addCost}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Cost
          </button>
        </div>

        {costs.length === 0 ? (
          <p className="text-sm text-gray-400">No costs added yet. Click &quot;Add Cost&quot; to add a rate.</p>
        ) : (
          <div className="space-y-3">
            {costs.map((cost) => (
              <div key={cost.id} className="flex items-center gap-3">
                <div className="relative w-36 flex-none">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost.amount}
                    onChange={(e) => updateCost(cost.id, 'amount', e.target.value)}
                    className="w-full pl-7 rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="w-44 flex-none">
                  <select
                    value={cost.unit}
                    onChange={(e) => updateCost(cost.id, 'unit', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                {cost.unit === 'Other' && (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cost.unitCustom}
                      onChange={(e) => updateCost(cost.id, 'unitCustom', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Describe unit..."
                    />
                  </div>
                )}
                <button
                  onClick={() => removeCost(cost.id)}
                  className="p-1 text-gray-400 hover:text-red-500 flex-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insurance Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-5">
          <Shield className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Insurance Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Start Date</label>
            <input
              type="date"
              value={insuranceStartDate}
              onChange={(e) => setInsuranceStartDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage End Date</label>
            <input
              type="date"
              value={insuranceEndDate}
              onChange={(e) => setInsuranceEndDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Document</label>
            {insuranceDocumentUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="h-5 w-5 text-blue-500 flex-none" />
                <a
                  href={insuranceDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex-1 truncate"
                >
                  {insuranceDocumentName || 'View Document'}
                </a>
                <button
                  onClick={() => {
                    setInsuranceDocumentUrl('')
                    setInsuranceDocumentName('')
                  }}
                  className="text-gray-400 hover:text-red-500 flex-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDoc}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingDoc ? 'Uploading...' : 'Upload Insurance Document'}
                </button>
                <p className="mt-1.5 text-xs text-gray-400">PDF, Word, or image files accepted</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pb-8">
        <div>
          {isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Partner
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/partners')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Partner'}
          </button>
        </div>
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
              <h2 className="text-base font-semibold text-gray-900">Delete Partner</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this partner? This action cannot be undone.
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
    </div>
  )
}
