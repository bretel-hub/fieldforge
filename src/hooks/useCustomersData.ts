'use client'

import { useCallback, useEffect, useState } from 'react'
import { ensureSeedData } from '@/lib/seedData'
import { offlineStorage, StoredCustomer } from '@/lib/offlineStorage'

export interface CustomerRecord extends StoredCustomer {
  jobCount: number
}

export interface CustomerInput {
  name: string
  email?: string
  phone?: string
  address: string
}

interface UseCustomersDataResult {
  customers: CustomerRecord[]
  loading: boolean
  error: string | null
  addCustomer: (input: CustomerInput) => Promise<void>
  updateCustomer: (id: string, input: CustomerInput) => Promise<void>
  removeCustomer: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const generateCustomerId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `cust-${crypto.randomUUID()}`
  }
  return `cust-${Math.random().toString(36).slice(2, 10)}`
}

const normalizeField = (value?: string) => value?.trim() || undefined

export function useCustomersData(): UseCustomersDataResult {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      await ensureSeedData()
      const [storedCustomers, jobs] = await Promise.all([
        offlineStorage.getAllCustomers(),
        offlineStorage.getAllJobs()
      ])

      const jobCountMap = jobs.reduce<Record<string, number>>((acc, job) => {
        if (!job.customerId) return acc
        acc[job.customerId] = (acc[job.customerId] || 0) + 1
        return acc
      }, {})

      const enriched = storedCustomers
        .map((customer) => ({
          ...customer,
          jobCount: jobCountMap[customer.id] || 0
        }))
        .sort((a, b) => b.lastModified - a.lastModified)

      setCustomers(enriched)
      setError(null)
    } catch (err) {
      console.error('Failed to load customers', err)
      setError(err instanceof Error ? err.message : 'Unable to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const addCustomer = useCallback(async (input: CustomerInput) => {
    const record = {
      id: generateCustomerId(),
      name: input.name.trim(),
      email: normalizeField(input.email),
      phone: normalizeField(input.phone),
      address: input.address.trim(),
      syncStatus: 'pending' as StoredCustomer['syncStatus']
    }

    await offlineStorage.saveCustomer(record)
    await loadCustomers()
  }, [loadCustomers])

  const updateCustomer = useCallback(async (id: string, input: CustomerInput) => {
    const current = customers.find((customer) => customer.id === id)
    const record = {
      id,
      name: input.name.trim(),
      email: normalizeField(input.email),
      phone: normalizeField(input.phone),
      address: input.address.trim(),
      syncStatus: current?.syncStatus ?? 'pending'
    }

    await offlineStorage.saveCustomer(record)
    await loadCustomers()
  }, [customers, loadCustomers])

  const removeCustomer = useCallback(async (id: string) => {
    await offlineStorage.deleteCustomer(id)
    await loadCustomers()
  }, [loadCustomers])

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    removeCustomer,
    refresh: loadCustomers
  }
}
