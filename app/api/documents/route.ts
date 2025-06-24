import { NextResponse } from 'next/server'
import { getDocuments } from '@/lib/document-store'

export async function GET() {
  try {
    console.log('[API] Fetching documents...')
    const documents = await getDocuments()
    console.log(`[API] Found ${documents.length} documents:`, documents.map(d => d.name))
    
    // Return documents directly (not wrapped in success object)
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 })
  }
} 