'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function FileUploader() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed')
        }
        
        toast({
          title: "Document uploaded",
          description: `${file.name} has been processed successfully.`,
        })
      }
      
      // Refresh the page to show new documents
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your document.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={isProcessing} />
      
      <div className="flex flex-col items-center">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Processing documents...</p>
            <p className="text-sm text-gray-500 mt-2">
              Using AI to extract and categorize information. This may take a moment.
            </p>
          </>
        ) : isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-700">Drop your files here</p>
          </>
        ) : (
          <>
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Drag & drop medical documents here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select files (PDF, PNG, JPG, TXT)
            </p>
          </>
        )}
      </div>
    </div>
  )
} 