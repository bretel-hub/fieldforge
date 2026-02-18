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

export function useJobsData(): UseJobsDataResult {
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      await ensureSeedData()
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
