import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveDocument } from '@/lib/document-store'

export async function GET() {
  return NextResponse.json({ 
    status: 'Upload API is working', 
    timestamp: new Date().toISOString(),
    message: 'Use POST to upload files' 
  })
}

export async function POST(req: NextRequest) {
  console.log('---[/api/upload] - POST request received---')
  console.log('[API] Request URL:', req.url)
  console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()))
  
  try {
    const userApiKey = req.headers.get('X-Gemini-Api-Key')
    const apiKey = userApiKey || process.env.GEMINI_API_KEY
    
    const data = await req.formData()
    const file = data.get('file') as File | null

    if (!file) {
      console.error('[API] No file found in FormData.')
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`[API] File received: ${file.name}, size: ${file.size}, type: ${file.type}`)
    
    // Extract content from the file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('[API] File buffered.')

    let extractedText = ''
    let category = 'other'
    let summary = `Document uploaded: ${file.name}`
    let tags = ['uploaded']
    let extractedInfo = {}

    try {
      // Smart content analysis based on file type
      if (file.type === 'application/pdf') {
        console.log('[API] Processing PDF document...')
        
        if (apiKey) {
          // Use Gemini's multimodal capabilities to analyze the PDF directly
          extractedText = await analyzePdfWithAI(buffer, file.name, apiKey)
          console.log(`[API] AI-based PDF analysis complete. Content length: ${extractedText.length}`)
        } else {
          // Fallback without API key
          extractedText = await extractBasicPdfInfo(buffer, file.name)
          console.log('[API] Basic PDF analysis complete (no API key)')
        }
      } else {
        // Handle other file types
        extractedText = await extractText(file.type, buffer, file.name)
        console.log(`[API] Text extracted. Length: ${extractedText.length}`)
      }

      // Only do AI analysis if we have an API key and meaningful content
      if (apiKey && extractedText.length > 50) {
        console.log('[API] Starting AI categorization...')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        
        const aiAnalysis = await analyzeDocument(extractedText, file.name, model)
        category = aiAnalysis.category
        summary = aiAnalysis.summary
        tags = aiAnalysis.tags
        extractedInfo = aiAnalysis.extractedInfo
        console.log('[API] AI categorization complete.')
      } else {
        console.log('[API] Skipping AI analysis - no API key or insufficient content')
        // Smart fallback categorization based on filename
        const smartAnalysis = smartCategorizeByFilename(file.name)
        category = smartAnalysis.category
        summary = smartAnalysis.summary
        tags = smartAnalysis.tags
        extractedInfo = {}
      }
    } catch (error) {
      console.error('[API] Error in document processing:', error)
      // Continue with basic document info even if processing fails
    }
    
    // Create document entry
    const documentToSave = {
      name: file.name,
      type: category as 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other',
      date: new Date(),
      summary: summary,
      tags: tags,
      content: extractedText || `File: ${file.name} (${file.type})`,
      doctor: (extractedInfo as any)?.doctor,
      hospital: (extractedInfo as any)?.hospital,
    }
    
    const savedDoc = await saveDocument(documentToSave)
    console.log('[API] Document saved successfully')

    return NextResponse.json({ 
      success: true, 
      document: savedDoc,
      message: `File '${file.name}' processed successfully!` 
    })

  } catch (error) {
    console.error('Error in upload:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

async function analyzePdfWithAI(buffer: Buffer, fileName: string, apiKey: string): Promise<string> {
  try {
    console.log('[API] Using Gemini multimodal analysis for PDF...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
    
    // Convert buffer to base64 for Gemini
    const base64Data = buffer.toString('base64')
    
    const prompt = `
    Analyze this PDF medical document and extract all relevant text content. 
    Please provide a comprehensive text transcription of the document, including:
    - All visible text content
    - Medical data, test results, values
    - Doctor names, hospital information
    - Dates, patient information
    - Any other relevant medical information
    
    Document filename: ${fileName}
    
    Please provide the full text content as if you were transcribing the document.
    `
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf'
        }
      }
    ])
    
    const response = await result.response
    const extractedText = response.text()
    
    console.log('[API] Gemini multimodal analysis successful')
    return extractedText
    
  } catch (error) {
    console.error('[API] Gemini multimodal analysis failed:', error)
    // Fallback to basic analysis
    return await extractBasicPdfInfo(buffer, fileName)
  }
}

async function extractBasicPdfInfo(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const fileSize = buffer.length
    const fileSizeKB = Math.round(fileSize / 1024)
    
    // Try to extract some basic info from the PDF header
    const pdfHeader = buffer.toString('binary', 0, Math.min(2000, buffer.length))
    
    let description = `PDF document: ${fileName} (${fileSizeKB} KB). `
    
    if (pdfHeader.includes('/Title')) {
      description += 'Document contains title information. '
    }
    if (pdfHeader.includes('/Author')) {
      description += 'Document has author metadata. '
    }
    if (pdfHeader.includes('/Creator')) {
      description += 'Generated by document creation software. '
    }
    
    // Try to find any readable text snippets
    const textMatches = pdfHeader.match(/\(([^)]+)\)/g)
    if (textMatches && textMatches.length > 0) {
      const extractedStrings = textMatches
        .map(match => match.slice(1, -1))
        .filter(str => str.length > 2 && /[a-zA-Z]/.test(str))
        .slice(0, 5)
      
      if (extractedStrings.length > 0) {
        description += `Content preview: ${extractedStrings.join(', ')}. `
      }
    }
    
    description += 'This is a medical PDF document ready for review.'
    return description
    
  } catch (error) {
    console.error('[API] Basic PDF analysis failed:', error)
    return `PDF document uploaded: ${fileName}. File saved successfully for manual review.`
  }
}

async function extractText(fileType: string, buffer: Buffer, fileName: string): Promise<string> {
  if (fileType.startsWith('image/')) {
    return `Image file uploaded: ${fileName} (OCR processing will be added in future updates)`
  }

  // Handle plain text files
  if (fileType.startsWith('text/')) {
    try {
      return buffer.toString('utf-8')
    } catch (error) {
      return `Text file uploaded: ${fileName} (Encoding issue detected)`
    }
  }

  // Handle other document types
  if (fileType.includes('word') || fileType.includes('document')) {
    return `Document uploaded: ${fileName} (Microsoft Word or similar document format)`
  }

  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return `Spreadsheet uploaded: ${fileName} (Excel or similar spreadsheet format)`
  }

  // Fallback for other file types
  return `File uploaded: ${fileName} (Content type: ${fileType})`
}

function smartCategorizeByFilename(fileName: string) {
  const filenameLower = fileName.toLowerCase()
  
  if (filenameLower.includes('prescription') || filenameLower.includes('rx') || filenameLower.includes('medication')) {
    return {
      category: 'prescription',
      summary: `Prescription document: ${fileName}`,
      tags: ['prescription', 'medication', 'pharmacy'],
      extractedInfo: {}
    }
  } else if (filenameLower.includes('lab') || filenameLower.includes('blood') || filenameLower.includes('test')) {
    return {
      category: 'lab_report',
      summary: `Laboratory test report: ${fileName}`,
      tags: ['lab', 'test', 'results', 'medical'],
      extractedInfo: {}
    }
  } else if (filenameLower.includes('bill') || filenameLower.includes('invoice') || filenameLower.includes('payment')) {
    return {
      category: 'bill',
      summary: `Medical billing document: ${fileName}`,
      tags: ['billing', 'payment', 'insurance'],
      extractedInfo: {}
    }
  } else if (filenameLower.includes('report') || filenameLower.includes('scan') || filenameLower.includes('xray')) {
    return {
      category: 'test_report',
      summary: `Medical test report: ${fileName}`,
      tags: ['report', 'diagnostic', 'imaging'],
      extractedInfo: {}
    }
  }
  
  return {
    category: 'other',
    summary: `Medical document: ${fileName}`,
    tags: ['medical', 'document'],
    extractedInfo: {}
  }
}

async function analyzeDocument(text: string, fileName: string, model: any) {
  const prompt = `
  Analyze this medical document and provide a JSON response with the following structure:
  
  {
    "category": "one of: prescription, lab_report, bill, test_report, other",
    "summary": "brief 1-2 sentence summary of the document",
    "tags": ["array", "of", "relevant", "medical", "tags"],
    "extractedInfo": {
      "doctor": "doctor name if found",
      "hospital": "hospital/clinic name if found"
    }
  }
  
  Document filename: ${fileName}
  Document content:
  ${text.substring(0, 4000)}
  
  Please analyze this medical document and categorize it appropriately based on the content. Look for:
  
  CATEGORIZATION RULES:
  - prescription: Medication names, dosages, pharmacy information, prescribing doctor
  - lab_report: Laboratory test results, blood work, pathology reports, test values
  - bill: Medical bills, insurance claims, payment information, charges
  - test_report: Diagnostic reports, imaging results, X-rays, MRI, CT scans
  - other: General medical documents, discharge summaries, consultation notes
  
  Generate appropriate medical tags based on the content and document type.
  Create a helpful summary that captures the key medical information.
  Extract doctor and hospital names if clearly mentioned.
  
  Respond with ONLY the JSON object, no additional text.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()
    
    console.log('[API] AI response received:', responseText.substring(0, 200))
    
    // Clean up the response to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    
    return {
      category: analysis.category || 'other',
      summary: analysis.summary || `Medical document: ${fileName}`,
      tags: Array.isArray(analysis.tags) ? analysis.tags : ['medical', 'document'],
      extractedInfo: analysis.extractedInfo || {}
    }
  } catch (error) {
    console.error('Error analyzing document with AI:', error)
    
    // Fallback to smart categorization
    return smartCategorizeByFilename(fileName)
  }
} 