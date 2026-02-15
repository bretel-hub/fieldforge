import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalBuilder } from '@/components/ProposalBuilder'

export default function CreateProposalPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Proposal</h1>
          <p className="text-muted-foreground">
            Build a professional proposal with Good-Better-Best options
          </p>
        </div>
        
        <ProposalBuilder />
      </div>
    </DashboardLayout>
  )
}