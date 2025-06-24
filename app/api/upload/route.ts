import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveDocument } from '@/lib/document-store'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

export async function POST(req: NextRequest) {
  console.log('---[/api/upload] - POST request received---')
  try {
    const userApiKey = req.headers.get('X-Gemini-Api-Key')
    const apiKey = userApiKey || process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('[API] Gemini API key is missing.')
      return NextResponse.json({ success: false, error: 'Server is not configured for AI processing. Please provide an API key in settings.' }, { status: 500 })
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const data = await req.formData()
    const file = data.get('file') as File | null

    if (!file) {
      console.error('[API] No file found in FormData.')
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`[API] File received: ${file.name}`)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('[API] File buffered.')

    // Step 1: Re-enable PDF Parsing
    const text = await extractText(file.type, buffer, file.name)
    console.log(`[API] Text extracted. Length: ${text.length}`)

    // Analyze with AI
    let aiAnalysis
    try {
      aiAnalysis = await analyzeDocument(text, file.name, model)
      console.log('[API] AI analysis complete.')
    } catch (aiError) {
      console.error('[API] AI analysis failed:', aiError)
      aiAnalysis = {
        category: 'other' as const,
        summary: 'AI analysis failed. Document uploaded successfully.',
        tags: ['unanalyzed'],
        extractedInfo: {}
      }
    }

    const documentToSave = {
      name: file.name,
      type: aiAnalysis.category,
      date: new Date(),
      summary: aiAnalysis.summary,
      tags: aiAnalysis.tags,
      content: text,
      doctor: aiAnalysis.extractedInfo?.doctor,
      hospital: aiAnalysis.extractedInfo?.hospital,
    }
    
    const savedDoc = await saveDocument(documentToSave)

    return NextResponse.json({ success: true, document: savedDoc, message: 'PDF Parsed successfully.' })

  } catch (error) {
    console.error('Error in PDF parsing step:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

async function extractText(fileType: string, buffer: Buffer, fileName: string): Promise<string> {
  if (fileType.startsWith('image/')) {
    // We'll address image processing later
    return 'Image content extraction is not yet supported.'
  }
  
  if (fileType === 'application/pdf') {
    console.log('[API] Parsing PDF using worker process...')
    
    return new Promise(async (resolve, reject) => {
      // Create a temporary file for the result
      const tempDir = os.tmpdir()
      const resultFile = path.join(tempDir, `pdf-result-${Date.now()}.json`)
      
      const workerPath = path.join(process.cwd(), 'lib', 'pdf-parser-worker.js')
      const worker = spawn('node', [workerPath, resultFile])
      
      let errorOutput = ''
      
      worker.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      worker.on('close', async (code) => {
        try {
          // Read the result from the temporary file
          const resultData = await fs.readFile(resultFile, 'utf-8')
          const result = JSON.parse(resultData)
          
          // Clean up the temporary file
          await fs.unlink(resultFile).catch(() => {})
          
          if (result.success) {
            console.log('[API] PDF parsing successful.')
            resolve(result.text)
          } else {
            console.error('[API] PDF parsing failed:', result.error)
            resolve(`PDF file uploaded: ${fileName} (Text extraction failed: ${result.error})`)
          }
        } catch (error) {
          console.error('[API] Failed to read worker result:', error)
          // Clean up the temporary file
          await fs.unlink(resultFile).catch(() => {})
          resolve(`PDF file uploaded: ${fileName} (Text extraction error)`)
        }
      })
      
      // Send the PDF buffer to the worker process
      worker.stdin.write(buffer)
      worker.stdin.end()
    })
  }

  // Fallback for plain text files
  return buffer.toString()
}

async function analyzeDocument(text: string, fileName: string, model: any) {
  const prompt = `
  Analyze this medical document and provide:
  1. Category: One of [prescription, lab_report, bill, test_report, other]
  2. A brief summary (1-2 sentences)
  3. Relevant tags (medications, conditions, test types, etc.)
  4. Extract doctor name and hospital/clinic if present
  
  Document name: ${fileName}
  Document content:
  ${text.substring(0, 3000)} // Limit to prevent token overflow
  
  Respond in JSON format:
  {
    "category": "...",
    "summary": "...",
    "tags": ["tag1", "tag2"],
    "extractedInfo": {
      "doctor": "...",
      "hospital": "..."
    }
  }
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    
    return {
      category: analysis.category || 'other',
      summary: analysis.summary || 'Medical document',
      tags: analysis.tags || [],
      extractedInfo: analysis.extractedInfo || {}
    }
  } catch (error) {
    console.error('Error analyzing document with AI:', error)
    throw error
  }
} 