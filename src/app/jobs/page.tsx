import { DashboardLayout } from '@/components/DashboardLayout'
import { JobsTable } from '@/components/JobsTable'
import { Camera } from 'lucide-react'

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
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
              <Camera className="h-4 w-4" />
              Quick Photo
            </button>
          </div>
        </div>
        
        <JobsTable />
      </div>
    </DashboardLayout>
  )
}