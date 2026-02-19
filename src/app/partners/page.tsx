import { DashboardLayout } from '@/components/DashboardLayout'
import { PartnersTable } from '@/components/PartnersTable'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function PartnersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-muted-foreground">Manage your subcontractors and partner relationships</p>
          </div>
          <Link
            href="/partners/create"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Link>
        </div>

        <PartnersTable />
      </div>
    </DashboardLayout>
  )
}
