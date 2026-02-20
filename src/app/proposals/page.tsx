import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalsTable } from '@/components/ProposalsTable'

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Build Proposal</h1>
          <p className="text-muted-foreground">
            Create and manage sales proposals
          </p>
        </div>
        
        <ProposalsTable />
      </div>
    </DashboardLayout>
  )
}