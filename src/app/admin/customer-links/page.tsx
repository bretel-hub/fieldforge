import { DashboardLayout } from '@/components/DashboardLayout'
import { CustomerLinkGenerator } from '@/components/CustomerLinkGenerator'

export default function CustomerLinksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Portal Links</h1>
          <p className="text-muted-foreground">
            Generate secure email links for customer portal access
          </p>
        </div>
        
        <CustomerLinkGenerator />
      </div>
    </DashboardLayout>
  )
}