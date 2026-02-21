import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const { error } = await supabase.from('job_photos').delete().eq('id', id)

    if (error) {
      console.error('[API] Failed to delete photo:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Unexpected error deleting photo:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete photo' }, { status: 500 })
  }
}
