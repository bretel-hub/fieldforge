import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const jobRef = request.nextUrl.searchParams.get('jobRef')
    const jobId = request.nextUrl.searchParams.get('jobId')
    let query = supabase.from('receipts').select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (jobId || jobRef) {
      // Match receipts by job_id (stable text ID) or job_reference (human-readable)
      const conditions: string[] = []
      if (jobId) conditions.push(`job_id.eq.${jobId}`)
      if (jobRef) conditions.push(`job_reference.eq.${jobRef}`)
      query = query.or(conditions.join(','))
    }

    const { data, error } = await query

    if (error) {
      console.error('[API] Failed to fetch receipts:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, receipts: data ?? [] })
  } catch (error) {
    console.error('[API] Unexpected error fetching receipts:', error)
    return NextResponse.json({ success: false, error: 'Failed to load receipts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vendorName,
      total,
      subtotal,
      tax,
      jobReference,
      jobId,
      proposalId,
      category,
      paymentMethod,
      source = 'scan',
      status = 'inbox',
      mediaUrl,
      emailId,
      notes,
      currency = 'USD',
      metadata
    } = body

    if (!vendorName || !total) {
      return NextResponse.json(
        { success: false, error: 'Vendor name and total are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('receipts')
      .insert({
        vendor_name: vendorName,
        total,
        subtotal,
        tax,
        job_reference: jobReference,
        job_id: jobId || null,
        proposal_id: proposalId || null,
        category,
        payment_method: paymentMethod,
        source,
        status,
        media_url: mediaUrl,
        email_id: emailId,
        notes,
        currency,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Failed to insert receipt:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, receipt: data })
  } catch (error) {
    console.error('[API] Unexpected error creating receipt:', error)
    return NextResponse.json({ success: false, error: 'Failed to create receipt' }, { status: 500 })
  }
}
