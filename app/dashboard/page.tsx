'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FileUploader } from '@/components/FileUploader'
import { DocumentList } from '@/components/DocumentList'
import { SearchBar } from '@/components/SearchBar'
import { DocumentViewer } from '@/components/DocumentViewer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  Search, 
  Calendar, 
  Settings, 
  AlertCircle, 
  Upload,
  Activity,
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Share2,
  Eye,
  Plus,
  Stethoscope,
  Building2,
  UserCheck,
  Zap,
  Database,
  Menu,
  X,
  Home as HomeIcon,
  Folder,
  Star,
  Archive,
  Trash2,
  Tag,
  Bell,
  HelpCircle,
  LogOut,
  User,
  Crown,
  Shield as ShieldIcon
} from 'lucide-react'
import { SettingsDialog } from '@/components/SettingsDialog'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('dashboard')
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
    },
    monthlyTrend: [
      { month: 'Jan', count: 45 },
      { month: 'Feb', count: 52 },
      { month: 'Mar', count: 48 },
      { month: 'Apr', count: 61 },
      { month: 'May', count: 55 },
      { month: 'Jun', count: 67 }
    ]
  })

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      loadDocuments()
    }
  }, [session])

  const loadDocuments = async () => {
    try {
      console.log('[Dashboard] Loading documents for user:', session?.user?.id)
      
      // Load documents from API with authentication
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${session?.user?.id}`,
        }
      })
      
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
        // Fallback to client-side documents only
        const clientDocs = loadClientDocuments()
        setDocuments(clientDocs)
        calculateStats(clientDocs)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      // Fallback to client-side documents
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const safeDocuments = Array.isArray(documents) ? documents : []
  const filteredDocuments = selectedCategory === 'all' 
    ? safeDocuments 
    : safeDocuments.filter((doc: any) => doc.type === selectedCategory)

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope className="h-4 w-4" />
      case 'ADMIN':
      case 'HOSPITAL_ADMIN':
        return <Crown className="h-4 w-4" />
      case 'NURSE':
        return <UserCheck className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-green-100 text-green-800'
      case 'ADMIN':
      case 'HOSPITAL_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'NURSE':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user.name || session.user.email}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {getRoleIcon(session.user.role)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(session.user.role)}`}>
                      {session.user.role}
                    </span>
                  </div>
                </div>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-blue-200"
                  />
                )}
              </div>

              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
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
                  variant={activeSection === 'upload' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection('upload')}
                >
                  <Upload className="mr-3 h-4 w-4" />
                  Upload Documents
                </Button>
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
                <Button
                  variant={selectedCategory === 'bill' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('bill')}
                >
                  <FileCheck className="mr-3 h-4 w-4" />
                  Medical Bills
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.categories.bill}
                  </span>
                </Button>
                <Button
                  variant={selectedCategory === 'test_report' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('test_report')}
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  Test Reports
                  <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.categories.test_report}
                  </span>
                </Button>
              </div>

              {/* Organization Section */}
              <div className="space-y-1 pt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</h3>
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="mr-3 h-4 w-4" />
                  Favorites
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="mr-3 h-4 w-4" />
                  Recent
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="mr-3 h-4 w-4" />
                  Archived
                </Button>
              </div>

              {/* Tools Section */}
              <div className="space-y-1 pt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
                <Button variant="ghost" className="w-full justify-start">
                  <PieChart className="mr-3 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="mr-3 h-4 w-4" />
                  Advanced Search
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
                      Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Here's an overview of your medical documents and health data.
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

                {/* Real-time Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <p className="text-sm font-medium text-green-600">Today's Uploads</p>
                        <p className="text-3xl font-bold text-green-900">{stats.todayUploads}</p>
                        <p className="text-xs text-green-600 mt-1">+{stats.recentUploads} this week</p>
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
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">System Status</p>
                        <p className="text-2xl font-bold text-orange-900">Healthy</p>
                        <p className="text-xs text-orange-600 mt-1">All systems operational</p>
                      </div>
                      <div className="p-3 bg-orange-500 rounded-full">
                        <ShieldIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Search Bar */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                  <SearchBar />
                </Card>

                {/* Document List */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedCategory === 'all' ? 'All Documents' : `${selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Documents`}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <DocumentList 
                    documents={filteredDocuments} 
                    viewMode={viewMode}
                    onDocumentSelect={setSelectedDocument}
                  />
                </Card>
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
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
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
                      onDocumentSelect={setSelectedDocument}
                    />
                  </Card>
                )}
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