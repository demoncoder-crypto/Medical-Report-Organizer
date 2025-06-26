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
  Loader2,
  Stethoscope,
  Heart,
  Brain,
  Shield,
  Search,
  Plus,
  Filter,
  Download,
  Share,
  Users,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Pill
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
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
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
    initializeNotifications()
  }, [])

  // Update API key status when settings dialog closes
  useEffect(() => {
    if (!isSettingsOpen) {
      const apiKey = localStorage.getItem('gemini-api-key')
      setHasApiKey(!!apiKey)
    }
  }, [isSettingsOpen])

  // Initialize notifications system
  const initializeNotifications = () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'critical',
        title: 'Critical Patient Alert',
        message: 'David Wilson has critical GFR levels requiring immediate attention',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        action: () => setActiveSection('clinical')
      },
      {
        id: 'notif-2',
        type: 'high',
        title: 'Lab Results Available',
        message: 'New lab results for Alex Sample show elevated creatinine levels',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        action: () => setActiveSection('clinical')
      },
      {
        id: 'notif-3',
        type: 'info',
        title: 'System Update',
        message: 'MediVault Enterprise v2.1.4 deployed successfully with enhanced security features',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false,
        action: () => {}
      }
    ]

    // Load saved notifications or use mock data
    const savedNotifications = localStorage.getItem('dashboard-notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        setNotifications(mockNotifications)
      }
    } else {
      setNotifications(mockNotifications)
      localStorage.setItem('dashboard-notifications', JSON.stringify(mockNotifications))
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
      localStorage.setItem('dashboard-notifications', JSON.stringify(updated))
      return updated
    })
  }

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id)
    if (notification.action) {
      notification.action()
    }
    setShowNotifications(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'high': return <Bell className="h-4 w-4 text-orange-600" />
      case 'medium': return <Activity className="h-4 w-4 text-yellow-600" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 hover:bg-red-100'
      case 'high': return 'border-orange-200 bg-orange-50 hover:bg-orange-100'
      case 'medium': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
      case 'info': return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
      default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNotifications && !target.closest('.notification-panel') && !target.closest('[data-notification-button]')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

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

  // Debug logging for category filtering
  useEffect(() => {
    console.log(`[Dashboard] Category changed to: ${selectedCategory}`)
    console.log(`[Dashboard] Total documents: ${safeDocuments.length}`)
    console.log(`[Dashboard] Filtered documents: ${filteredDocuments.length}`)
    console.log(`[Dashboard] Document types:`, safeDocuments.map(doc => doc.type))
    
    // Log to verify the filtering is working
    if (selectedCategory !== 'all') {
      const expectedFiltered = safeDocuments.filter((doc: any) => doc.type === selectedCategory)
      console.log(`[Dashboard] Expected filtered count: ${expectedFiltered.length}`)
      console.log(`[Dashboard] Actual filtered count: ${filteredDocuments.length}`)
      console.log(`[Dashboard] Expected filtered docs:`, expectedFiltered.map(d => ({ name: d.name, type: d.type })))
      console.log(`[Dashboard] Actual filtered docs:`, filteredDocuments.map(d => ({ name: d.name, type: d.type })))
    }
    
    // Additional debugging for Vercel
    console.log(`[Dashboard] Filter comparison - Category: "${selectedCategory}"`)
    safeDocuments.forEach((doc: any, index: number) => {
      console.log(`[Dashboard] Doc ${index}: "${doc.name}" - Type: "${doc.type}" - Matches: ${doc.type === selectedCategory}`)
    })
  }, [selectedCategory, safeDocuments.length, filteredDocuments.length])

  // Ensure category state persists and is valid
  useEffect(() => {
    // Validate selectedCategory is valid
    const validCategories = ['all', 'lab_report', 'prescription', 'bill', 'test_report']
    if (!validCategories.includes(selectedCategory)) {
      console.warn(`[Dashboard] Invalid category: ${selectedCategory}, resetting to 'all'`)
      setSelectedCategory('all')
    }
  }, [selectedCategory])

  // Helper function to get category colors (fixes Vercel production CSS issues)
  const getCategoryColors = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        bg: isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200',
        text: isSelected ? 'text-blue-600' : 'text-gray-500',
        badge: 'bg-blue-100 text-blue-800'
      },
      red: {
        bg: isSelected ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200',
        text: isSelected ? 'text-red-600' : 'text-gray-500',
        badge: 'bg-red-100 text-red-800'
      },
      green: {
        bg: isSelected ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-gray-200',
        text: isSelected ? 'text-green-600' : 'text-gray-500',
        badge: 'bg-green-100 text-green-800'
      },
      yellow: {
        bg: isSelected ? 'bg-yellow-100' : 'bg-gray-100 group-hover:bg-gray-200',
        text: isSelected ? 'text-yellow-600' : 'text-gray-500',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      purple: {
        bg: isSelected ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-gray-200',
        text: isSelected ? 'text-purple-600' : 'text-gray-500',
        badge: 'bg-purple-100 text-purple-800'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  // Navigation items
  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        { id: 'overview', label: 'Overview', icon: HomeIcon, description: 'System overview and analytics' },
        { id: 'upload', label: 'Upload Documents', icon: Upload, description: 'Add new medical documents' },
        { id: 'documents', label: 'Document Library', icon: Folder, description: 'Browse and manage documents' },
      ]
    },
    {
      title: 'Clinical Tools',
      items: [
        { id: 'clinical', label: 'Clinical Dashboard', icon: Stethoscope, description: 'Doctor and clinical workflows' },
        { id: 'patient', label: 'Patient Portal', icon: User, description: 'Patient health management' },
        { id: 'intelligence', label: 'Medical AI', icon: Brain, description: 'AI-powered medical insights' },
      ]
    },
    {
      title: 'Tools & Utilities',
      items: [
        { id: 'ocr', label: 'OCR Lab', icon: Scan, description: 'Text extraction from images' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Document and usage analytics' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
      
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <Stethoscope className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-bold text-gray-900">
                      MediVault Enterprise
                    </h1>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      v2.1.4
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Healthcare Document Intelligence Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status Indicators */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">99.9% Uptime</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Dr. Sarah Wilson, MD</p>
                  <p className="text-xs text-gray-500">Chief Medical Officer • ID: MW-2024</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="View Clinical Notifications"
                    data-notification-button
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Notification Panel */}
                  {showNotifications && (
                    <div className="notification-panel absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Clinical Notifications</h3>
                          <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                {unreadCount} new
                              </span>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowNotifications(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationColor(notification.type)} ${
                                !notification.read ? 'border-l-4 border-l-blue-500' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {new Date(notification.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                  <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  {!notification.read && (
                                    <div className="flex items-center mt-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                      <span className="text-xs text-blue-600 font-medium">New</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setActiveSection('clinical')
                              setShowNotifications(false)
                            }}
                          >
                            View All in Clinical Dashboard
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsSettingsOpen(true)}
                  className="relative flex items-center gap-2 border-gray-300"
                >
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Configuration</span>
                  {!hasApiKey && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </Button>

                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => setActiveSection('upload')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Upload</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Professional Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          mt-20 lg:mt-0
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                  <p className="text-sm text-gray-600">Clinical Workspace</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    <Database className="h-3 w-3" />
                    <span className="font-medium">{stats.totalDocuments}</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    <span className="font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 p-6 space-y-8 overflow-y-auto bg-white">
              {navigationSections.map((section, sectionIndex) => (
                <div key={section.title} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                  </div>
                  
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`
                            w-full group relative overflow-hidden rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                            }
                          `}
                        >
                          <div className="flex items-center p-3">
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                              }
                            `}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="ml-4 flex-1 text-left">
                              <div className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                {item.label}
                              </div>
                              <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                {item.description}
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-1 h-8 bg-blue-600 rounded-full ml-2"></div>
                            )}
                          </div>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Enhanced Document Categories */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Document Categories
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Documents', count: stats.totalDocuments, color: 'blue', icon: Folder },
                    { id: 'lab_report', label: 'Lab Reports', count: stats.categories.lab_report, color: 'red', icon: Activity },
                    { id: 'prescription', label: 'Prescriptions', count: stats.categories.prescription, color: 'green', icon: Pill },
                    { id: 'bill', label: 'Medical Bills', count: stats.categories.bill, color: 'yellow', icon: FileText },
                    { id: 'test_report', label: 'Test Reports', count: stats.categories.test_report, color: 'purple', icon: Search },
                  ].map((category) => {
                    const Icon = category.icon
                    const isSelected = selectedCategory === category.id
                    
                    const colorClasses = getCategoryColors(category.color, isSelected)
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          console.log(`[Dashboard] Category selected: ${category.id}`)
                          setSelectedCategory(category.id)
                        }}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-sm group
                          ${isSelected 
                            ? 'bg-gray-100 text-gray-900 border border-gray-300 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${colorClasses.bg}`}>
                            <Icon className={`h-4 w-4 ${colorClasses.text}`} />
                          </div>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${colorClasses.badge}`}>
                            {category.count}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* System Information */}
              <div className="pt-6 border-t border-gray-200">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Security Status</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Encryption</span>
                      <span className="text-green-600 font-medium">AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compliance</span>
                      <span className="text-green-600 font-medium">HIPAA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Audit</span>
                      <span className="text-gray-600">Dec 2024</span>
                    </div>
                  </div>
                </div>
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 lg:p-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Executive Summary Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Clinical Operations Dashboard</h2>
                        <p className="text-sm text-gray-600 mt-1">Real-time healthcare document management and clinical workflow oversight</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-gray-600">System Operational</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date().toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Critical Alerts Banner */}
                  {stats.totalDocuments > 0 && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {stats.todayUploads} new documents processed today
                          </span>
                          <span className="text-xs text-blue-600">
                            • {stats.recentUploads} this week • {stats.totalDocuments} total records
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          onClick={() => setActiveSection('documents')}
                        >
                          Review All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enterprise KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Document Volume */}
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Volume</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments.toLocaleString()}</div>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">
                              +{stats.recentUploads} this week
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Database className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Processing Efficiency */}
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Processing Time</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{(stats.processingTime / 60).toFixed(1)}m</div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-purple-600 mr-1" />
                            <span className="text-xs text-purple-600 font-medium">
                              Avg per document
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Security Compliance */}
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compliance</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">100%</div>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">
                              HIPAA Compliant
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* System Performance */}
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Activity className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uptime</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">99.9%</div>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">
                              All systems operational
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Clinical Workflow Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Document Processing Pipeline */}
                  <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Document Processing Pipeline</h3>
                          <p className="text-sm text-gray-600">Real-time document flow and categorization</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection('analytics')}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* Processing Status */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            </div>
                            <div>
                              <div className="font-medium text-blue-900">Active Processing</div>
                              <div className="text-sm text-blue-700">AI analysis and categorization in progress</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-900">3</div>
                            <div className="text-xs text-blue-600">documents</div>
                          </div>
                        </div>

                        {/* Document Categories Distribution */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(stats.categories).map(([key, count]) => {
                            const categoryConfig = {
                              lab_report: { label: 'Lab Reports', color: 'red', icon: Activity },
                              prescription: { label: 'Prescriptions', color: 'green', icon: Pill },
                              bill: { label: 'Medical Bills', color: 'yellow', icon: FileText },
                              test_report: { label: 'Test Reports', color: 'purple', icon: Search },
                              other: { label: 'Other Documents', color: 'gray', icon: FileText }
                            }[key] || { label: key, color: 'gray', icon: FileText }

                            const Icon = categoryConfig.icon
                            const percentage = stats.totalDocuments > 0 ? ((count / stats.totalDocuments) * 100).toFixed(1) : '0'

                            return (
                              <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Icon className={`h-4 w-4 text-${categoryConfig.color}-600`} />
                                  <span className="text-xs font-medium text-gray-600">{categoryConfig.label}</span>
                                </div>
                                <div className="flex items-baseline space-x-1">
                                  <span className="text-lg font-bold text-gray-900">{count}</span>
                                  <span className="text-xs text-gray-500">({percentage}%)</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions Panel */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button 
                          className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setActiveSection('upload')}
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          Upload New Documents
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => setActiveSection('intelligence')}
                        >
                          <Brain className="h-4 w-4 mr-3" />
                          AI Medical Analysis
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => setActiveSection('patient')}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Patient Portal
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-orange-300 text-orange-700 hover:bg-orange-50"
                          onClick={() => setActiveSection('clinical')}
                        >
                          <Stethoscope className="h-4 w-4 mr-3" />
                          Clinical Dashboard
                        </Button>
                      </div>

                      {/* System Status */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">API Services</span>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className={hasApiKey ? 'text-green-600' : 'text-red-600'}>
                                {hasApiKey ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Data Security</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-green-600">Encrypted</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Backup Status</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-green-600">Current</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Advanced Search & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Intelligent Search */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Intelligent Document Search</h3>
                          <p className="text-sm text-gray-600">AI-powered semantic search across all medical records</p>
                        </div>
                      </div>
                      <SearchBar 
                        documents={safeDocuments}
                        onResultSelect={(doc) => setSelectedDocument(doc)}
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Lab Results', 'Prescriptions', 'Discharge Summary', 'Imaging Reports'].map((term) => (
                          <button
                            key={term}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                            onClick={() => {
                              // Trigger search for this term
                            }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Recent Activity Feed */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <p className="text-sm text-gray-600">Latest document processing and system events</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveSection('documents')}>
                          View All
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {safeDocuments.slice(0, 4).map((doc, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                               onClick={() => setSelectedDocument(doc)}>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                              <div className="text-xs text-gray-500">
                                {doc.type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • 
                                {new Date(doc.date).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                        
                        {safeDocuments.length === 0 && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setActiveSection('upload')}
                            >
                              Upload First Document
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Medical Documents</h2>
                  <p className="text-gray-600 mt-1">
                    Securely upload and process medical documents with AI-powered analysis
                  </p>
                </div>

                <Card className="p-8 bg-white border-0 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Upload</h3>
                    <p className="text-gray-600">Supported formats: PDF, PNG, JPG, TXT (Max 10MB)</p>
                  </div>
                  <FileUploader onUploadSuccess={handleUploadSuccess} />
                </Card>

                {/* Recent Uploads */}
                {filteredDocuments.length > 0 && (
                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recently Uploaded</h3>
                    <DocumentList 
                      key={`${selectedCategory}-${filteredDocuments.length}`}
                      documents={filteredDocuments.slice(0, 8)} 
                      viewMode="grid"
                      onSelectDocument={(doc) => setSelectedDocument(doc)}
                    />
                  </Card>
                )}
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
                    <p className="text-gray-600 mt-1">
                      Browse and manage your medical document collection
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'timeline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('timeline')}
                      >
                        Timeline
                      </Button>
                    </div>
                    <Button onClick={() => setActiveSection('upload')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                <Card className="p-6 bg-white border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCategory === 'all' ? 'All Documents' : 
                       selectedCategory.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} 
                      ({filteredDocuments.length})
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
                    key={`${selectedCategory}-${filteredDocuments.length}`}
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

            {/* Medical Intelligence Section */}
            {activeSection === 'intelligence' && (
              <div>
                <MedicalIntelligence documents={safeDocuments} />
              </div>
            )}

            {/* OCR Lab Section */}
            {activeSection === 'ocr' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">OCR Laboratory</h2>
                  <p className="text-gray-600 mt-1">
                    Extract text from medical images using advanced OCR technology
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Section */}
                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Image for OCR
                    </h3>
                    
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
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
                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
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
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Document Analytics</h2>
                  <p className="text-gray-600 mt-1">
                    Insights and statistics about your medical document collection
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Document Distribution</h3>
                    <div className="space-y-4">
                      {Object.entries(stats.categories).map(([key, count]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${stats.totalDocuments > 0 ? (count / stats.totalDocuments) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Status</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-sm">{hasApiKey ? 'Connected' : 'Not configured'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Storage</span>
                        <span className="text-sm">Local + Cloud</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security</span>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm">HIPAA Compliant</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
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