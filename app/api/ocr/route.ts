// OCR API - Extract text from medical document images
import { NextRequest, NextResponse } from 'next/server'
import { OCRService } from '@/lib/ocr-service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const method = formData.get('method') as string || 'tesseract'
    const apiKey = req.headers.get('X-Gemini-Api-Key') || process.env.GEMINI_API_KEY

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Please upload an image file (JPEG, PNG, WebP, BMP, TIFF)' 
      }, { status: 400 })
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 })
    }

    console.log(`[OCR API] Processing ${file.name} (${file.size} bytes) using ${method}`)

    let ocrResult
    
    try {
      if (method === 'google-vision' && apiKey) {
        // Use Google Vision API for server-side processing
        const imageBuffer = await OCRService.fileToBuffer(file)
        ocrResult = await OCRService.extractTextGoogleVision(imageBuffer, apiKey)
      } else {
        // Use Tesseract.js for client-side processing
        ocrResult = await OCRService.extractText(file)
      }

      // Post-process the extracted text for medical documents
      const processedResult = await postProcessMedicalText(ocrResult)

      return NextResponse.json({
        success: true,
        data: {
          ...processedResult,
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      })

    } catch (ocrError) {
      console.error('[OCR API] OCR processing failed:', ocrError)
      return NextResponse.json({ 
        success: false, 
        error: `OCR processing failed: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[OCR API] Request processing failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 })
  }
}

// Post-process extracted text for medical documents
async function postProcessMedicalText(ocrResult: any) {
  // Clean up common OCR errors in medical documents
  let cleanedText = ocrResult.text
    // Fix common medication name OCR errors
    .replace(/0/g, 'O') // Common OCR error: 0 instead of O
    .replace(/1/g, 'I') // Common OCR error: 1 instead of I in some contexts
    // Fix common dosage errors
    .replace(/(\d+)\s*rng/gi, '$1 mg') // "rng" instead of "mg"
    .replace(/(\d+)\s*rg/gi, '$1 mg')  // "rg" instead of "mg"
    // Fix common medical terms
    .replace(/Dr\s*\./gi, 'Dr.')
    .replace(/Rx\s*:/gi, 'Rx:')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // Extract medical entities using improved patterns
  const medicalEntities = extractAdvancedMedicalEntities(cleanedText)
  
  // Determine document type
  const documentType = determineDocumentType(cleanedText)
  
  // Extract structured data
  const structuredData = extractStructuredMedicalData(cleanedText)

  return {
    ...ocrResult,
    text: cleanedText,
    medicalEntities,
    documentType,
    structuredData,
    suggestions: generateImprovementSuggestions(ocrResult.confidence, cleanedText)
  }
}

function extractAdvancedMedicalEntities(text: string) {
  const entities = []

  // Enhanced medication patterns
  const medicationPatterns = [
    // Common medications with dosages
    /(Lisinopril|Metformin|Atorvastatin|Amlodipine|Simvastatin|Omeprazole|Levothyroxine|Aspirin|Ibuprofen)\s*(\d+\s*mg)?/gi,
    // Generic patterns for medications ending in common suffixes
    /([A-Za-z]+(?:cillin|mycin|pril|sartan|statin|zole|pine|ide))\s*(\d+\s*mg)?/gi,
    // Prescription patterns
    /Rx:\s*([A-Za-z\s]+?)(?:\d+\s*mg|\n|$)/gi
  ]

  medicationPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'medication',
        text: match[1].trim(),
        dosage: match[2]?.trim() || null,
        confidence: 0.85,
        context: match[0]
      })
    }
  })

  // Lab values with improved patterns
  const labPatterns = [
    /(HbA1c|Hemoglobin A1c)\s*:?\s*(\d+\.?\d*)\s*%?/gi,
    /(Glucose|Blood Sugar)\s*:?\s*(\d+)\s*(mg\/dL|mmol\/L)?/gi,
    /(Cholesterol|LDL|HDL|Triglycerides)\s*:?\s*(\d+)\s*(mg\/dL)?/gi,
    /(Blood Pressure|BP)\s*:?\s*(\d+\/\d+)/gi,
    /(Weight)\s*:?\s*(\d+\.?\d*)\s*(lbs?|kg)/gi,
    /(Height)\s*:?\s*(\d+(?:'\d+"|'\d+"|\.\d+)?)/gi
  ]

  labPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'lab_value',
        test: match[1],
        value: match[2],
        unit: match[3] || '',
        confidence: 0.9,
        context: match[0]
      })
    }
  })

  // Doctor and provider information
  const providerPattern = /(?:Dr\.?|Doctor|Provider)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
  let providerMatch
  while ((providerMatch = providerPattern.exec(text)) !== null) {
    entities.push({
      type: 'provider',
      name: providerMatch[1],
      confidence: 0.8,
      context: providerMatch[0]
    })
  }

  // Dates
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
  let dateMatch
  while ((dateMatch = datePattern.exec(text)) !== null) {
    entities.push({
      type: 'date',
      value: dateMatch[1],
      confidence: 0.95,
      context: dateMatch[0]
    })
  }

  return entities
}

function determineDocumentType(text: string): string {
  const textLower = text.toLowerCase()
  
  if (textLower.includes('prescription') || textLower.includes('rx:') || textLower.includes('take as directed')) {
    return 'prescription'
  } else if (textLower.includes('lab result') || textLower.includes('laboratory') || textLower.includes('test result')) {
    return 'lab_result'
  } else if (textLower.includes('bill') || textLower.includes('invoice') || textLower.includes('charges') || textLower.includes('payment')) {
    return 'medical_bill'
  } else if (textLower.includes('discharge') || textLower.includes('summary')) {
    return 'discharge_summary'
  } else if (textLower.includes('imaging') || textLower.includes('x-ray') || textLower.includes('mri') || textLower.includes('ct scan')) {
    return 'imaging_report'
  } else if (textLower.includes('vaccination') || textLower.includes('immunization')) {
    return 'vaccination_record'
  }
  
  return 'other'
}

function extractStructuredMedicalData(text: string) {
  const data: any = {}

  // Extract patient information
  const patientMatch = text.match(/(?:Patient|Name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (patientMatch) {
    data.patientName = patientMatch[1]
  }

  // Extract provider information
  const providerMatch = text.match(/(?:Dr\.?|Doctor|Provider)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (providerMatch) {
    data.providerName = providerMatch[1]
  }

  // Extract date
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    data.date = dateMatch[1]
  }

  // Extract medications with dosages
  const medications = []
  const medicationPattern = /(Lisinopril|Metformin|Atorvastatin|Amlodipine|Simvastatin|Omeprazole|Levothyroxine|Aspirin|Ibuprofen)\s*(\d+\s*mg)?\s*(?:take\s*)?([^.\n]*)?/gi
  let medMatch
  while ((medMatch = medicationPattern.exec(text)) !== null) {
    medications.push({
      name: medMatch[1],
      dosage: medMatch[2]?.trim() || '',
      instructions: medMatch[3]?.trim() || ''
    })
  }
  if (medications.length > 0) {
    data.medications = medications
  }

  return data
}

function generateImprovementSuggestions(confidence: number, text: string): string[] {
  const suggestions = []

  if (confidence < 0.7) {
    suggestions.push('Consider using a higher resolution image for better text recognition')
    suggestions.push('Ensure the document is well-lit and in focus')
    suggestions.push('Try straightening the document if it appears skewed')
  }

  if (confidence < 0.5) {
    suggestions.push('This appears to be a challenging document. Consider using Google Vision API for better results')
    suggestions.push('If this is handwritten text, manual transcription may be more accurate')
  }

  if (text.length < 50) {
    suggestions.push('Very little text was detected. Please verify the image contains readable text')
  }

  if (!text.match(/\d/)) {
    suggestions.push('No numbers detected. Medical documents typically contain dosages, dates, or lab values')
  }

  return suggestions
} 