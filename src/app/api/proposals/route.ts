import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { generateProposalNumber } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    // Insert proposal
    const proposalResult = await sql`
      INSERT INTO proposals (
        proposal_number,
        customer_name,
        customer_contact,
        customer_email,
        customer_address,
        project_title,
        project_description,
        project_location,
        project_timeline,
        status,
        subtotal,
        tax_amount,
        total
      ) VALUES (
        ${proposalNumber},
        ${customer.name},
        ${customer.contact},
        ${customer.email},
        ${customer.address},
        ${projectDetails.title},
        ${projectDetails.description},
        ${projectDetails.location},
        ${projectDetails.timeline},
        ${status},
        ${subtotal},
        ${tax},
        ${total}
      )
      RETURNING *
    `

    const proposal = proposalResult.rows[0]

    // Insert line items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        await sql`
          INSERT INTO proposal_line_items (
            proposal_id,
            category,
            description,
            quantity,
            unit_price,
            total,
            sort_order
          ) VALUES (
            ${proposal.id},
            ${item.category},
            ${item.description},
            ${item.quantity},
            ${item.unitPrice},
            ${item.total},
            ${i}
          )
        `
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
    const result = await sql`
      SELECT 
        p.*,
        COUNT(pli.id) as line_item_count
      FROM proposals p
      LEFT JOIN proposal_line_items pli ON p.id = pli.proposal_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    return NextResponse.json({
      success: true,
      proposals: result.rows
    })

  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}
