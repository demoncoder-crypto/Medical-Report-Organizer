import { GoogleGenerativeAI } from '@google/generative-ai'

// Types for medical RAG system
interface MedicalDocument {
  id: string
  name: string
  type: string
  date: Date
  content: string
  summary: string
  doctor?: string
  hospital?: string
  tags: string[]
  embedding?: number[]
  chunks?: DocumentChunk[]
}

interface DocumentChunk {
  id: string
  content: string
  embedding: number[]
  metadata: {
    documentId: string
    chunkIndex: number
    type: 'medication' | 'diagnosis' | 'lab_result' | 'vital_signs' | 'procedure' | 'general'
  }
}

interface MedicalTimeline {
  date: Date
  event: string
  type: 'medication' | 'diagnosis' | 'lab_result' | 'vital_signs' | 'procedure' | 'visit'
  value?: string
  doctor?: string
  hospital?: string
  documentId: string
}

interface ClinicalInsight {
  query: string
  answer: string
  relevantDocuments: string[]
  confidence: number
  medicalContext: string[]
  timeline?: MedicalTimeline[]
}

class MedicalRAGSystem {
  private genAI: GoogleGenerativeAI
  private documents: MedicalDocument[] = []
  private embeddings: Map<string, number[]> = new Map()

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  // Generate embeddings using Gemini
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' })
      const result = await model.embedContent(text)
      return result.embedding.values || []
    } catch (error) {
      // Fallback: create simple hash-based embedding
      return this.createSimpleEmbedding(text)
    }
  }

  // Fallback embedding method
  private createSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(384).fill(0)
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word)
      embedding[hash % 384] += 1
    })
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Chunk document into meaningful medical sections
  async chunkDocument(doc: MedicalDocument): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = []
    const content = doc.content || doc.summary || ''
    
    // Split by medical sections
    const sections = this.identifyMedicalSections(content)
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const embedding = await this.generateEmbedding(section.content)
      
      chunks.push({
        id: `${doc.id}_chunk_${i}`,
        content: section.content,
        embedding,
        metadata: {
          documentId: doc.id,
          chunkIndex: i,
          type: section.type
        }
      })
    }
    
    return chunks
  }

  // Identify medical sections in document
  private identifyMedicalSections(content: string): Array<{content: string, type: DocumentChunk['metadata']['type']}> {
    const sections = []
    const lines = content.split('\n').filter(line => line.trim())
    
    let currentSection = ''
    let currentType: DocumentChunk['metadata']['type'] = 'general'
    
    for (const line of lines) {
      const lineType = this.classifyMedicalLine(line)
      
      if (lineType !== currentType && currentSection.trim()) {
        sections.push({ content: currentSection.trim(), type: currentType })
        currentSection = ''
      }
      
      currentType = lineType
      currentSection += line + '\n'
    }
    
    if (currentSection.trim()) {
      sections.push({ content: currentSection.trim(), type: currentType })
    }
    
    return sections
  }

  // Classify medical content type
  private classifyMedicalLine(line: string): DocumentChunk['metadata']['type'] {
    const lower = line.toLowerCase()
    
    if (lower.includes('medication') || lower.includes('prescription') || lower.includes('drug') || 
        lower.includes('tablet') || lower.includes('mg') || lower.includes('dosage')) {
      return 'medication'
    }
    if (lower.includes('diagnosis') || lower.includes('condition') || lower.includes('disease') ||
        lower.includes('syndrome') || lower.includes('disorder')) {
      return 'diagnosis'
    }
    if (lower.includes('blood') || lower.includes('urine') || lower.includes('test result') ||
        lower.includes('lab') || lower.includes('glucose') || lower.includes('cholesterol')) {
      return 'lab_result'
    }
    if (lower.includes('blood pressure') || lower.includes('heart rate') || lower.includes('temperature') ||
        lower.includes('weight') || lower.includes('height') || lower.includes('bp')) {
      return 'vital_signs'
    }
    if (lower.includes('surgery') || lower.includes('procedure') || lower.includes('operation') ||
        lower.includes('treatment') || lower.includes('therapy')) {
      return 'procedure'
    }
    
    return 'general'
  }

  // Add document to RAG system
  async addDocument(doc: MedicalDocument): Promise<void> {
    // Generate embedding for full document
    const fullText = `${doc.name} ${doc.summary} ${doc.content || ''}`
    doc.embedding = await this.generateEmbedding(fullText)
    
    // Create chunks
    doc.chunks = await this.chunkDocument(doc)
    
    this.documents.push(doc)
    this.embeddings.set(doc.id, doc.embedding)
  }

  // Semantic similarity search
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Find relevant documents using vector similarity
  async findRelevantDocuments(query: string, limit: number = 5): Promise<MedicalDocument[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: doc.embedding ? this.cosineSimilarity(queryEmbedding, doc.embedding) : 0
    }))
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.document)
  }

  // Generate medical timeline
  async generateMedicalTimeline(documents: MedicalDocument[]): Promise<MedicalTimeline[]> {
    const timeline: MedicalTimeline[] = []
    
    for (const doc of documents) {
      const events = await this.extractMedicalEvents(doc)
      timeline.push(...events)
    }
    
    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Extract medical events from document
  private async extractMedicalEvents(doc: MedicalDocument): Promise<MedicalTimeline[]> {
    const events: MedicalTimeline[] = []
    const content = doc.content || doc.summary || ''
    
    // Use AI to extract structured medical events
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `
        Extract medical events from this document. Return a JSON array of events with:
        - date (ISO string)
        - event (description)
        - type (medication|diagnosis|lab_result|vital_signs|procedure|visit)
        - value (if applicable, e.g., "120/80" for BP, "200 mg/dl" for glucose)
        
        Document: ${doc.name}
        Date: ${doc.date.toISOString()}
        Content: ${content}
        
        Return only the JSON array, no other text.
      `
      
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Extract JSON from markdown code blocks if present
      let jsonText = responseText
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      } else {
        const arrayMatch = responseText.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          jsonText = arrayMatch[0]
        }
      }
      
      const extractedEvents = JSON.parse(jsonText)
      
      extractedEvents.forEach((event: any) => {
        events.push({
          date: new Date(event.date || doc.date),
          event: event.event,
          type: event.type,
          value: event.value,
          doctor: doc.doctor,
          hospital: doc.hospital,
          documentId: doc.id
        })
      })
    } catch (error) {
      // Fallback: create basic event
      events.push({
        date: doc.date,
        event: doc.summary || `Document: ${doc.name}`,
        type: this.mapDocumentTypeToEventType(doc.type),
        doctor: doc.doctor,
        hospital: doc.hospital,
        documentId: doc.id
      })
    }
    
    return events
  }

  private mapDocumentTypeToEventType(docType: string): MedicalTimeline['type'] {
    switch (docType) {
      case 'prescription': return 'medication'
      case 'lab_report': return 'lab_result'
      case 'test_report': return 'lab_result'
      default: return 'visit'
    }
  }

  // Answer medical questions using RAG
  async answerMedicalQuery(query: string): Promise<ClinicalInsight> {
    // Find relevant documents
    const relevantDocs = await this.findRelevantDocuments(query, 5)
    
    if (relevantDocs.length === 0) {
      return {
        query,
        answer: "I don't have enough information in your medical records to answer this question.",
        relevantDocuments: [],
        confidence: 0,
        medicalContext: []
      }
    }
    
    // Generate timeline if query is temporal
    let timeline: MedicalTimeline[] | undefined
    if (this.isTemporalQuery(query)) {
      timeline = await this.generateMedicalTimeline(relevantDocs)
    }
    
    // Generate contextualized answer
    const answer = await this.generateContextualAnswer(query, relevantDocs, timeline)
    
    return {
      query,
      answer: answer.response,
      relevantDocuments: relevantDocs.map(doc => doc.id),
      confidence: answer.confidence,
      medicalContext: this.extractMedicalContext(relevantDocs),
      timeline
    }
  }

  private isTemporalQuery(query: string): boolean {
    const temporalKeywords = ['trend', 'over time', 'history', 'progression', 'change', 'improvement', 'worse']
    return temporalKeywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  private async generateContextualAnswer(
    query: string, 
    docs: MedicalDocument[], 
    timeline?: MedicalTimeline[]
  ): Promise<{response: string, confidence: number}> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      
      const context = docs.map(doc => 
        `Document: ${doc.name} (${doc.date.toDateString()})\n` +
        `Summary: ${doc.summary}\n` +
        `Doctor: ${doc.doctor || 'Unknown'}\n` +
        `Hospital: ${doc.hospital || 'Unknown'}\n---\n`
      ).join('\n')
      
      const timelineContext = timeline ? 
        `\nMedical Timeline:\n${timeline.map(event => 
          `${event.date.toDateString()}: ${event.event} ${event.value ? `(${event.value})` : ''}`
        ).join('\n')}\n` : ''
      
      const prompt = `
        You are a medical AI assistant analyzing a patient's medical records. 
        Answer this question based ONLY on the provided medical documents.
        
        Question: ${query}
        
        Medical Records:
        ${context}
        ${timelineContext}
        
        Provide a comprehensive answer that:
        1. Directly answers the question
        2. References specific documents and dates
        3. Highlights any concerning patterns or trends
        4. Suggests what information might be missing
        5. Uses medical terminology appropriately
        
        If you cannot answer based on the available records, say so clearly.
      `
      
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      
      // Simple confidence scoring based on document relevance
      const confidence = Math.min(0.9, docs.length * 0.2)
      
      return { response, confidence }
    } catch (error) {
      return {
        response: "I encountered an error while analyzing your medical records. Please try rephrasing your question.",
        confidence: 0
      }
    }
  }

  private extractMedicalContext(docs: MedicalDocument[]): string[] {
    const context: Set<string> = new Set()
    
    docs.forEach(doc => {
      doc.tags.forEach(tag => context.add(tag))
      if (doc.doctor) context.add(`Dr. ${doc.doctor}`)
      if (doc.hospital) context.add(doc.hospital)
    })
    
    return Array.from(context)
  }

  // Get all documents
  getDocuments(): MedicalDocument[] {
    return this.documents
  }

  // Clear all data
  clear(): void {
    this.documents = []
    this.embeddings.clear()
  }
}

export { MedicalRAGSystem, type MedicalDocument, type ClinicalInsight, type MedicalTimeline } 