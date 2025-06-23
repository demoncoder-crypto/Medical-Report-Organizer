'use client'

import { FileText, Download, Share2, Calendar, User, Building, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface DocumentViewerProps {
  document: {
    id: string
    name: string
    type: string
    date: Date
    doctor?: string
    hospital?: string
    summary?: string
    tags: string[]
    content?: string
    url?: string
  }
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading:', document.name)
  }

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing:', document.name)
  }

  return (
    <div className="space-y-4">
      {/* Document header */}
      <div className="border-b pb-4">
        <h3 className="font-semibold text-lg mb-2">{document.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {document.type.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-500">
            {format(document.date, 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Document metadata */}
      <div className="space-y-3">
        {document.doctor && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">{document.doctor}</span>
          </div>
        )}
        {document.hospital && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Hospital:</span>
            <span className="font-medium">{document.hospital}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{format(document.date, 'MMMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Summary */}
      {document.summary && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">AI Summary</h4>
          <p className="text-sm text-gray-700">{document.summary}</p>
        </div>
      )}

      {/* Tags */}
      {document.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Document preview */}
      {document.url && (
        <div className="mt-6">
          <h4 className="font-medium mb-2 text-sm">Preview</h4>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              Document preview would appear here
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 