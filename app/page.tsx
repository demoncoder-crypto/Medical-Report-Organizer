'use client'

import { useState, useEffect } from 'react'
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
  Key,
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
  HelpCircle
} from 'lucide-react'
import { SettingsDialog } from '@/components/SettingsDialog'

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'analytics'>('overview')
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

  useEffect(() => {
    // Check if API key exists
    const apiKey = localStorage.getItem('gemini-api-key')
    setHasApiKey(!!apiKey)
    
    // Load documents and analytics
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
      console.log('[Frontend] Loading documents...')
      const response = await fetch('/api/documents')
      if (response.ok) {
        const docs = await response.json()
        console.log('[Frontend] Received docs:', docs)
        // Ensure docs is always an array
        const docsArray = Array.isArray(docs) ? docs : (docs.documents && Array.isArray(docs.documents)) ? docs.documents : []
        console.log('[Frontend] Setting documents:', docsArray.length, 'documents')
        setDocuments(docsArray)
        calculateStats(docsArray)
      } else {
        console.error('[Frontend] Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      setDocuments([]) // Set empty array on error
    }
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
      processingTime: Math.round(docs.length * 2.3), // Mock processing time
      categories
    }))
  }

  // Ensure documents is always an array before filtering
  const safeDocuments = Array.isArray(documents) ? documents : []
  const filteredDocuments = selectedCategory === 'all' 
    ? safeDocuments 
    : safeDocuments.filter((doc: any) => doc.type === selectedCategory)

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, section: 'main' },
    { id: 'upload', label: 'Upload Documents', icon: Upload, section: 'main' },
    { id: 'all-documents', label: 'All Documents', icon: FileText, section: 'documents' },
    { id: 'prescriptions', label: 'Prescriptions', icon: Stethoscope, section: 'documents', category: 'prescription' },
    { id: 'lab-reports', label: 'Lab Reports', icon: Activity, section: 'documents', category: 'lab_report' },
    { id: 'bills', label: 'Medical Bills', icon: FileCheck, section: 'documents', category: 'bill' },
    { id: 'test-reports', label: 'Test Reports', icon: Shield, section: 'documents', category: 'test_report' },
    { id: 'favorites', label: 'Favorites', icon: Star, section: 'organization' },
    { id: 'recent', label: 'Recent', icon: Clock, section: 'organization' },
    { id: 'archived', label: 'Archived', icon: Archive, section: 'organization' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'tools' },
    { id: 'search', label: 'Advanced Search', icon: Search, section: 'tools' },
  ]

  const handleSidebarItemClick = (item: any) => {
    setActiveSection(item.id)
    if (item.category) {
      setSelectedCategory(item.category)
      setActiveTab('documents')
    } else if (item.id === 'dashboard') {
      setActiveTab('overview')
    } else if (item.id === 'analytics') {
      setActiveTab('analytics')
    } else if (item.id === 'all-documents') {
      setSelectedCategory('all')
      setActiveTab('documents')
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
                  <p className="text-sm text-gray-600 font-medium">Hospital Document Management System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="hidden sm:flex"
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className="hidden sm:flex"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSettingsOpen(true)}
                className="relative"
              >
                <Settings className="h-4 w-4" />
                {!hasApiKey && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-72 bg-white/95 backdrop-blur-lg shadow-xl border-r border-blue-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 mt-[88px]`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
              {/* Main Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'main').map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleSidebarItemClick(item)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Documents
                </h3>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'documents').map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleSidebarItemClick(item)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                      {item.category && stats.categories[item.category as keyof typeof stats.categories] > 0 && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          {stats.categories[item.category as keyof typeof stats.categories]}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Organization Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Organization
                </h3>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'organization').map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleSidebarItemClick(item)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tools Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tools
                </h3>
                <div className="space-y-1">
                  {sidebarItems.filter(item => item.section === 'tools').map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleSidebarItemClick(item)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} mt-[88px]`}>
          {/* API Key Banner */}
          {!hasApiKey && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-l-4 border-amber-400 mx-4 mt-4 rounded-r-xl shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full mr-4">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                      🔑 AI Processing Requires API Key
                    </h3>
                    <p className="text-sm text-amber-800 mt-1">
                      Configure your Google Gemini API key to unlock AI-powered document analysis, smart categorization, and advanced search capabilities.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                  size="sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Configure API
                </Button>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Dashboard/Overview */}
            {(activeSection === 'dashboard' || activeTab === 'overview') && (
              <div className="space-y-8">
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
                        <p className="text-xs text-purple-600 mt-1">Avg processing time</p>
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
                        <p className="text-2xl font-bold text-orange-900">Optimal</p>
                        <p className="text-xs text-orange-600 mt-1">All systems operational</p>
                      </div>
                      <div className="p-3 bg-orange-500 rounded-full">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions & Upload */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload Section */}
                  <Card className="lg:col-span-2 p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Document Upload Center</h2>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Bulk Upload
                      </Button>
                    </div>
                    <FileUploader onUploadSuccess={loadDocuments} />
                  </Card>

                  {/* Quick Stats */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                      Document Categories
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(stats.categories).map(([category, count]) => {
                        const percentage = stats.totalDocuments > 0 ? (count / stats.totalDocuments * 100) : 0
                        const colors = {
                          prescription: 'bg-blue-500',
                          lab_report: 'bg-green-500',
                          bill: 'bg-yellow-500',
                          test_report: 'bg-purple-500',
                          other: 'bg-gray-500'
                        }
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium capitalize text-gray-700">
                                {category.replace('_', ' ')}
                              </span>
                              <span className="text-gray-900 font-semibold">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${colors[category as keyof typeof colors]}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </div>

                {/* Search Section */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Search className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">AI-Powered Search</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Advanced Filters
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                      </Button>
                    </div>
                  </div>
                  <SearchBar />
                </Card>
              </div>
            )}

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-6">
                <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-xl mr-4">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Upload Medical Documents</h2>
                        <p className="text-gray-600 mt-1">Drag and drop files or click to browse</p>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </div>
                  <FileUploader onUploadSuccess={loadDocuments} />
                </Card>
              </div>
            )}

            {/* Documents Section */}
            {(activeTab === 'documents' || activeSection.includes('documents') || activeSection === 'all-documents' || activeSection === 'prescriptions' || activeSection === 'lab-reports' || activeSection === 'bills' || activeSection === 'test-reports') && (
              <div className="space-y-6">
                {/* Document Filters */}
                <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-lg font-semibold text-gray-900">Document Library</h2>
                      <span className="text-sm text-gray-500">({filteredDocuments.length} documents)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {['all', 'prescription', 'lab_report', 'bill', 'test_report', 'other'].map((type) => (
                        <Button
                          key={type}
                          variant={selectedCategory === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(type)}
                          className="capitalize"
                        >
                          {type.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Documents Grid */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0 min-h-[600px]">
                  <DocumentList 
                    viewMode={viewMode} 
                    onSelectDocument={setSelectedDocument}
                    documents={filteredDocuments}
                  />
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {(activeTab === 'analytics' || activeSection === 'analytics') && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Trends */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Monthly Upload Trends
                    </h3>
                    <div className="space-y-4">
                      {stats.monthlyTrend.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">{item.month}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                style={{ width: `${(item.count / 70) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-8">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      System Performance
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-600">Processing Speed</span>
                          <span className="text-green-600 font-semibold">95%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-600">Accuracy Rate</span>
                          <span className="text-blue-600 font-semibold">98%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-600">System Uptime</span>
                          <span className="text-purple-600 font-semibold">99.9%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Advanced Search */}
            {activeSection === 'search' && (
              <div className="space-y-6">
                <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-xl mr-4">
                        <Search className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
                        <p className="text-gray-600 mt-1">Search through all your medical documents with AI</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <SearchBar />
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Document Preview</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <DocumentViewer document={selectedDocument} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 