import { DashboardLayout } from '@/components/DashboardLayout'
import { StatsGrid } from '@/components/StatsGrid'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveProposals } from '@/components/ActiveProposals'
import { ActiveJobs } from '@/components/ActiveJobs'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 px-6 py-5 shadow-[var(--shadow-soft)]">
          <h1 className="text-3xl font-['Sora'] text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Your sales and field operations overview</p>
        </div>

        <StatsGrid />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActiveProposals />
          <ActiveJobs />
        </div>

        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}
