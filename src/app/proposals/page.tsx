import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalsTable } from '@/components/ProposalsTable'
import { ArrowUpRight, Clock, PenSquare } from 'lucide-react'
import Link from 'next/link'

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-[36px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Sales console</p>
              <h1 className="text-4xl font-[Manrope] text-[var(--text)]">Proposal intelligence</h1>
              <p className="text-[var(--text-muted)]">Track every pitch, nudge clients before deadlines, and promote wins straight into operations.</p>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1">
                  <Clock className="h-3.5 w-3.5 text-[#0c6cf2]" /> Median turnaround · 36h
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1">
                  <PenSquare className="h-3.5 w-3.5 text-[#14b8a6]" /> 8 drafts require edits
                </span>
              </div>
            </div>
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">This cycle</p>
              <p className="mt-2 text-4xl font-[Manrope] text-[var(--text)]">$186,300</p>
              <p className="text-sm text-[var(--text-muted)]">Value awaiting signature</p>
              <Link
                href="/proposals/create"
                className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0c6cf2] px-5 text-sm font-semibold text-white"
              >
                Launch proposal <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <ProposalsTable />
      </div>
    </DashboardLayout>
  )
}
