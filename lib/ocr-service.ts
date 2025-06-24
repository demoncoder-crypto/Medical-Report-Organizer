// Comprehensive OCR Service - Medical Document Text Extraction
import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  method: 'tesseract' | 'google-vision' | 'hybrid'
  processingTime: number
  detectedLanguage?: string
  medicalEntities?: MedicalEntity[]
  structuredData?: StructuredMedicalData
}

export interface MedicalEntity {
  type: 'medication' | 'dosage' | 'diagnosis' | 'doctor' | 'date' | 'lab_value' | 'vital_sign'
  text: string
  confidence: number
  position?: { x: number, y: number, width: number, height: number }
}

export interface StructuredMedicalData {
  documentType?: string
  patientName?: string
  doctorName?: string
  date?: string
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
    instructions?: string
  }>
  labResults?: Array<{
    test: string
    value: string
    unit: string
    referenceRange?: string
    status?: 'normal' | 'abnormal' | 'critical'
  }>
  vitals?: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
    height?: string
  }
  diagnosis?: string[]
  instructions?: string[]
}

export class OCRService {
  private static worker: Tesseract.Worker | null = null

  static async extractText(imageFile: File): Promise<OCRResult> {
    const startTime = Date.now()
    
    try {
      if (!this.worker) {
        console.log('[OCR] Initializing worker...')
        this.worker = await Tesseract.createWorker('eng')
      }

      console.log('[OCR] Starting text extraction...')
      const { data } = await this.worker.recognize(imageFile)
      const processingTime = Date.now() - startTime

      console.log(`[OCR] Completed in ${processingTime}ms`)

      return {
        text: data.text,
        confidence: data.confidence / 100,
        method: 'tesseract',
        processingTime
      }
    } catch (error) {
      console.error('[OCR] Error:', error)
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }

  // Server-side OCR using Google Vision API
  static async extractTextGoogleVision(
    imageBuffer: Buffer,
    apiKey: string,
    options: {
      detectHandwriting?: boolean
      medicalOptimization?: boolean
    } = {}
  ): Promise<OCRResult> {
    const startTime = Date.now()
    
    try {
      console.log('[OCR] Starting Google Vision text extraction...')
      
      // Prepare the request
      const base64Image = imageBuffer.toString('base64')
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              },
              ...(options.detectHandwriting ? [{
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }] : [])
            ],
            imageContext: {
              languageHints: ['en']
            }
          }
        ]
      }

      // Call Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const processingTime = Date.now() - startTime

      if (result.responses?.[0]?.error) {
        throw new Error(`Google Vision error: ${result.responses[0].error.message}`)
      }

      const textAnnotations = result.responses?.[0]?.textAnnotations || []
      const fullText = textAnnotations[0]?.description || ''
      
      // Calculate confidence (Google Vision doesn't provide overall confidence)
      const confidence = textAnnotations.length > 0 ? 0.9 : 0.1

      console.log(`[OCR] Google Vision completed in ${processingTime}ms`)
      console.log(`[OCR] Extracted ${fullText.length} characters`)

      // Extract medical entities from the text
      const medicalEntities = this.extractMedicalEntities(fullText)
      const structuredData = this.parseStructuredMedicalData(fullText)

      return {
        text: fullText,
        confidence,
        method: 'google-vision',
        processingTime,
        medicalEntities,
        structuredData
      }
    } catch (error) {
      console.error('[OCR] Google Vision error:', error)
      throw new Error(`Google Vision OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Hybrid OCR - Try Tesseract first, fallback to Google Vision for complex documents
  static async extractTextHybrid(
    imageFile: File,
    apiKey?: string,
    options: {
      forceGoogleVision?: boolean
      medicalOptimization?: boolean
    } = {}
  ): Promise<OCRResult> {
    try {
      // Convert File to buffer for Google Vision if needed
      const imageBuffer = await this.fileToBuffer(imageFile)
      
      // If Google Vision is forced or available, and the image looks complex
      if ((options.forceGoogleVision || apiKey) && await this.isComplexDocument(imageFile)) {
        if (apiKey) {
          console.log('[OCR] Using Google Vision for complex document')
          return await this.extractTextGoogleVision(imageBuffer, apiKey, {
            detectHandwriting: true,
            medicalOptimization: options.medicalOptimization
          })
        }
      }

      // Try Tesseract first for simple documents
      console.log('[OCR] Trying Tesseract first...')
      const tesseractResult = await this.extractText(imageFile)

      // If Tesseract confidence is low and Google Vision is available, try it
      if (tesseractResult.confidence < 0.7 && apiKey) {
        console.log('[OCR] Low confidence from Tesseract, trying Google Vision...')
        try {
          const googleResult = await this.extractTextGoogleVision(imageBuffer, apiKey, {
            detectHandwriting: true,
            medicalOptimization: options.medicalOptimization
          })
          
          // Return the better result
          if (googleResult.confidence > tesseractResult.confidence) {
            return { ...googleResult, method: 'hybrid' }
          }
        } catch (googleError) {
          console.warn('[OCR] Google Vision fallback failed:', googleError)
        }
      }

      return { ...tesseractResult, method: tesseractResult.confidence < 0.7 ? 'hybrid' : 'tesseract' }
    } catch (error) {
      console.error('[OCR] Hybrid OCR failed:', error)
      throw error
    }
  }

  // Extract medical entities using pattern matching
  private static extractMedicalEntities(text: string): MedicalEntity[] {
    const entities: MedicalEntity[] = []
    
    // Medication patterns
    const medicationPatterns = [
      /(?:Rx|Prescription|Take|Medication):\s*([A-Za-z]+(?:\s+[A-Za-z]+)*)/gi,
      /([A-Za-z]+(?:cillin|mycin|pril|sartan|statin|zole|pine|ide))\s+(\d+\s*mg)/gi,
      /(Aspirin|Ibuprofen|Acetaminophen|Metformin|Lisinopril|Amlodipine|Atorvastatin|Simvastatin|Omeprazole|Levothyroxine)\s*(\d+\s*mg)?/gi
    ]

    medicationPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'medication',
          text: match[1] || match[0],
          confidence: 0.8
        })
      }
    })

    // Dosage patterns
    const dosagePattern = /(\d+(?:\.\d+)?\s*(?:mg|g|ml|units?|tablets?|capsules?))/gi
    let dosageMatch
    while ((dosageMatch = dosagePattern.exec(text)) !== null) {
      entities.push({
        type: 'dosage',
        text: dosageMatch[1],
        confidence: 0.9
      })
    }

    // Doctor names
    const doctorPattern = /(?:Dr\.?|Doctor|Physician)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    let doctorMatch
    while ((doctorMatch = doctorPattern.exec(text)) !== null) {
      entities.push({
        type: 'doctor',
        text: doctorMatch[1],
        confidence: 0.7
      })
    }

    // Dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi
    let dateMatch
    while ((dateMatch = datePattern.exec(text)) !== null) {
      entities.push({
        type: 'date',
        text: dateMatch[1],
        confidence: 0.9
      })
    }

    // Lab values
    const labPattern = /((?:HbA1c|Glucose|Cholesterol|HDL|LDL|Triglycerides|Creatinine|BUN|WBC|RBC|Hemoglobin|Hematocrit))\s*:?\s*(\d+(?:\.\d+)?)\s*(\w+)?/gi
    let labMatch
    while ((labMatch = labPattern.exec(text)) !== null) {
      entities.push({
        type: 'lab_value',
        text: `${labMatch[1]}: ${labMatch[2]}${labMatch[3] ? ' ' + labMatch[3] : ''}`,
        confidence: 0.85
      })
    }

    // Vital signs
    const vitalPattern = /((?:BP|Blood Pressure|HR|Heart Rate|Temp|Temperature|Weight|Height))\s*:?\s*(\d+(?:[\/\-]\d+)?(?:\.\d+)?)\s*(\w+)?/gi
    let vitalMatch
    while ((vitalMatch = vitalPattern.exec(text)) !== null) {
      entities.push({
        type: 'vital_sign',
        text: `${vitalMatch[1]}: ${vitalMatch[2]}${vitalMatch[3] ? ' ' + vitalMatch[3] : ''}`,
        confidence: 0.8
      })
    }

    return entities
  }

  // Parse structured medical data from text
  private static parseStructuredMedicalData(text: string): StructuredMedicalData {
    const data: StructuredMedicalData = {}

    // Extract patient name
    const patientMatch = text.match(/(?:Patient|Name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    if (patientMatch) {
      data.patientName = patientMatch[1]
    }

    // Extract doctor name
    const doctorMatch = text.match(/(?:Dr\.?|Doctor|Physician)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
    if (doctorMatch) {
      data.doctorName = doctorMatch[1]
    }

    // Extract date
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (dateMatch) {
      data.date = dateMatch[1]
    }

    // Determine document type
    if (text.toLowerCase().includes('prescription') || text.toLowerCase().includes('rx')) {
      data.documentType = 'prescription'
    } else if (text.toLowerCase().includes('lab') || text.toLowerCase().includes('test result')) {
      data.documentType = 'lab_result'
    } else if (text.toLowerCase().includes('bill') || text.toLowerCase().includes('invoice')) {
      data.documentType = 'medical_bill'
    } else if (text.toLowerCase().includes('discharge') || text.toLowerCase().includes('summary')) {
      data.documentType = 'discharge_summary'
    }

    return data
  }

  // Helper: Check if document is complex (handwritten, low quality, etc.)
  private static async isComplexDocument(imageFile: File): Promise<boolean> {
    // Simple heuristics - in a real implementation, you'd use image analysis
    const fileName = imageFile.name.toLowerCase()
    
    // Assume handwritten documents or scanned documents are complex
    if (fileName.includes('scan') || fileName.includes('handwritten') || fileName.includes('fax')) {
      return true
    }

    // Check file size - very large files might be high-resolution scans
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB
      return true
    }

    return false
  }

  // Helper: Convert File to Buffer
  static async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
} 