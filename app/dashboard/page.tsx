'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploader } from '@/components/FileUploader'
import { DocumentList } from '@/components/DocumentList'
import { SearchBar } from '@/components/SearchBar'
import { DocumentViewer } from '@/components/DocumentViewer'
import { MedicalIntelligence } from '@/components/MedicalIntelligence'
import { DoctorDashboard } from '@/components/DoctorDashboard'
import { PatientDashboard } from '@/components/PatientDashboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  Calendar, 
  Settings, 
  Upload,
  Activity,
  TrendingUp,
  Database,
  Menu,
  Building2,
  HomeIcon,
  Folder,
  BarChart3,
  Bell,
  User,
  Key,
  X,
  Scan,
  Eye,
  Copy,
  Loader2
} from 'lucide-react'
import { SettingsDialog } from '@/components/SettingsDialog'
import { OCRService } from '@/lib/ocr-service'
import { useDropzone } from 'react-dropzone'
import { useToast } from '@/components/ui/use-toast'

export default function Dashboard() {
  const router = useRouter()
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('dashboard')
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentUploads: 0,
    todayUploads: 0,
    processingTime: 0,
    categories: {
      prescription: 0,
      lab_report: 0,
      bill: 0,
      test_report: 0,
      other: 0
    }
  })

  useEffect(() => {
    // Check if API key exists
    const apiKey = localStorage.getItem('gemini-api-key')
    setHasApiKey(!!apiKey)
    
    loadDocuments()
  }, [])

  // Update API key status when settings dialog closes
  useEffect(() => {
    if (!isSettingsOpen) {
      const apiKey = localStorage.getItem('gemini-api-key')
      setHasApiKey(!!apiKey)
    }
  }, [isSettingsOpen])

  const loadDocuments = async () => {
    try {
      console.log('[Dashboard] Loading documents...')
      
      const response = await fetch('/api/documents')
      
      if (response.ok) {
        const docs = await response.json()
        console.log('[Dashboard] Received docs from API:', docs)
        
        const docsArray = Array.isArray(docs) ? docs : (docs.documents && Array.isArray(docs.documents)) ? docs.documents : []
        
        // Load any client-side stored documents (for demo persistence)
        const clientDocs = loadClientDocuments()
        
        // Combine server docs with client docs (remove duplicates by ID)
        const allDocs = [...docsArray]
        clientDocs.forEach((clientDoc: any) => {
          if (!allDocs.find(doc => doc.id === clientDoc.id)) {
            allDocs.push(clientDoc)
          }
        })
        
        console.log('[Dashboard] Total documents after combining:', allDocs.length)
        setDocuments(allDocs)
        calculateStats(allDocs)
      } else {
        console.error('[Dashboard] Response not ok:', response.status, response.statusText)
        const clientDocs = loadClientDocuments()
        setDocuments(clientDocs)
        calculateStats(clientDocs)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      const clientDocs = loadClientDocuments()
      setDocuments(clientDocs)
      calculateStats(clientDocs)
    }
  }

  const loadClientDocuments = () => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('medivault-documents')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((doc: any) => ({
          ...doc,
          date: new Date(doc.date)
        }))
      }
    } catch (error) {
      console.error('Error loading client documents:', error)
    }
    return []
  }

  const handleUploadSuccess = async () => {
    console.log('[Dashboard] Upload successful, refreshing documents...')
    setTimeout(async () => {
      await loadDocuments()
    }, 100)
  }

  const calculateStats = (docs: any[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const categories = {
      prescription: 0,
      lab_report: 0,
      bill: 0,
      test_report: 0,
      other: 0
    }

    let recentCount = 0
    let todayCount = 0
    
    docs.forEach((doc: any) => {
      if (categories.hasOwnProperty(doc.type)) {
        categories[doc.type as keyof typeof categories]++
      }
      
      const docDate = new Date(doc.date)
      if (docDate >= sevenDaysAgo) {
        recentCount++
      }
      if (docDate >= today) {
        todayCount++
      }
    })

    setStats(prev => ({
      ...prev,
      totalDocuments: docs.length,
      recentUploads: recentCount,
      todayUploads: todayCount,
      processingTime: Math.round(docs.length * 2.3),
      categories
    }))
  }

  // OCR functionality
  const onDropOCR = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
      
      setOcrResult(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropOCR,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  })

  const processOCR = async () => {
    if (!selectedFile) return

    setIsProcessingOCR(true)
    
    try {
      const result = await OCRService.extractText(selectedFile)
      setOcrResult(result)
      
      toast({
        title: "OCR Completed",
        description: `Extracted ${result.text.length} characters with ${(result.confidence * 100).toFixed(1)}% confidence`,
      })
    } catch (error) {
      console.error('[OCR] Error:', error)
      toast({
        title: "OCR Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      })
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const safeDocuments = Array.isArray(documents) ? documents : []
  const filteredDocuments = selectedCategory === 'all' 
    ? safeDocuments 
    : safeDocuments.filter((doc: any) => doc.type === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-blue-100 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                    MediVault Pro
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Full-Stack Medical Document System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Demo User</p>
                  <div className="flex items-center justify-end space-x-1">
                    <User className="h-4 w-4" />
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      PATIENT
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSettingsOpen(true)}
                className="relative flex items-center gap-2 px-3"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Key</span>
                {!hasApiKey && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-lg shadow-2xl border-r border-blue-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          mt-20 lg:mt-0
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            </div>
            
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {/* Main Section */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
                <Button
                  variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('dashboard')}
                >
                  <HomeIcon className="mr-3 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={activeSection === 'clinical' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('clinical')}
                >
                  <Activity className="mr-3 h-4 w-4" />
                  Clinical Dashboard
                </Button>
                <Button
                  variant={activeSection === 'patient' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('patient')}
                >
                  <User className="mr-3 h-4 w-4" />
                  Patient Dashboard
                </Button>
                <Button
                  variant={activeSection === 'upload' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('upload')}
                >
                  <Upload className="mr-3 h-4 w-4" />
                  Upload Documents
                </Button>
                <Button
                  variant={activeSection === 'intelligence' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('intelligence')}
                >
                  <Activity className="mr-3 h-4 w-4" />
                  Medical Intelligence
                </Button>
                <Button
                  variant={activeSection === 'ocr' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('ocr')}
                >
                  <Scan className="mr-3 h-4 w-4" />
                  OCR Testing
                </Button>
                <Button onClick={() => console.log('DOCUMENTS STATE:', documents)}>Log Docs</Button>
              </div>

              {/* Documents Section */}
              <div className="space-y-1 pt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</h3>
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  <Folder className="mr-3 h-4 w-4" />
                  All Documents
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.totalDocuments}
                  </span>
                </Button>
                <Button
                  variant={selectedCategory === 'prescription' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('prescription')}
                >
                  <FileText className="mr-3 h-4 w-4" />
                  Prescriptions
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.categories.prescription}
                  </span>
                </Button>
                <Button
                  variant={selectedCategory === 'lab_report' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('lab_report')}
                >
                  <Activity className="mr-3 h-4 w-4" />
                  Lab Reports
                  <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.categories.lab_report}
                  </span>
                </Button>
              </div>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Dashboard/Overview */}
            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Welcome to MediVault Pro!
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Your comprehensive medical document management system.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
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
                  </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Documents</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.totalDocuments}</p>
                        <p className="text-xs text-blue-600 mt-1">All time records</p>
                      </div>
                      <div className="p-3 bg-blue-500 rounded-full">
                        <Database className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Recent Uploads</p>
                        <p className="text-3xl font-bold text-green-900">{stats.recentUploads}</p>
                        <p className="text-xs text-green-600 mt-1">This week</p>
                      </div>
                      <div className="p-3 bg-green-500 rounded-full">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">AI Processing</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.processingTime}s</p>
                        <p className="text-xs text-purple-600 mt-1">Average time</p>
                      </div>
                      <div className="p-3 bg-purple-500 rounded-full">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Search Bar */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                  <SearchBar 
                    documents={safeDocuments}
                    onResultSelect={(doc) => setSelectedDocument(doc)}
                  />
                </Card>

                {/* Document List */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedCategory === 'all' ? 'All Documents' : `${selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Documents`}
                    </h3>
                  </div>
                  <DocumentList 
                    documents={filteredDocuments} 
                    viewMode={viewMode}
                    onSelectDocument={(doc) => setSelectedDocument(doc)}
                  />
                </Card>
              </div>
            )}

            {/* Clinical Dashboard */}
            {activeSection === 'clinical' && (
              <div>
                <DoctorDashboard documents={safeDocuments} />
              </div>
            )}

            {/* Patient Dashboard */}
            {activeSection === 'patient' && (
              <div>
                <PatientDashboard documents={safeDocuments} />
              </div>
            )}

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Upload Medical Documents</h2>
                  <p className="text-gray-600 mt-1">
                    Upload your medical documents for AI-powered analysis and organization.
                  </p>
                </div>

                <Card className="p-8 bg-white/80 backdrop-blur-sm border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Document Upload</h3>
                      <p className="text-gray-600">Drag and drop files or click to browse</p>
                    </div>
                  </div>
                  <FileUploader onUploadSuccess={handleUploadSuccess} />
                </Card>

                {/* Recent Uploads */}
                {filteredDocuments.length > 0 && (
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Uploads</h3>
                    <DocumentList 
                      documents={filteredDocuments.slice(0, 5)} 
                      viewMode="grid"
                      onSelectDocument={(doc) => setSelectedDocument(doc)}
                    />
                  </Card>
                )}
              </div>
            )}

            {/* Medical Intelligence Section */}
            {activeSection === 'intelligence' && (
              <div className="space-y-8">
                <MedicalIntelligence documents={safeDocuments} />
              </div>
            )}

            {/* OCR Testing Section */}
            {activeSection === 'ocr' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">OCR Testing Lab</h2>
                  <p className="text-gray-600 mt-1">
                    Test OCR capabilities on medical documents and images using Tesseract.js
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload Section */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Image for OCR
                    </h3>
                    
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}
                      `}
                    >
                      <input {...getInputProps()} />
                      
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                          />
                          <p className="text-sm text-gray-600">
                            {selectedFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Scan className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="text-lg font-medium text-gray-700">
                            Drag & drop an image here
                          </p>
                          <p className="text-sm text-gray-500">
                            or click to select (PNG, JPG, etc.)
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <div className="mt-4">
                        <Button
                          onClick={processOCR}
                          disabled={isProcessingOCR}
                          className="w-full"
                        >
                          {isProcessingOCR ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing OCR...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4 mr-2" />
                              Extract Text
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Results Section */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      OCR Results
                    </h3>

                    {ocrResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="font-semibold text-green-600">
                              {(ocrResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Processing Time</p>
                            <p className="font-semibold">{ocrResult.processingTime}ms</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Method</p>
                            <p className="font-semibold capitalize">{ocrResult.method}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Characters</p>
                            <p className="font-semibold">{ocrResult.text.length}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(ocrResult.text)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Text
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Extracted Text:</h4>
                          <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">
                              {ocrResult.text || 'No text extracted'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Scan className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Upload an image to see OCR results</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Sample Medical Documents Info */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <h3 className="text-xl font-semibold mb-4 text-purple-900">Sample Medical Documents</h3>
                  <p className="text-purple-700 mb-4">
                    Try these sample medical document types to test OCR accuracy:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <strong className="text-purple-900">Prescriptions</strong>
                      <p className="text-purple-600">Medication names, dosages, instructions</p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <strong className="text-purple-900">Lab Results</strong>
                      <p className="text-purple-600">Blood tests, values, reference ranges</p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <strong className="text-purple-900">Medical Bills</strong>
                      <p className="text-purple-600">Charges, procedures, insurance info</p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <strong className="text-purple-900">Handwritten Notes</strong>
                      <p className="text-purple-600">Doctor notes, patient information</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Document Details</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedDocument(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <DocumentViewer document={selectedDocument} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 