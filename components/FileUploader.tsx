'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, Scan, Eye, Brain } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getApiKey } from '@/lib/api-key'
import { OCRService } from '@/lib/ocr-service'

interface FileUploaderProps {
  onUploadSuccess?: () => void
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [ocrResults, setOcrResults] = useState<any[]>([])
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    setOcrResults([])
    
    try {
      for (const file of acceptedFiles) {
        const isImageFile = file.type.startsWith('image/')
        
        // Stage 1: OCR Processing (for images)
        if (isImageFile) {
          setProcessingStage('🔍 Extracting text from image...')
          
          try {
            // Try OCR first
            const ocrResult = await OCRService.extractText(file)
            
            console.log(`[OCR] Extracted ${ocrResult.text.length} characters with ${(ocrResult.confidence * 100).toFixed(1)}% confidence`)
            
            setOcrResults(prev => [...prev, {
              fileName: file.name,
              result: ocrResult
            }])
            
            // Show OCR results to user
            if (ocrResult.text.trim()) {
              toast({
                title: "Text Extracted",
                description: `Found ${ocrResult.text.length} characters in ${file.name} (${(ocrResult.confidence * 100).toFixed(1)}% confidence)`,
              })
            } else {
              toast({
                title: "No Text Found",
                description: `No readable text detected in ${file.name}. Continuing with image upload.`,
                variant: "destructive",
              })
            }
          } catch (ocrError) {
            console.error('[OCR] Failed:', ocrError)
            toast({
              title: "OCR Failed",
              description: `Could not extract text from ${file.name}. Uploading as image.`,
              variant: "destructive",
            })
          }
        }
        
        // Stage 2: Document Upload & AI Processing
        setProcessingStage('🧠 AI analyzing document content...')
        
        const formData = new FormData()
        formData.append('file', file)

        const apiKey = getApiKey()
        const headers = new Headers()
        if (apiKey) {
          headers.append('X-Gemini-Api-Key', apiKey)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed')
        }

        // Save uploaded document to localStorage for Vercel persistence
        if (result.document) {
          try {
            const stored = localStorage.getItem('medivault-documents')
            const existingDocs = stored ? JSON.parse(stored) : []
            
            // Add new document (avoid duplicates by ID)
            if (!existingDocs.find((doc: any) => doc.id === result.document.id)) {
              existingDocs.push(result.document)
              localStorage.setItem('medivault-documents', JSON.stringify(existingDocs))
              console.log('[FileUploader] Document saved to localStorage:', result.document.name)
            }
          } catch (error) {
            console.error('Error saving to localStorage:', error)
          }
        }
        
        toast({
          title: "Document uploaded",
          description: `${file.name} has been processed successfully.`,
        })
      }
      
      // Call the callback to refresh documents or reload page
      if (onUploadSuccess) {
        onUploadSuccess()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your document.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStage('')
      // Cleanup OCR worker
      await OCRService.cleanup()
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
            <div className="flex items-center justify-center mb-4">
              {processingStage.includes('🔍') ? (
                <Scan className="h-12 w-12 text-purple-600 animate-pulse mr-2" />
              ) : processingStage.includes('🧠') ? (
                <Brain className="h-12 w-12 text-blue-600 animate-pulse mr-2" />
              ) : (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mr-2" />
              )}
            </div>
            <p className="text-lg font-medium text-gray-700">Processing documents...</p>
            {processingStage && (
              <p className="text-sm text-blue-600 mt-2 font-medium">
                {processingStage}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Using OCR + AI to extract and categorize information. This may take a moment.
            </p>
            
            {/* Show OCR Results Preview */}
            {ocrResults.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Eye className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Text Extracted:</span>
                </div>
                {ocrResults.map((result, index) => (
                  <div key={index} className="text-xs text-purple-700 mb-1">
                    <strong>{result.fileName}:</strong> {result.result.text.substring(0, 100)}
                    {result.result.text.length > 100 ? '...' : ''}
                    <span className="text-purple-500 ml-2">
                      ({(result.result.confidence * 100).toFixed(1)}% confidence)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-700">Drop your files here</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400 mr-2" />
              <Scan className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              Drag & drop medical documents here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select files (PDF, PNG, JPG, TXT)
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>PDF/Text</span>
              </div>
              <div className="flex items-center">
                <Scan className="h-4 w-4 mr-1" />
                <span>OCR Images</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                <span>AI Analysis</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 