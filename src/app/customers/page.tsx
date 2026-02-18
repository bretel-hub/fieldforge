import { DashboardLayout } from '@/components/DashboardLayout'
import { CustomersTable } from '@/components/CustomersTable'

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage the accounts that power proposals, jobs, and offline workflows
          </p>
        </div>
        <CustomersTable />
      </div>
    </DashboardLayout>
  )
}
