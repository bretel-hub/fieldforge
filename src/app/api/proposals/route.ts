import { NextRequest, NextResponse } from 'next/server'
import { supabase, generateProposalNumber } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Proposal POST request received')
    const body = await request.json()
    console.log('[API] Request body parsed:', { 
      hasCustomer: !!body.customer,
      hasProjectDetails: !!body.projectDetails,
      itemsCount: body.items?.length || 0
    })
    
    const {
      customer,
      projectDetails,
      items,
      subtotal,
      tax,
      total,
      status = 'draft'
    } = body

    // Generate proposal number
    const proposalNumber = generateProposalNumber()
    console.log('[API] Generated proposal number:', proposalNumber)

    // Insert proposal
    console.log('[API] Attempting to insert proposal...')
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        proposal_number: proposalNumber,
        customer_name: customer.name,
        customer_contact: customer.contact,
        customer_email: customer.email,
        customer_address: customer.address,
        project_title: projectDetails.title,
        project_description: projectDetails.description,
        project_location: projectDetails.location,
        project_timeline: projectDetails.timeline,
        status,
        subtotal,
        tax_amount: tax,
        total
      })
      .select()
      .single()

    if (proposalError) {
      console.error('Error creating proposal:', proposalError)
      return NextResponse.json(
        { success: false, error: proposalError.message },
        { status: 500 }
      )
    }

    // Insert line items
    if (items && items.length > 0) {
      const lineItems = items.map((item: any, index: number) => ({
        proposal_id: proposal.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
        sort_order: index
      }))

      const { error: itemsError } = await supabase
        .from('proposal_line_items')
        .insert(lineItems)

      if (itemsError) {
        console.error('Error creating line items:', itemsError)
        // Don't fail the whole request, just log it
      }
    }

    return NextResponse.json({ 
      success: true,
      proposal,
      message: 'Proposal saved successfully'
    })

  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        *,
        proposal_line_items(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching proposals:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposals
    })

  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}
