import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string

    // Extract source from URL
    let source = ''
    try {
      const urlObj = new URL(url)
      source = urlObj.hostname.replace('www.', '')
    } catch (e) {
      source = ''
    }

    // Redirect to add page with pre-filled data
    const params = new URLSearchParams({
      url: url || '',
      title: title || text || '',
      source: source
    })

    return NextResponse.redirect(
      new URL(`/add?${params.toString()}`, request.url),
      303
    )
  } catch (error) {
    console.error('Error handling share target:', error)
    return NextResponse.redirect(new URL('/?error=share_failed', request.url), 303)
  }
}