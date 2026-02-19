import { DashboardLayout } from '@/components/DashboardLayout'
import { PartnerForm } from '@/components/PartnerForm'

export default function CreatePartnerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Partner</h1>
          <p className="text-muted-foreground">Add a new subcontractor or partner</p>
        </div>

        <PartnerForm />
      </div>
    </DashboardLayout>
  )
}
