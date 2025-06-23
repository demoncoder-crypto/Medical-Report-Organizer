'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/FileUploader'
import { DocumentList } from '@/components/DocumentList'
import { SearchBar } from '@/components/SearchBar'
import { DocumentViewer } from '@/components/DocumentViewer'
import { Button } from '@/components/ui/button'
import { FileText, Search, Calendar, Settings } from 'lucide-react'

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Medical Report Organizer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Upload Medical Documents
            </h2>
            <FileUploader />
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Search Your Medical History
            </h2>
            <SearchBar />
          </div>
        </div>

        {/* Documents Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
              <DocumentList 
                viewMode={viewMode} 
                onSelectDocument={setSelectedDocument}
              />
            </div>
          </div>
          
          {/* Document Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
              {selectedDocument ? (
                <DocumentViewer document={selectedDocument} />
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a document to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 