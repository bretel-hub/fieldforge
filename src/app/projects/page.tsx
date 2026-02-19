'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { offlineStorage, StoredJob } from '@/lib/offlineStorage'
import { ensureSeedData } from '@/lib/seedData'
import Link from 'next/link'
import { Briefcase, MapPin, DollarSign, Calendar, Eye, Loader2, AlertTriangle } from 'lucide-react'

interface Proposal {
  id: string
  proposal_number: string
  customer_name: string
  customer_contact: string
  customer_address: string
  project_title: string
  total: number
  status: string
  created_at: string
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [jobsMap, setJobsMap] = useState<Record<string, StoredJob>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [proposalRes] = await Promise.all([
          fetch('/api/proposals'),
          ensureSeedData(),
        ])
        const proposalData = await proposalRes.json()
        if (!proposalData.success) throw new Error(proposalData.error || 'Failed to load proposals')

        const approved: Proposal[] = (proposalData.proposals as Proposal[]).filter(
          (p) => p.status === 'approved'
        )
        setProposals(approved)

        const allJobs = await offlineStorage.getAllJobs()
        const map: Record<string, StoredJob> = {}
        for (const job of allJobs) {
          map[job.id] = job
        }
        setJobsMap(map)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getJob = (proposal: Proposal): StoredJob | undefined =>
    jobsMap[`JOB-${proposal.id}`]

  const jobStatusColors: Record<string, string> = {
    'not-started': 'bg-gray-100 text-gray-700',
    'scheduled':   'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    'complete':    'bg-green-100 text-green-700',
    'on-hold':     'bg-red-100 text-red-700',
  }

  const jobStatusLabel: Record<string, string> = {
    'not-started': 'Not Started',
    'scheduled':   'Scheduled',
    'in-progress': 'In Progress',
    'complete':    'Complete',
    'on-hold':     'On Hold',
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Approved proposals converted to active projects</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            Loading projects…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-6 py-4 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && proposals.length === 0 && (
          <div className="text-center py-24">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No approved projects yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Approve a proposal on the{' '}
              <Link href="/proposals" className="text-blue-600 hover:underline">Proposals</Link>{' '}
              page to create a project.
            </p>
          </div>
        )}

        {!loading && !error && proposals.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((proposal) => {
              const job = getJob(proposal)
              const jobStatus = job?.status ?? 'scheduled'
              const statusColor = jobStatusColors[jobStatus] ?? 'bg-gray-100 text-gray-700'
              const statusText = jobStatusLabel[jobStatus] ?? jobStatus

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        {proposal.proposal_number}
                      </p>
                      <h2 className="text-base font-semibold text-gray-900 mt-0.5 leading-snug">
                        {proposal.project_title}
                      </h2>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="px-5 py-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">
                        {proposal.customer_name || proposal.customer_contact}
                      </span>
                    </div>
                    {proposal.customer_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{proposal.customer_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-900">{formatCurrency(proposal.total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Approved {formatDate(proposal.created_at)}</span>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    {job ? (
                      <>
                        <span className="text-xs text-gray-500">{job.jobNumber ?? job.id}</span>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Job
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Job not found in local storage</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
