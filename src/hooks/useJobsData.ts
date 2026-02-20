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
      if (existingJob) continue

      let projectDescription = ''
      let projectLocation = proposal.customer_address || ''
      let projectTimeline = ''
      try {
        const fullRes = await fetch(`/api/proposals/${proposal.id}`)
        const fullData = await fullRes.json()
        if (fullData.success && fullData.proposal) {
          projectDescription = [
            fullData.proposal.project_description,
            fullData.proposal.project_timeline ? `Timeline: ${fullData.proposal.project_timeline}` : '',
          ].filter(Boolean).join('\n\n')
          projectLocation = fullData.proposal.project_location || proposal.customer_address || ''
          projectTimeline = fullData.proposal.project_timeline || ''
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
        technicianId: 'unassigned',
        scheduledDate: new Date().toISOString().split('T')[0],
        value: proposal.total,
        location: { address: projectLocation },
        description: projectDescription,
        notes: projectTimeline ? `Timeline: ${projectTimeline}` : undefined,
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
