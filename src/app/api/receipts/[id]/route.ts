import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const updates = await request.json()
    const permittedFields = {
      vendor_name: updates.vendorName,
      category: updates.category,
      subtotal: updates.subtotal,
      tax: updates.tax,
      total: updates.total,
      currency: updates.currency,
      payment_method: updates.paymentMethod,
      source: updates.source,
      status: updates.status,
      job_reference: updates.jobReference,
      job_id: updates.jobId,
      proposal_id: updates.proposalId,
      media_url: updates.mediaUrl,
      email_id: updates.emailId,
      notes: updates.notes,
      metadata: updates.metadata
    }

    const payload: Record<string, unknown> = {}
    Object.entries(permittedFields).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        payload[key] = value
      }
    })

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields provided' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('receipts')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API] Failed to update receipt:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, receipt: data })
  } catch (error) {
    console.error('[API] Unexpected error updating receipt:', error)
    return NextResponse.json({ success: false, error: 'Failed to update receipt' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const { error } = await supabase.from('receipts').delete().eq('id', id)

    if (error) {
      console.error('[API] Failed to delete receipt:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Unexpected error deleting receipt:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete receipt' }, { status: 500 })
  }
}
