import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: partner, error } = await supabase
      .from('partners')
      .select('*, partner_costs(*)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    return NextResponse.json({ success: true, partner })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch partner' }, { status: 500 })
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
      name, companyName, phone, email, website,
      address, city, state, zip,
      costs,
      insuranceStartDate, insuranceEndDate,
      insuranceDocumentUrl, insuranceDocumentName,
    } = body

    const { error: updateError } = await supabase
      .from('partners')
      .update({
        name,
        company_name: companyName || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        insurance_start_date: insuranceStartDate || null,
        insurance_end_date: insuranceEndDate || null,
        insurance_document_url: insuranceDocumentUrl || null,
        insurance_document_name: insuranceDocumentName || null,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Replace costs: delete existing, insert new
    await supabase.from('partner_costs').delete().eq('partner_id', id)

    if (costs && costs.length > 0) {
      const costRows = costs.map((c: { amount: number; unit: string; unitCustom: string; sortOrder: number }) => ({
        partner_id: id,
        amount: c.amount,
        unit: c.unit,
        unit_custom: c.unitCustom || null,
        sort_order: c.sortOrder,
      }))
      await supabase.from('partner_costs').insert(costRows)
    }

    return NextResponse.json({ success: true, message: 'Partner updated successfully' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update partner' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase.from('partners').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete partner' }, { status: 500 })
  }
}
