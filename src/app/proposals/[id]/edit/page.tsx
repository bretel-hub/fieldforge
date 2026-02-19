import { DashboardLayout } from '@/components/DashboardLayout'
import { ProposalBuilder } from '@/components/ProposalBuilder'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(`*, proposal_line_items(*)`)
    .eq('id', id)
    .single()

  if (error || !proposal) {
    notFound()
  }

  const initialData = {
    customer: {
      name: proposal.customer_name ?? '',
      contact: proposal.customer_contact ?? '',
      email: proposal.customer_email ?? '',
      address: proposal.customer_address ?? '',
    },
    projectDetails: {
      title: proposal.project_title ?? '',
      description: proposal.project_description ?? '',
      location: proposal.project_location ?? '',
      timeline: proposal.project_timeline ?? '',
    },
    items: (proposal.proposal_line_items ?? []).map((item: any) => ({
      id: item.id,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Proposal</h1>
          <p className="text-muted-foreground">
            {proposal.proposal_number} — {proposal.project_title}
          </p>
        </div>

        <ProposalBuilder
          proposalId={id}
          proposalNumber={proposal.proposal_number}
          initialStatus={proposal.status ?? 'draft'}
          initialData={initialData}
        />
      </div>
    </DashboardLayout>
  )
}
