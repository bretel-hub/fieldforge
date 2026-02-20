import { DashboardLayout } from '@/components/DashboardLayout'
import { StatsGrid } from '@/components/StatsGrid'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveProposals } from '@/components/ActiveProposals'
import { ActiveJobs } from '@/components/ActiveJobs'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <section className="grid gap-6 rounded-[36px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)] lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">Today</p>
            <h1 className="mt-2 text-4xl font-[Manrope] text-[var(--text)]">Field operations overview</h1>
            <p className="text-[var(--text-muted)]">Keep proposals, crews, and approvals flowing with one clear command view.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Next dispatch</p>
              <p className="mt-3 text-3xl font-[Manrope] text-[var(--text)]">14m 22s</p>
              <p className="text-sm text-[var(--text-muted)]">Kitchen Electrical · Zone 4</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Crew focus</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">3 active routes</p>
              <p className="text-sm text-[var(--text-muted)]">Satellite uplink stable</p>
            </div>
          </div>
          <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Voice brief</p>
            <p className="mt-3 text-sm text-[var(--text)]">“Breaker panel reset complete. Need conduit proof before 16:00.”</p>
            <div className="mt-4 h-20 rounded-2xl bg-gradient-to-r from-[#0c6cf2]/20 to-[#14b8a6]/20" />
          </div>
        </div>
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Action queue</p>
          <ul className="mt-4 space-y-4 text-sm text-[var(--text)]">
            {[
              'Approve ABC Manufacturing revisions',
              'Collect photo proof for Riverside phase 2',
              'Confirm Metro Health board call'
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0c6cf2]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/proposals/create" className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0c6cf2] px-6 text-sm font-semibold text-white">
            Create proposal
          </Link>
        </div>
      </section>

      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActiveProposals />
        <ActiveJobs />
      </div>

      <RecentActivity />
    </DashboardLayout>
  )
}
