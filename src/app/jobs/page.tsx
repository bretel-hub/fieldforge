import { DashboardLayout } from '@/components/DashboardLayout'
import { JobsTable } from '@/components/JobsTable'

export default function JobsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground">
              Track field work progress with photo documentation
            </p>
          </div>
        </div>
        
        <JobsTable />
      </div>
    </DashboardLayout>
  )
}