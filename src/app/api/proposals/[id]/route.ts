import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get proposal with line items
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        proposal_line_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching proposal:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal: {
        ...proposal,
        items: proposal.proposal_line_items || []
      }
    })

  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proposal' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      customer,
      projectDetails,
      items,
      subtotal,
      tax,
      total,
      status
    } = body

    // Update proposal
    const { error: updateError } = await supabase
      .from('proposals')
      .update({
        customer_name: customer.name,
        customer_contact: customer.contact,
        customer_email: customer.email,
        customer_address: customer.address,
        project_title: projectDetails.title,
        project_description: projectDetails.description,
        project_location: projectDetails.location,
        project_timeline: projectDetails.timeline,
        status: status || 'draft',
        subtotal,
        tax_amount: tax,
        total
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating proposal:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // Delete existing line items
    await supabase
      .from('proposal_line_items')
      .delete()
      .eq('proposal_id', id)

    // Insert updated line items
    if (items && items.length > 0) {
      const lineItems = items.map((item: any, index: number) => ({
        proposal_id: id,
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
        console.error('Error updating line items:', itemsError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal updated successfully'
    })

  } catch (error) {
    console.error('Error updating proposal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update proposal' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting proposal:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting proposal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete proposal' },
      { status: 500 }
    )
  }
}
