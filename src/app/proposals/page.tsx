import Link from 'next/link'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalsTable } from '@/components/ProposalsTable'

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 px-6 py-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-['Sora'] text-[var(--text-primary)]">Build Proposal</h1>
            <p className="text-sm text-[var(--text-secondary)]">Create and manage sales proposals</p>
          </div>
          <Link
            href="/proposals/create"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            + New Proposal
          </Link>
        </div>

        <ProposalsTable />
      </div>
    </DashboardLayout>
  )
}
