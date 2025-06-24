// Document storage - Vercel Postgres + localStorage fallback
import { sql } from '@vercel/postgres'

interface StoredDocument {
  id: string
  name: string
  type: 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other'
  date: Date
  doctor?: string
  hospital?: string
  summary?: string
  tags: string[]
  content?: string
  url?: string
}

// In-memory cache (will reset on each serverless function cold start)
let documentsCache: StoredDocument[] = []

// Initialize with some demo data
const demoDocuments: StoredDocument[] = [
  {
    id: '1',
    name: 'Blood Test Results - March 2024',
    type: 'lab_report',
    date: new Date('2024-03-15'),
    doctor: 'Dr. Sarah Johnson',
    hospital: 'City Medical Center',
    summary: 'Complete blood count showing normal ranges for all parameters. Cholesterol levels slightly elevated.',
    tags: ['blood test', 'cholesterol', 'CBC', 'healthy']
  },
  {
    id: '2',
    name: 'Prescription - Hypertension',
    type: 'prescription',
    date: new Date('2024-02-28'),
    doctor: 'Dr. Michael Chen',
    hospital: 'Heart Care Clinic',
    summary: 'Prescription for blood pressure medication. Dosage: 10mg daily.',
    tags: ['hypertension', 'blood pressure', 'amlodipine']
  },
  {
    id: '3',
    name: 'Hospital Bill - Emergency Visit',
    type: 'bill',
    date: new Date('2024-01-10'),
    hospital: 'Emergency Care Hospital',
    summary: 'Emergency room visit for acute chest pain. Total amount: $1,250',
    tags: ['emergency', 'chest pain', 'billing']
  }
]

// Simple persistent storage using environment variable simulation
// In a real production app, you'd use a database like Supabase, PlanetScale, or MongoDB
let persistentStorage: StoredDocument[] = []

export async function getDocuments(userId?: string): Promise<StoredDocument[]> {
  console.log('[Storage] Getting documents...')
  
  // Try to get from Vercel Postgres first
  try {
    await initializeDatabase()
    const result = await sql`
      SELECT id, name, type, date, doctor, hospital, summary, tags, content 
      FROM documents 
      ORDER BY date DESC
    `
    
    const dbDocuments = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other',
      date: new Date(row.date),
      doctor: row.doctor || undefined,
      hospital: row.hospital || undefined,
      summary: row.summary || undefined,
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
      content: row.content || undefined
    }))
    
    console.log(`[Storage] Returning ${dbDocuments.length} documents from Vercel Postgres`)
    return [...dbDocuments, ...demoDocuments] // Include demo data for now
  } catch (dbError) {
    console.warn('[Storage] Database error, falling back to demo data:', dbError)
  }
  
  // Fallback to demo documents
  const allDocuments = [...demoDocuments, ...persistentStorage]
  console.log(`[Storage] Returning ${allDocuments.length} documents`)
  return allDocuments
}

function mapDocumentType(dbType: string): 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other' {
  switch (dbType) {
    case 'PRESCRIPTION': return 'prescription'
    case 'LAB_RESULT': return 'lab_report'
    case 'MEDICAL_BILL': return 'bill'
    case 'IMAGING_REPORT': return 'test_report'
    default: return 'other'
  }
}

// Initialize database table if it doesn't exist
async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        doctor TEXT,
        hospital TEXT,
        summary TEXT,
        tags TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('[Storage] Database table initialized')
  } catch (error) {
    console.error('[Storage] Database initialization error:', error)
    throw error
  }
}

export async function saveDocument(doc: Omit<StoredDocument, 'id'> & { originalFile?: File }) {
  console.log('[Storage] Saving document:', doc.name)
  
  const newDoc: StoredDocument = {
    ...doc,
    id: generateId(),
    date: doc.date || new Date()
  }
  
  // Remove the file object before storing
  const { originalFile, ...docToStore } = doc as any
  
  // Try to save to Vercel Postgres first
  try {
    await initializeDatabase()
    await sql`
      INSERT INTO documents (id, name, type, date, doctor, hospital, summary, tags, content)
      VALUES (${newDoc.id}, ${newDoc.name}, ${newDoc.type}, ${newDoc.date.toISOString()}, 
              ${newDoc.doctor || null}, ${newDoc.hospital || null}, ${newDoc.summary || null}, 
              ${JSON.stringify(newDoc.tags)}, ${newDoc.content || null})
    `
    console.log('[Storage] Document saved to Vercel Postgres successfully')
  } catch (dbError) {
    console.warn('[Storage] Database save failed, using local storage:', dbError)
    // Fallback to persistent storage
    persistentStorage.push(newDoc)
  }
  
  // Also add to cache for immediate access
  documentsCache.push(newDoc)
  
  console.log('[Storage] Document saved successfully')
  
  return newDoc
}

export async function searchDocumentsByContent(query: string): Promise<StoredDocument[]> {
  const documents = await getDocuments()
  
  // Also load documents from localStorage (client-side uploaded docs)
  let clientDocs: StoredDocument[] = []
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('medivault-documents')
      if (stored) {
        const parsed = JSON.parse(stored)
        clientDocs = parsed.map((doc: any) => ({
          ...doc,
          date: new Date(doc.date)
        }))
      }
    } catch (error) {
      console.error('Error loading client documents for search:', error)
    }
  }
  
  // Combine all documents
  const allDocuments = [...documents, ...clientDocs]
  
  // If no query, return all documents
  if (!query.trim()) {
    return allDocuments
  }
  
  const queryLower = query.toLowerCase()
  
  return allDocuments.filter(doc => {
    const searchableText = [
      doc.name,
      doc.summary,
      doc.doctor,
      doc.hospital,
      ...doc.tags,
      doc.content
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchableText.includes(queryLower)
  })
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
} 