'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, User, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface Document {
  id: string
  name: string
  type: 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other'
  date: Date
  doctor?: string
  hospital?: string
  summary?: string
  tags: string[]
}

interface DocumentListProps {
  viewMode: 'grid' | 'timeline'
  onSelectDocument: (doc: Document) => void
  documents?: Document[]
}

export function DocumentList({ viewMode, onSelectDocument, documents: propDocuments }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (propDocuments && Array.isArray(propDocuments)) {
      setDocuments(propDocuments)
      setIsLoading(false)
    } else {
      fetchDocuments()
    }
  }, [propDocuments])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      if (Array.isArray(data)) {
        setDocuments(data)
      } else if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents)
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: Document['type']) => {
    const colors = {
      prescription: 'bg-blue-100 text-blue-800',
      lab_report: 'bg-green-100 text-green-800',
      bill: 'bg-yellow-100 text-yellow-800',
      test_report: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  const getTypeIcon = (type: Document['type']) => {
    const icons = {
      prescription: '💊',
      lab_report: '🔬',
      bill: '💰',
      test_report: '📋',
      other: '📄'
    }
    return icons[type] || icons.other
  }

  // Ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : []
  
  // Only apply internal filtering if no external filtering is being done
  const displayDocuments = propDocuments 
    ? safeDocuments // Use documents as-is if passed from parent (already filtered)
    : selectedCategory === 'all' 
      ? safeDocuments 
      : safeDocuments.filter(doc => doc.type === selectedCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (displayDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No documents found</p>
        <p className="text-sm text-gray-400 mt-1">Upload some medical documents to get started</p>
      </div>
    )
  }

  if (viewMode === 'timeline') {
    return (
      <div className="space-y-8">
        {/* Filter buttons - only show if not using external filtering */}
        {!propDocuments && (
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'prescription', 'lab_report', 'bill', 'test_report'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCategory(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Timeline view */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          {displayDocuments.map((doc, index) => (
            <div key={doc.id} className="relative flex items-start mb-8">
              <div className="absolute left-4 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2"></div>
              <div className="ml-12 flex-1">
                <div 
                  className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectDocument(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                        <h3 className="font-medium">{doc.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(doc.type)}`}>
                          {doc.type.replace('_', ' ')}
                        </span>
                      </div>
                      {doc.summary && (
                        <p className="text-sm text-gray-600 mb-2">{doc.summary}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(doc.date), 'MMM dd, yyyy')}
                        </span>
                        {doc.doctor && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.doctor}
                          </span>
                        )}
                        {doc.hospital && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {doc.hospital}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div>
      {/* Filter buttons - only show if not using external filtering */}
      {!propDocuments && (
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'prescription', 'lab_report', 'bill', 'test_report'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedCategory(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayDocuments.map((doc) => (
          <Card 
            key={doc.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectDocument(doc)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                  <div>
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <CardDescription>{format(new Date(doc.date), 'MMM dd, yyyy')}</CardDescription>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(doc.type)}`}>
                  {doc.type.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {doc.summary && (
                <p className="text-sm text-gray-600 mb-3">{doc.summary}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {doc.doctor && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {doc.doctor}
                  </span>
                )}
                {doc.hospital && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {doc.hospital}
                  </span>
                )}
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 