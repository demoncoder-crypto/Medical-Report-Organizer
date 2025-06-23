// Simple in-memory and localStorage based storage for demo
// In production, use a proper database like Supabase

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

// In-memory cache
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

export async function getDocuments(): Promise<StoredDocument[]> {
  // For server-side, just return the cache or demo data
  if (documentsCache.length === 0) {
    documentsCache = demoDocuments
  }
  
  return documentsCache
}

export async function saveDocument(doc: Omit<StoredDocument, 'id'> & { originalFile?: File }) {
  const newDoc: StoredDocument = {
    ...doc,
    id: generateId(),
    date: doc.date || new Date()
  }
  
  // Remove the file object before storing
  const { originalFile, ...docToStore } = doc as any
  
  documentsCache.push(newDoc)
  
  return newDoc
}

export async function searchDocumentsByContent(query: string): Promise<StoredDocument[]> {
  const documents = await getDocuments()
  const queryLower = query.toLowerCase()
  
  return documents.filter(doc => {
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

// Removed localStorage operations - these should be handled client-side

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
} 