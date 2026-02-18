import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get proposal
    const proposalResult = await sql`
      SELECT * FROM proposals WHERE id = ${id}
    `

    if (proposalResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Get line items
    const itemsResult = await sql`
      SELECT * FROM proposal_line_items 
      WHERE proposal_id = ${id}
      ORDER BY sort_order
    `

    const proposal = {
      ...proposalResult.rows[0],
      items: itemsResult.rows
    }

    return NextResponse.json({
      success: true,
      proposal
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
    await sql`
      UPDATE proposals SET
        customer_name = ${customer.name},
        customer_contact = ${customer.contact},
        customer_email = ${customer.email},
        customer_address = ${customer.address},
        project_title = ${projectDetails.title},
        project_description = ${projectDetails.description},
        project_location = ${projectDetails.location},
        project_timeline = ${projectDetails.timeline},
        status = ${status || 'draft'},
        subtotal = ${subtotal},
        tax_amount = ${tax},
        total = ${total}
      WHERE id = ${id}
    `

    // Delete existing line items
    await sql`
      DELETE FROM proposal_line_items WHERE proposal_id = ${id}
    `

    // Insert updated line items
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
            ${id},
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await sql`
      DELETE FROM proposals WHERE id = ${id}
    `

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
