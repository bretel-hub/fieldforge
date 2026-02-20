import Link from 'next/link'
import { DashboardLayout } from '@/components/DashboardLayout'
import { StatsGrid } from '@/components/StatsGrid'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveProposals } from '@/components/ActiveProposals'
import { ActiveJobs } from '@/components/ActiveJobs'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <section className="grid gap-6 rounded-[36px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)] xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">Command deck</p>
            <h1 className="mt-2 text-4xl font-[Manrope] text-[var(--text)]">Field operations overview</h1>
            <p className="text-[var(--text-muted)]">
              Voice briefs, crew position, and mission queue exactly where you expect them—now with a brighter skin.
            </p>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Voice brief</p>
                <p className="mt-2 text-sm text-[var(--text)]">“Breaker panel reset complete. Need conduit proof before 16:00.”</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Next dispatch</p>
                <p className="text-3xl font-[Manrope] text-[var(--text)]">14m 22s</p>
                <p className="text-xs text-[var(--text-muted)]">Kitchen Electrical · Zone 4</p>
              </div>
            </div>
            <div className="mt-4 h-24 rounded-2xl bg-gradient-to-r from-[#0c6cf2]/15 to-[#14b8a6]/15" />
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1">
                Grid sync 99.8%
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1">
                Voice uplink stable
              </span>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Crew map</p>
            <div className="mt-4 h-48 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#eef2ff] to-[#f9fafb] relative overflow-hidden">
              <span className="absolute left-10 top-8 rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs text-[var(--text)] shadow">
                Sarah · ETA 6m
              </span>
              <span className="absolute bottom-8 right-10 rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs text-[var(--text)] shadow">
                Mike · Photos 24
              </span>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">Satellite uplink stable · 3 crews in flight</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Mission queue</p>
            <ul className="mt-4 space-y-4 text-sm text-[var(--text)]">
              {[
                'Approve ABC Manufacturing proposal updates',
                'Collect photo proof for Riverside phase 2',
                'Confirm voice call with Metro Health board'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0c6cf2]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/proposals/create"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[#0c6cf2] bg-[#0c6cf2] text-sm font-semibold text-white"
            >
              Broadcast next order
            </Link>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">System vitals</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Voice recognition latency</dt>
                <dd className="font-semibold text-[var(--text)]">42 ms</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Photo ingestion</dt>
                <dd className="font-semibold text-[#14b8a6]">+18 new</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">AI action queue</dt>
                <dd className="font-semibold text-[#b76a00]">4 pending</dd>
              </div>
            </dl>
          </div>
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
