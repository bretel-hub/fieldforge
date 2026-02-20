import { DashboardLayout } from '@/components/DashboardLayout'
import { StatsGrid } from '@/components/StatsGrid'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveProposals } from '@/components/ActiveProposals'
import { ActiveJobs } from '@/components/ActiveJobs'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your sales and field operations overview
          </p>
        </div>
        
        <StatsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveProposals />
          <ActiveJobs />
        </div>
        
        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}