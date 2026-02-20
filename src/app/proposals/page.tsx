import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalsTable } from '@/components/ProposalsTable'
import { ArrowUpRight, Clock, PenSquare } from 'lucide-react'
import Link from 'next/link'

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0f1729] via-[#11182f] to-[#070910] p-8">
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(81,244,255,0.6), transparent 45%)' }} />
          <div className="relative flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">Sales console</p>
              <h1 className="mt-3 text-4xl font-[Chakra Petch] text-white">Proposal intelligence</h1>
              <p className="mt-2 text-white/70">
                Track every pitch, nudge clients before deadlines, and push high‑stakes jobs straight to the field team.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                  <Clock className="h-3.5 w-3.5 text-[#51f4ff]" /> Median turnaround · 36h
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                  <PenSquare className="h-3.5 w-3.5 text-[#6cffba]" /> 8 drafts require edits
                </span>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/15 bg-white/5 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Current cycle</p>
              <p className="mt-3 text-4xl font-semibold">$186,300</p>
              <p className="text-sm text-white/70">Value awaiting signature</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="text-xs text-[#6cffba]">+18% vs last week</div>
                <span className="h-2 w-2 rounded-full bg-[#6cffba] animate-pulse" />
              </div>
              <Link
                href="/proposals/create"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f1729] shadow-lg"
              >
                Launch proposal <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[28px] border border-white/10 bg-[#080c15]/70 p-6 text-white sm:grid-cols-3">
          {[{ label: 'Awaiting signature', value: '09', meta: 'SLA < 12h' }, { label: 'Viewed, no reply', value: '07', meta: 'Ping scheduled' }, { label: 'Ready to send', value: '05', meta: 'Need review' }].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">{card.label}</p>
              <p className="mt-2 text-3xl font-[Chakra Petch]">{card.value}</p>
              <p className="text-sm text-white/60">{card.meta}</p>
            </div>
          ))}
        </section>

        <ProposalsTable />
      </div>
    </DashboardLayout>
  )
}
