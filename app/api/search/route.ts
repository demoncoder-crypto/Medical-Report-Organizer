import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { searchDocumentsByContent } from '@/lib/document-store'

export async function POST(req: NextRequest) {
  try {
    const userApiKey = req.headers.get('X-Gemini-Api-Key')
    const apiKey = userApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key is missing.' }, { status: 400 })
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const body = await req.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 })
    }

    // First, get all documents that might be relevant using keyword search
    const documents = await searchDocumentsByContent(query)
    
    if (documents.length === 0) {
      // Try semantic search with AI if no keyword matches
      const results = await semanticSearch(query, model)
      return NextResponse.json({ success: true, results })
    }
    
    // Use AI to rank and summarize the results
    const results = await enhanceSearchResults(query, documents, model)
    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('Error in /api/search:', error)
    // Fallback to simple keyword search
    try {
      const body = await req.json()
      const { query } = body
      const results = await searchDocumentsByContent(query)
      return NextResponse.json({ success: true, results })
    } catch (fallbackError) {
      console.error('Error in fallback search:', fallbackError)
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown server error'
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  }
}

// ... (semanticSearch and enhanceSearchResults functions from lib/search.ts go here)
async function semanticSearch(query: string, model: any) {
  const allDocs = await searchDocumentsByContent('')
  
  const prompt = `
  Given the following medical documents, find and summarize information relevant to this query: "${query}"
  
  Documents:
  ${allDocs.map(doc => `
  - ${doc.name} (${doc.type}, ${doc.date.toLocaleDateString()})
    Summary: ${doc.summary}
    Tags: ${doc.tags.join(', ')}
  `).join('\n')}
  
  Return a JSON array of relevant findings, each with:
  - documentName: the document name
  - date: the document date
  - content: a specific excerpt or summary answering the query
  `
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  return JSON.parse(response.text()).results || []
}

async function enhanceSearchResults(query: string, documents: any[], model: any) {
  const enhancedResults = []
  
  for (const doc of documents.slice(0, 5)) {
    const prompt = `
      Extract the most relevant information from this medical document that answers the query: "${query}"
      
      Document: ${doc.name}
      Summary: ${doc.summary}
      Content excerpt: ${doc.content?.substring(0, 1000) || doc.summary}
      
      Return a concise answer (2-3 sentences) that directly addresses the query.
      `
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      enhancedResults.push({
        documentName: doc.name,
        date: doc.date.toLocaleDateString(),
        content: response.text() || doc.summary,
        originalDoc: doc
      })
    } catch {
      enhancedResults.push({
        documentName: doc.name,
        date: doc.date.toLocaleDateString(),
        content: doc.summary,
        originalDoc: doc
      })
    }
  }
  
  return enhancedResults
} 