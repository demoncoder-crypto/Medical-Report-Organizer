import { GoogleGenerativeAI } from '@google/generative-ai'

// Document interfaces
export interface Document {
  id: string
  userId: string
  name: string
  originalFileName: string
  fileType: string
  fileSize: number
  mimeType: string
  storageUrl: string
  thumbnailUrl?: string
  category: DocumentCategory
  subCategory?: string
  doctorName?: string
  hospitalName?: string
  visitDate?: Date
  summary?: string
  extractedText?: string
  aiAnalysis?: any
  tags: string[]
  isEncrypted: boolean
  isShared: boolean
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export enum DocumentCategory {
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_REPORT = 'LAB_REPORT',
  TEST_REPORT = 'TEST_REPORT',
  MEDICAL_BILL = 'MEDICAL_BILL',
  INSURANCE_DOCUMENT = 'INSURANCE_DOCUMENT',
  VACCINATION_RECORD = 'VACCINATION_RECORD',
  MEDICAL_IMAGE = 'MEDICAL_IMAGE',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  CONSULTATION_NOTE = 'CONSULTATION_NOTE',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER'
}

export interface DocumentUploadData {
  name: string
  originalFileName: string
  fileType: string
  fileSize: number
  mimeType: string
  buffer: Buffer
  userId: string
}

export interface DocumentAnalysis {
  category: DocumentCategory
  summary: string
  tags: string[]
  extractedInfo: {
    doctorName?: string
    hospitalName?: string
    visitDate?: Date
    medicalValues?: any[]
    medications?: string[]
    diagnoses?: string[]
  }
}

export class DocumentService {
  private genAI: GoogleGenerativeAI | null = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  // Document Upload & Processing
  async uploadDocument(data: DocumentUploadData): Promise<Document> {
    try {
      // 1. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      const storageUrl = await this.uploadToStorage(data.buffer, data.originalFileName)
      
      // 2. Generate thumbnail if needed
      const thumbnailUrl = await this.generateThumbnail(data.buffer, data.mimeType)
      
      // 3. Extract text content
      const extractedText = await this.extractTextContent(data.buffer, data.mimeType)
      
      // 4. AI Analysis
      const analysis = await this.analyzeDocument(extractedText, data.originalFileName)
      
      // 5. Create document record
      const document: Document = {
        id: this.generateId(),
        userId: data.userId,
        name: data.name,
        originalFileName: data.originalFileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        storageUrl,
        thumbnailUrl,
        category: analysis.category,
        subCategory: analysis.extractedInfo.diagnoses?.[0],
        doctorName: analysis.extractedInfo.doctorName,
        hospitalName: analysis.extractedInfo.hospitalName,
        visitDate: analysis.extractedInfo.visitDate,
        summary: analysis.summary,
        extractedText,
        aiAnalysis: analysis.extractedInfo,
        tags: analysis.tags,
        isEncrypted: false,
        isShared: false,
        isFavorite: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // 6. Save to database (would use Prisma in real implementation)
      await this.saveDocumentToDatabase(document)
      
      // 7. Create activity log
      await this.logActivity(data.userId, 'DOCUMENT_UPLOADED', document.id)
      
      return document
      
    } catch (error) {
      console.error('Document upload failed:', error)
      throw new Error('Failed to upload document')
    }
  }

  // AI Document Analysis
  async analyzeDocument(text: string, fileName: string): Promise<DocumentAnalysis> {
    if (!this.genAI) {
      return this.fallbackAnalysis(fileName)
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      
      const prompt = `
      Analyze this medical document and provide a comprehensive JSON response:
      
      {
        "category": "one of: PRESCRIPTION, LAB_REPORT, TEST_REPORT, MEDICAL_BILL, INSURANCE_DOCUMENT, VACCINATION_RECORD, MEDICAL_IMAGE, DISCHARGE_SUMMARY, CONSULTATION_NOTE, REFERRAL, OTHER",
        "summary": "detailed 2-3 sentence summary of the document",
        "tags": ["array", "of", "relevant", "medical", "tags"],
        "extractedInfo": {
          "doctorName": "doctor name if found",
          "hospitalName": "hospital/clinic name if found",
          "visitDate": "visit date in ISO format if found",
          "medicalValues": [{"name": "test name", "value": "result", "unit": "unit", "range": "normal range"}],
          "medications": ["list of medications mentioned"],
          "diagnoses": ["list of diagnoses or conditions mentioned"]
        }
      }
      
      Document: ${fileName}
      Content: ${text.substring(0, 6000)}
      
      Focus on extracting:
      - Specific medical values and test results
      - Medication names, dosages, and frequencies
      - Doctor and hospital information
      - Dates and appointment information
      - Diagnoses and medical conditions
      - Treatment recommendations
      
      Respond with ONLY the JSON object.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      
      const analysis = JSON.parse(jsonMatch[0])
      
      return {
        category: analysis.category as DocumentCategory,
        summary: analysis.summary,
        tags: analysis.tags,
        extractedInfo: analysis.extractedInfo
      }
      
    } catch (error) {
      console.error('AI analysis failed:', error)
      return this.fallbackAnalysis(fileName)
    }
  }

  // Text Extraction
  async extractTextContent(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractPdfText(buffer)
      } else if (mimeType.startsWith('image/')) {
        return await this.extractImageText(buffer)
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.extractWordText(buffer)
      } else if (mimeType.startsWith('text/')) {
        return buffer.toString('utf-8')
      }
      
      return `File content (${mimeType}): Content extraction not supported for this file type.`
    } catch (error) {
      console.error('Text extraction failed:', error)
      return 'Content extraction failed'
    }
  }

  // PDF Text Extraction using AI
  async extractPdfText(buffer: Buffer): Promise<string> {
    if (!this.genAI) {
      return 'PDF text extraction requires AI service'
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const base64Data = buffer.toString('base64')
      
      const result = await model.generateContent([
        'Extract all text content from this PDF document. Provide a comprehensive transcription including all visible text, maintaining structure and formatting where possible.',
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf'
          }
        }
      ])
      
      const response = await result.response
      return response.text()
      
    } catch (error) {
      console.error('PDF text extraction failed:', error)
      return 'PDF text extraction failed'
    }
  }

  // Image Text Extraction (OCR)
  async extractImageText(buffer: Buffer): Promise<string> {
    if (!this.genAI) {
      return 'Image text extraction requires AI service'
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const base64Data = buffer.toString('base64')
      
      const result = await model.generateContent([
        'Extract all text content from this medical image/document. Transcribe everything visible including forms, handwritten notes, printed text, and any medical information.',
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg' // Will be determined dynamically
          }
        }
      ])
      
      const response = await result.response
      return response.text()
      
    } catch (error) {
      console.error('Image text extraction failed:', error)
      return 'Image text extraction failed'
    }
  }

  // Word Document Text Extraction
  async extractWordText(buffer: Buffer): Promise<string> {
    try {
      // Would use mammoth.js for Word document extraction
      return 'Word document text extraction would be implemented here'
    } catch (error) {
      console.error('Word text extraction failed:', error)
      return 'Word document text extraction failed'
    }
  }

  // Document Search
  async searchDocuments(userId: string, query: string, filters?: any): Promise<Document[]> {
    try {
      // Implement semantic search with AI
      if (this.genAI) {
        return await this.semanticSearch(userId, query, filters)
      } else {
        return await this.keywordSearch(userId, query, filters)
      }
    } catch (error) {
      console.error('Document search failed:', error)
      return []
    }
  }

  // Semantic Search with AI
  async semanticSearch(userId: string, query: string, filters?: any): Promise<Document[]> {
    // Implementation would use vector embeddings and semantic matching
    return []
  }

  // Keyword Search
  async keywordSearch(userId: string, query: string, filters?: any): Promise<Document[]> {
    // Implementation would search through document text and metadata
    return []
  }

  // Utility Methods
  private async uploadToStorage(buffer: Buffer, fileName: string): Promise<string> {
    // Implementation would upload to AWS S3, Cloudinary, or similar
    return `https://storage.example.com/${fileName}`
  }

  private async generateThumbnail(buffer: Buffer, mimeType: string): Promise<string | undefined> {
    // Implementation would generate thumbnails for images and PDFs
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      return `https://storage.example.com/thumbnails/${this.generateId()}.jpg`
    }
    return undefined
  }

  private async saveDocumentToDatabase(document: Document): Promise<void> {
    // Implementation would use Prisma to save to database
    console.log('Saving document to database:', document.name)
  }

  private async logActivity(userId: string, action: string, documentId?: string): Promise<void> {
    // Implementation would log user activities
    console.log(`Activity logged: ${action} by user ${userId}`)
  }

  private fallbackAnalysis(fileName: string): DocumentAnalysis {
    const filenameLower = fileName.toLowerCase()
    
    if (filenameLower.includes('prescription') || filenameLower.includes('rx')) {
      return {
        category: DocumentCategory.PRESCRIPTION,
        summary: `Prescription document: ${fileName}`,
        tags: ['prescription', 'medication', 'pharmacy'],
        extractedInfo: {}
      }
    } else if (filenameLower.includes('lab') || filenameLower.includes('blood')) {
      return {
        category: DocumentCategory.LAB_REPORT,
        summary: `Laboratory test report: ${fileName}`,
        tags: ['lab', 'test', 'results'],
        extractedInfo: {}
      }
    } else if (filenameLower.includes('bill') || filenameLower.includes('invoice')) {
      return {
        category: DocumentCategory.MEDICAL_BILL,
        summary: `Medical billing document: ${fileName}`,
        tags: ['billing', 'payment', 'insurance'],
        extractedInfo: {}
      }
    }
    
    return {
      category: DocumentCategory.OTHER,
      summary: `Medical document: ${fileName}`,
      tags: ['medical', 'document'],
      extractedInfo: {}
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
} 