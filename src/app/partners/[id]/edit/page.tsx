import { DashboardLayout } from '@/components/DashboardLayout'
import { PartnerForm } from '@/components/PartnerForm'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface Cost {
  id: string
  amount: string
  unit: string
  unitCustom: string
}

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: partner, error } = await supabase
    .from('partners')
    .select('*, partner_costs(*)')
    .eq('id', id)
    .single()

  if (error || !partner) {
    notFound()
  }

  const costs: Cost[] = (partner.partner_costs ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((c: { id: string; amount: number; unit: string; unit_custom: string | null }) => ({
      id: c.id,
      amount: String(c.amount),
      unit: c.unit,
      unitCustom: c.unit_custom ?? '',
    }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Partner</h1>
          <p className="text-muted-foreground">{partner.name}{partner.company_name ? ` · ${partner.company_name}` : ''}</p>
        </div>

        <PartnerForm
          partnerId={id}
          initialData={{
            name: partner.name ?? '',
            companyName: partner.company_name ?? '',
            phone: partner.phone ?? '',
            email: partner.email ?? '',
            website: partner.website ?? '',
            address: partner.address ?? '',
            city: partner.city ?? '',
            state: partner.state ?? '',
            zip: partner.zip ?? '',
            costs,
            insuranceStartDate: partner.insurance_start_date ?? '',
            insuranceEndDate: partner.insurance_end_date ?? '',
            insuranceDocumentUrl: partner.insurance_document_url ?? '',
            insuranceDocumentName: partner.insurance_document_name ?? '',
          }}
        />
      </div>
    </DashboardLayout>
  )
}
