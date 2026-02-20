import { DashboardLayout } from '@/components/DashboardLayout'
import { StatsGrid } from '@/components/StatsGrid'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveProposals } from '@/components/ActiveProposals'
import { ActiveJobs } from '@/components/ActiveJobs'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0c101d] via-[#121a2b] to-[#07090f] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(243,74,255,0.2),_transparent_55%)] opacity-70" />
            <div className="relative flex flex-col gap-8">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-white/50">Voice-to-field relay</p>
                  <h1 className="mt-2 text-4xl font-[Chakra Petch] text-white">FieldForge Command Deck</h1>
                  <p className="text-white/60">Briefing crews with AI-backed insights in real time.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Next dispatch</p>
                  <p className="text-3xl font-semibold text-white">14m 22s</p>
                  <p className="text-xs text-white/50">Kitchen Electrical — Zone 4</p>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-[#0a101d] p-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Voice waveform</p>
                  <div className="mt-4 h-24 w-full rounded-2xl bg-[linear-gradient(90deg,rgba(81,244,255,0.3)_0%,rgba(243,74,255,0.6)_50%,rgba(108,255,186,0.4)_100%)] opacity-70 blur-[1px]" />
                  <p className="mt-4 text-sm text-white/80">&quot;Breaker panel reset complete. Need conduit proof before 16:00.&quot;</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/60">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                      <span className="h-2 w-2 rounded-full bg-[#6cffba] animate-pulse" />
                      Listening
                    </span>
                    <span>Grid sync 99.8%</span>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-[#0e1425] p-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Crew map</p>
                  <div className="mt-4 h-40 w-full rounded-2xl bg-[radial-gradient(circle_at_center,_rgba(81,244,255,0.3),_transparent_60%)]">
                    <div className="relative h-full w-full">
                      <span className="absolute left-10 top-6 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white shadow-lg">
                        Sarah · ETA 6m
                      </span>
                      <span className="absolute bottom-6 right-8 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white shadow-lg">
                        Mike · Photos 24
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/70">Satellite uplink stable · 3 crews in flight</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#10182b] to-[#080b13] p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Mission queue</p>
              <ul className="mt-4 space-y-4 text-sm text-white/80">
                {[
                  'Approve ABC Manufacturing proposal updates',
                  'Collect photo proof for Riverside phase 2',
                  'Confirm voice call with Metro Health board'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#51f4ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
                Broadcast next order
              </button>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#070b12] p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">System vitals</p>
              <dl className="mt-4 space-y-3 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <dt>Voice recognition latency</dt>
                  <dd className="text-white">42 ms</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Photo ingestion</dt>
                  <dd className="text-[#6cffba]">+18 new</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>AI action queue</dt>
                  <dd className="text-[#f5b755]">4 pending</dd>
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
      </div>
    </DashboardLayout>
  )
}
