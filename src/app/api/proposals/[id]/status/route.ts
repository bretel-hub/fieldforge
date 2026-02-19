import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating proposal status:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal status updated successfully',
    })
  } catch (error) {
    console.error('Error updating proposal status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update proposal status' },
      { status: 500 }
    )
  }
}
