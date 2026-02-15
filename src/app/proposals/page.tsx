import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalsTable } from '@/components/ProposalsTable'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
            <p className="text-muted-foreground">
              Create and manage sales proposals for your customers
            </p>
          </div>
          <Link 
            href="/proposals/create"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </div>
        
        <ProposalsTable />
      </div>
    </DashboardLayout>
  )
}