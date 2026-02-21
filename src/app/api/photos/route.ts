import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId)
      .order('captured_at', { ascending: false })

    if (error) {
      console.error('[API] Failed to fetch photos:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, photos: data ?? [] })
  } catch (error) {
    console.error('[API] Unexpected error fetching photos:', error)
    return NextResponse.json({ success: false, error: 'Failed to load photos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const id = (formData.get('id') as string) || crypto.randomUUID()
    const jobId = formData.get('jobId') as string
    const capturedAt = formData.get('capturedAt') as string
    const latitude = formData.get('latitude') as string | null
    const longitude = formData.get('longitude') as string | null
    const accuracy = formData.get('accuracy') as string | null

    if (!file || !jobId) {
      return NextResponse.json({ success: false, error: 'File and jobId are required' }, { status: 400 })
    }

    // Convert file to base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const { data, error } = await supabase
      .from('job_photos')
      .upsert({
        id,
        job_id: jobId,
        file_name: file.name,
        data_url: dataUrl,
        mime_type: file.type,
        size: file.size,
        captured_at: capturedAt || new Date().toISOString(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Failed to save photo:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, photo: data })
  } catch (error) {
    console.error('[API] Unexpected error saving photo:', error)
    return NextResponse.json({ success: false, error: 'Failed to save photo' }, { status: 500 })
  }
}
