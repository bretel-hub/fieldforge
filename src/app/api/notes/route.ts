import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('job_notes')
      .select('*')
      .eq('job_id', jobId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('[API] Failed to fetch notes:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, notes: data ?? [] })
  } catch (error) {
    console.error('[API] Unexpected error fetching notes:', error)
    return NextResponse.json({ success: false, error: 'Failed to load notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, jobId, text, timestamp } = body

    if (!jobId || !text) {
      return NextResponse.json(
        { success: false, error: 'jobId and text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('job_notes')
      .upsert({
        id: id || crypto.randomUUID(),
        job_id: jobId,
        text,
        timestamp: timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Failed to save note:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, note: data })
  } catch (error) {
    console.error('[API] Unexpected error saving note:', error)
    return NextResponse.json({ success: false, error: 'Failed to save note' }, { status: 500 })
  }
}
