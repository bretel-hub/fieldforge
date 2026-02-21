'use client'

import { useCallback, useEffect, useState } from 'react'
import { ensureSeedData } from '@/lib/seedData'
import { offlineStorage, StoredJob } from '@/lib/offlineStorage'

interface UseJobsDataResult {
  jobs: StoredJob[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

async function syncApprovedProposalsToJobs(): Promise<void> {
  try {
    const response = await fetch('/api/proposals')
    const data = await response.json()
    if (!data.success || !data.proposals) return

    const approvedProposals = data.proposals.filter((p: any) => p.status === 'approved')

    for (const proposal of approvedProposals) {
      const jobId = `JOB-${proposal.id}`
      const existingJob = await offlineStorage.getJob(jobId)

      // If job exists, check if customer data needs to be repaired from proposal
      if (existingJob) {
        const missingCustomerData =
          !existingJob.customerName ||
          !existingJob.customerEmail ||
          !existingJob.customerAddress ||
          !existingJob.customerContact
        if (missingCustomerData) {
          let customerName = proposal.customer_name || proposal.customer_contact || ''
          let customerContact = proposal.customer_contact || ''
          let customerEmail = proposal.customer_email || ''
          let customerAddress = proposal.customer_address || ''
          try {
            const fullRes = await fetch(`/api/proposals/${proposal.id}`)
            const fullData = await fullRes.json()
            if (fullData.success && fullData.proposal) {
              const fp = fullData.proposal
              customerName = fp.customer_name || fp.customer_contact || customerName
              customerContact = fp.customer_contact || customerContact
              customerEmail = fp.customer_email || customerEmail
              customerAddress = fp.customer_address || customerAddress
            }
          } catch {
            // non-fatal
          }
          await offlineStorage.saveJob({
            ...existingJob,
            customerName: existingJob.customerName || customerName,
            customerContact: existingJob.customerContact || customerContact,
            customerEmail: existingJob.customerEmail || customerEmail,
            customerAddress: existingJob.customerAddress || customerAddress,
          })
        }
        continue
      }

      let projectDescription = ''
      let projectLocation = proposal.customer_address || ''
      let projectTimeline = ''
      let customerContact = proposal.customer_contact || ''
      let customerEmail = proposal.customer_email || ''
      let customerAddress = proposal.customer_address || ''
      let lineItems: Array<{ id: string; category: string; description: string; quantity: number; unitPrice: number; total: number }> = []
      let subtotal: number | undefined
      let taxAmount: number | undefined
      try {
        const fullRes = await fetch(`/api/proposals/${proposal.id}`)
        const fullData = await fullRes.json()
        if (fullData.success && fullData.proposal) {
          const fp = fullData.proposal
          projectDescription = fp.project_description || ''
          projectLocation = fp.project_location || proposal.customer_address || ''
          projectTimeline = fp.project_timeline || ''
          customerContact = fp.customer_contact || customerContact
          customerEmail = fp.customer_email || customerEmail
          customerAddress = fp.customer_address || customerAddress
          subtotal = fp.subtotal
          taxAmount = fp.tax_amount
          lineItems = (fp.items ?? []).map((item: any) => ({
            id: item.id,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
          }))
        }
      } catch {
        // non-fatal
      }

      await offlineStorage.saveJob({
        id: jobId,
        jobNumber: `JOB-${proposal.proposal_number}`,
        title: proposal.project_title,
        status: 'scheduled',
        customerId: proposal.customer_name || proposal.customer_contact,
        customerName: proposal.customer_name || proposal.customer_contact,
        customerContact,
        customerEmail,
        customerAddress,
        technicianId: 'unassigned',
        scheduledDate: new Date().toISOString().split('T')[0],
        value: proposal.total,
        location: { address: projectLocation },
        description: projectDescription,
        projectTimeline: projectTimeline || undefined,
        projectLocation: projectLocation || undefined,
        lineItems: lineItems.length > 0 ? lineItems : undefined,
        subtotal,
        taxAmount,
        syncStatus: 'synced',
      })
    }
  } catch {
    // non-fatal — don't block job loading if proposal sync fails
  }
}

export function useJobsData(): UseJobsDataResult {
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      await ensureSeedData()
      await syncApprovedProposalsToJobs()
      const storedJobs = await offlineStorage.getAllJobs()
      const sortedJobs = storedJobs.sort((a, b) => {
        const aDate = new Date(a.scheduledDate).getTime()
        const bDate = new Date(b.scheduledDate).getTime()
        return bDate - aDate
      })
      setJobs(sortedJobs)
      setError(null)
    } catch (err) {
      console.error('Failed to load jobs from offline storage', err)
      setError(err instanceof Error ? err.message : 'Unable to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  return {
    jobs,
    loading,
    error,
    refresh: loadJobs
  }
}
