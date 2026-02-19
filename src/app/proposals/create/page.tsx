import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalBuilder } from '@/components/ProposalBuilder'

export default function CreateProposalPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Proposal</h1>
          <p className="text-muted-foreground">
            Build a professional proposal for your customer
          </p>
        </div>
        
        <ProposalBuilder />
      </div>
    </DashboardLayout>
  )
}