import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('*, partner_costs(*)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, partners })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, companyName, phone, email, website,
      address, city, state, zip,
      costs,
      insuranceStartDate, insuranceEndDate,
      insuranceDocumentUrl, insuranceDocumentName,
    } = body

    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
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
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (costs && costs.length > 0) {
      const costRows = costs.map((c: { amount: number; unit: string; unitCustom: string; sortOrder: number }) => ({
        partner_id: partner.id,
        amount: c.amount,
        unit: c.unit,
        unit_custom: c.unitCustom || null,
        sort_order: c.sortOrder,
      }))
      await supabase.from('partner_costs').insert(costRows)
    }

    return NextResponse.json({ success: true, partner })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create partner' }, { status: 500 })
  }
}
