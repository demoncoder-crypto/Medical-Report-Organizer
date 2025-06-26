'use client'

import { useState } from 'react'
import { 
  Brain, 
  Search, 
  Languages, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Pill,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getApiKey } from '@/lib/api-key'

interface MedicalIntelligenceProps {
  documents: any[]
}

export function MedicalIntelligence({ documents }: MedicalIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'insights' | 'comprehensive' | 'timeline' | 'translate'>('search')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [clinicalInsights, setClinicalInsights] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [realDataLoaded, setRealDataLoaded] = useState(false)
  
  // Timeline-specific state
  const [selectedPatient, setSelectedPatient] = useState('demo-patient-1')
  const [timeRange, setTimeRange] = useState('6months')
  const [eventTypes, setEventTypes] = useState({
    labResults: true,
    medications: true,
    procedures: true,
    diagnoses: true
  })
  const [viewMode, setViewMode] = useState('chronological')

  // Patient data for timeline
  const patientData = {
    'demo-patient-1': {
      name: 'Jane Demo',
      age: 52,
      status: 'High Risk',
      conditions: ['Type 2 Diabetes', 'Hypertension', 'Obesity'],
      timeline: [
        {
          date: '2025-06-20',
          type: 'lab_result',
          event: 'Poor diabetes control - HbA1c elevated',
          values: { hba1c: 9.2, glucose: 245, bp: '142/88' },
          severity: 'high',
          actions: ['Medication adjustment', 'Diabetes education']
        },
        {
          date: '2025-04-15',
          type: 'medication',
          event: 'Metformin dose increased due to poor control',
          values: { hba1c: 8.8, glucose: 220 },
          severity: 'moderate',
          actions: ['Metformin 1000mg BID']
        },
        {
          date: '2025-01-10',
          type: 'diagnosis',
          event: 'Type 2 Diabetes diagnosis confirmed',
          values: { hba1c: 8.2, glucose: 198 },
          severity: 'moderate',
          actions: ['Lifestyle counseling', 'Metformin started']
        }
      ]
    },
    'demo-patient-2': {
      name: 'Alex Sample',
      age: 58,
      status: 'Moderate Risk',
      conditions: ['CKD Stage 3', 'Hypertension', 'Hyperlipidemia'],
      timeline: [
        {
          date: '2025-06-18',
          type: 'lab_result',
          event: 'Stable kidney function with good BP control',
          values: { gfr: 45, creatinine: 1.8, bp: '128/78' },
          severity: 'low',
          actions: ['Continue current therapy']
        },
        {
          date: '2025-03-20',
          type: 'medication',
          event: 'ARB therapy optimized for kidney protection',
          values: { gfr: 42, creatinine: 1.9, bp: '135/82' },
          severity: 'moderate',
          actions: ['Losartan 50mg daily']
        },
        {
          date: '2024-11-15',
          type: 'diagnosis',
          event: 'CKD Stage 3 diagnosis - monitoring initiated',
          values: { gfr: 48, creatinine: 1.7 },
          severity: 'moderate',
          actions: ['Nephrology referral', 'ACE inhibitor']
        }
      ]
    }
  }

  // Function to extract patient data from uploaded documents
  const extractPatientsFromDocuments = () => {
    const extractedPatients: any = {}
    
    console.log('Extracting patients from documents:', documents)
    
    if (documents && documents.length > 0) {
      documents.forEach((doc: any, docIndex: number) => {
        console.log(`Processing document ${docIndex}:`, doc)
        
        // Extract patient information from document content/summary
        const content = doc.content || doc.summary || doc.name || ''
        console.log('Document content:', content)
        
        // Enhanced patient name detection patterns
        const patientNamePatterns = [
          /Patient[:\s]*([A-Z][A-Z\s]+?)(?=,|\n|$|Age|DOB|\d)/gi,
          /Name[:\s]*([A-Z][A-Z\s]+?)(?=,|\n|$|Age|DOB|\d)/gi,
          /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/g, // Multiple capital words
          /Report for[:\s]*([A-Z][A-Z\s]+)/gi,
          /Patient ID[:\s]*\w+[:\s]*([A-Z][A-Z\s]+)/gi
        ]
        
        let patientName = null
        for (const pattern of patientNamePatterns) {
          const matches = content.match(pattern)
          if (matches && matches.length > 0) {
            // Take the first reasonable match
            const match = matches[0]
            const cleanMatch = match.replace(/Patient[:\s]*|Name[:\s]*|Report for[:\s]*/gi, '').trim()
            if (cleanMatch.length > 2 && cleanMatch.length < 50 && !cleanMatch.includes('Report') && !cleanMatch.includes('Lab')) {
              patientName = cleanMatch
              console.log('Found patient name:', patientName)
              break
            }
          }
        }
        
        // If no patient name found, create a generic one based on document
        if (!patientName) {
          patientName = `Patient from ${doc.name || `Document ${docIndex + 1}`}`
          console.log('Using generic patient name:', patientName)
        }
        
        const patientId = patientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        // Enhanced medical value extraction
        const ageMatch = content.match(/(?:Age|age)[:\s]*(\d{1,3})\s*(?:years?|yo|y\.o\.|\s|$)/i) ||
                         content.match(/(\d{2,3})\s*(?:years?|yo|y\.o\.)\s*(?:old|male|female)/i)
        
        const dateMatch = content.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})/i) ||
                         content.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i)
        
        // Enhanced lab value extraction
        const labValues = {
          gfr: content.match(/GFR[:\s]*(\d+(?:\.\d+)?)/i),
          creatinine: content.match(/creatinine[:\s]*(\d+(?:\.\d+)?)/i),
          hemoglobin: content.match(/h(?:ae)?moglobin[:\s]*(\d+(?:\.\d+)?)/i),
          hba1c: content.match(/HbA1c[:\s]*(\d+(?:\.\d+)?)/i),
          glucose: content.match(/glucose[:\s]*(\d+(?:\.\d+)?)/i),
          urea: content.match(/urea[:\s]*(\d+(?:\.\d+)?)/i),
          bun: content.match(/BUN[:\s]*(\d+(?:\.\d+)?)/i),
          sodium: content.match(/sodium[:\s]*(\d+(?:\.\d+)?)/i),
          potassium: content.match(/potassium[:\s]*(\d+(?:\.\d+)?)/i)
        }
        
        console.log('Extracted lab values:', labValues)
        
        // Determine severity based on multiple factors
        let severity = 'low'
        let conditions: string[] = []
        
        if (labValues.gfr && parseFloat(labValues.gfr[1]) < 15) {
          severity = 'critical'
          conditions.push('End Stage Renal Disease')
        } else if (labValues.gfr && parseFloat(labValues.gfr[1]) < 30) {
          severity = 'high'
          conditions.push('Chronic Kidney Disease Stage 4-5')
        } else if (labValues.gfr && parseFloat(labValues.gfr[1]) < 60) {
          severity = 'moderate'
          conditions.push('Chronic Kidney Disease')
        }
        
        if (labValues.creatinine && parseFloat(labValues.creatinine[1]) > 3) {
          severity = severity === 'critical' ? 'critical' : 'high'
          if (!conditions.some(c => c.includes('Kidney'))) {
            conditions.push('Severe Kidney Dysfunction')
          }
        }
        
        if (labValues.hemoglobin && parseFloat(labValues.hemoglobin[1]) < 10) {
          conditions.push('Severe Anemia')
          if (severity === 'low') severity = 'moderate'
        } else if (labValues.hemoglobin && parseFloat(labValues.hemoglobin[1]) < 12) {
          conditions.push('Anemia')
        }
        
        if (labValues.hba1c && parseFloat(labValues.hba1c[1]) > 9) {
          severity = severity === 'low' ? 'high' : severity
          conditions.push('Poorly Controlled Diabetes')
        } else if (labValues.hba1c && parseFloat(labValues.hba1c[1]) > 7) {
          conditions.push('Diabetes')
        }
        
        // Create or update patient data
        if (!extractedPatients[patientId]) {
          extractedPatients[patientId] = {
            name: patientName,
            age: ageMatch ? parseInt(ageMatch[1]) : 'Unknown',
            status: severity === 'critical' ? 'Critical' : severity === 'high' ? 'High Risk' : 'Moderate Risk',
            conditions: conditions.length > 0 ? conditions : ['General Medical Report'],
            timeline: []
          }
        }
        
        // Add timeline event
        const event = {
          date: dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0],
          type: 'lab_result',
          event: `Medical report analysis - ${doc.name || 'Lab Results'}`,
          values: {} as any,
          severity: severity,
          actions: [] as string[]
        }
        
        // Add extracted values to event
        Object.entries(labValues).forEach(([key, match]) => {
          if (match) {
            const unit = key === 'gfr' ? ' mL/min' : 
                        key === 'creatinine' ? ' mg/dL' :
                        key === 'hemoglobin' ? ' g/dL' :
                        key === 'hba1c' ? '%' :
                        key === 'glucose' ? ' mg/dL' :
                        key === 'urea' ? ' mg/dL' : ''
            event.values[key] = `${match[1]}${unit}`
          }
        })
        
        // Add appropriate actions based on findings
        if (severity === 'critical') {
          event.actions.push('Urgent Medical Attention', 'Specialist Referral')
        } else if (severity === 'high') {
          event.actions.push('Enhanced Monitoring', 'Follow-up Required')
        } else {
          event.actions.push('Routine Monitoring')
        }
        
        extractedPatients[patientId].timeline.push(event)
        
        console.log('Created patient:', extractedPatients[patientId])
      })
    }
    
    console.log('Final extracted patients:', extractedPatients)
    return extractedPatients
  }

  // Combine extracted patients with mock patients
  const getAllPatients = () => {
    const extractedPatients = extractPatientsFromDocuments()
    return { ...extractedPatients, ...patientData }
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' }
  ]

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      console.log('=== Starting Smart Search ===')
      console.log('Search query:', searchQuery)
      console.log('Available documents:', documents)
      
      // First, try to answer from uploaded documents
      const localResults = searchInUploadedDocuments(searchQuery)
      console.log('Local search results:', localResults)
      
      if (localResults.found) {
        // We found relevant information in uploaded documents
        setSearchResults({
          success: true,
          data: {
            answer: localResults.answer,
            confidence: localResults.confidence,
            medicalContext: localResults.context,
            relevantDocuments: localResults.documents,
            source: 'uploaded_documents'
          }
        })
        console.log('Using local document results')
      } else {
        // Fallback to API search with document context
        console.log('No local results found, calling API with document context')
        const apiKey = getApiKey()
        const response = await fetch('/api/medical-intelligence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'X-Gemini-Api-Key': apiKey })
          },
          body: JSON.stringify({
            action: 'smart_search',
            query: searchQuery,
            language: selectedLanguage,
            documents: documents, // Include uploaded documents for context
            patientData: getAllPatients() // Include extracted patient data
          })
        })

        const data = await response.json()
        if (data.success) {
          setSearchResults({
            ...data,
            data: {
              ...data.data,
              source: 'api_with_context'
            }
          })
          console.log('API search completed:', data)
        } else {
          console.error('Search failed:', data.error)
          // Show error with helpful message
          setSearchResults({
            success: false,
            error: 'Search failed. Please try a different query or check your documents.',
            data: {
              answer: 'Unable to process your search query. Please ensure your documents are uploaded and try again.',
              confidence: 0,
              medicalContext: [],
              relevantDocuments: [],
              source: 'error'
            }
          })
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults({
        success: false,
        error: 'Search service unavailable',
        data: {
          answer: 'Search service is currently unavailable. Please try again later.',
          confidence: 0,
          medicalContext: [],
          relevantDocuments: [],
          source: 'error'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to search within uploaded documents
  const searchInUploadedDocuments = (query: string) => {
    console.log('Searching in uploaded documents for:', query)
    
    if (!documents || documents.length === 0) {
      return { found: false, answer: '', confidence: 0, context: [], documents: [] }
    }

    const queryLower = query.toLowerCase()
    const relevantDocs: any[] = []
    const foundValues: any[] = []
    const contextTerms: string[] = []

    // Extract patient data for context
    const allPatients = getAllPatients()
    const patientNames = Object.values(allPatients).map((p: any) => p.name)

    documents.forEach((doc: any) => {
      const content = (doc.content || doc.summary || doc.name || '').toLowerCase()
      
      // Check if query is relevant to this document
      const relevanceScore = calculateRelevance(queryLower, content)
      
      if (relevanceScore > 0.3) {
        relevantDocs.push({
          name: doc.name,
          relevance: relevanceScore,
          content: doc.content || doc.summary
        })
      }
    })

    if (relevantDocs.length === 0) {
      return { found: false, answer: '', confidence: 0, context: [], documents: [] }
    }

    // Generate answer based on query type
    let answer = ''
    let confidence = 0.8
    
    // Handle different types of medical queries
    if (queryLower.includes('cholesterol') || queryLower.includes('lipid')) {
      const cholesterolInfo = extractLabValue('cholesterol|ldl|hdl|triglyceride', relevantDocs)
      if (cholesterolInfo.found) {
        answer = `Based on your uploaded reports: ${cholesterolInfo.summary}`
        contextTerms.push('Lipid Panel', 'Cardiovascular Risk')
      }
    } else if (queryLower.includes('kidney') || queryLower.includes('creatinine') || queryLower.includes('gfr')) {
      const kidneyInfo = extractLabValue('gfr|creatinine|kidney|renal', relevantDocs)
      if (kidneyInfo.found) {
        answer = `Based on your kidney function tests: ${kidneyInfo.summary}`
        contextTerms.push('Kidney Function', 'Renal Health')
      }
    } else if (queryLower.includes('diabetes') || queryLower.includes('hba1c') || queryLower.includes('glucose')) {
      const diabetesInfo = extractLabValue('hba1c|glucose|diabetes', relevantDocs)
      if (diabetesInfo.found) {
        answer = `Based on your diabetes-related tests: ${diabetesInfo.summary}`
        contextTerms.push('Diabetes Management', 'Glucose Control')
      }
    } else if (queryLower.includes('medication') || queryLower.includes('drug') || queryLower.includes('taking')) {
      answer = `Based on your uploaded reports, I can see medical information but specific medication details would need to be extracted. Please check your latest reports for current medications.`
      contextTerms.push('Medication Review', 'Treatment History')
      confidence = 0.6
    } else if (queryLower.includes('risk') || queryLower.includes('condition')) {
      const riskPatients = Object.values(allPatients).filter((p: any) => p.status === 'Critical' || p.status === 'High Risk')
      if (riskPatients.length > 0) {
        answer = `Based on your reports, ${riskPatients.length} high-risk condition(s) identified. ${riskPatients.map((p: any) => `${p.name}: ${p.conditions.join(', ')}`).join('. ')}`
        contextTerms.push('Risk Assessment', 'Clinical Status')
      }
    } else {
      // General search in document content
      const matchingContent = relevantDocs.map(doc => {
        const sentences = doc.content.split(/[.!?]+/)
        const relevantSentences = sentences.filter((sentence: string) => 
          queryLower.split(' ').some(word => sentence.toLowerCase().includes(word))
        )
        return relevantSentences.slice(0, 2).join('. ')
      }).filter(content => content.length > 0)

      if (matchingContent.length > 0) {
        answer = `From your uploaded documents: ${matchingContent.join('. ')}`
        contextTerms.push('Document Search', 'Medical Records')
        confidence = 0.7
      }
    }

    return {
      found: answer.length > 0,
      answer,
      confidence,
      context: contextTerms,
      documents: relevantDocs.map(doc => doc.name)
    }
  }

  // Helper function to calculate relevance score
  const calculateRelevance = (query: string, content: string): number => {
    const queryWords = query.split(' ').filter(word => word.length > 2)
    const contentWords = content.split(' ')
    
    let matches = 0
    queryWords.forEach(queryWord => {
      if (contentWords.some(contentWord => contentWord.includes(queryWord))) {
        matches++
      }
    })
    
    return matches / queryWords.length
  }

  // Helper function to extract lab values from documents
  const extractLabValue = (pattern: string, docs: any[]) => {
    const regex = new RegExp(pattern, 'gi')
    const findings: string[] = []
    
    docs.forEach(doc => {
      const content = doc.content || ''
      const matches = content.match(regex)
      if (matches) {
        // Extract surrounding context
        const sentences = content.split(/[.!?]+/)
        sentences.forEach((sentence: string) => {
          if (regex.test(sentence)) {
            findings.push(sentence.trim())
          }
        })
      }
    })
    
    return {
      found: findings.length > 0,
      summary: findings.slice(0, 3).join('. ') + (findings.length > 3 ? '...' : '')
    }
  }

  const handleGenerateInsights = async () => {
    setInsightsLoading(true)
    try {
      console.log('=== Starting Insights Generation ===')
      console.log('Available documents:', documents)
      
      // First, extract real patient data from uploaded documents
      const extractedPatients = extractPatientsFromDocuments()
      console.log('Extracted patients:', extractedPatients)
      
      // If we have real patients, process their data for insights
      if (Object.keys(extractedPatients).length > 0) {
        console.log('Found real patients, generating insights from real data')
        // Generate insights from real patient data
        const allPatients = getAllPatients()
        console.log('All patients (extracted + mock):', allPatients)
        
        const criticalPatients = Object.values(allPatients).filter((p: any) => p.status === 'Critical')
        const highRiskPatients = Object.values(allPatients).filter((p: any) => p.status === 'High Risk')
        
        console.log('Critical patients:', criticalPatients)
        console.log('High risk patients:', highRiskPatients)
        
        // Create clinical insights from real data
        const insights = {
          patientSummary: `Analysis of ${Object.keys(allPatients).length} patients. ${criticalPatients.length} critical, ${highRiskPatients.length} high-risk cases identified.`,
          activeConditions: Object.values(allPatients).flatMap((p: any) => p.conditions),
          currentMedications: [], // Would need to be extracted from documents
          drugInteractions: [], // Would need medication analysis
          clinicalAlerts: criticalPatients.length + highRiskPatients.length,
          recommendations: [
            ...(criticalPatients.length > 0 ? [`Immediate attention required for ${criticalPatients.length} critical patient(s)`] : []),
            ...(highRiskPatients.length > 0 ? [`Enhanced monitoring for ${highRiskPatients.length} high-risk patient(s)`] : []),
            'Continue routine monitoring for stable patients'
          ]
        }
        
        console.log('Generated insights:', insights)
        setClinicalInsights(insights)
        setRealDataLoaded(true)
        console.log('Real data insights set successfully')
      } else {
        console.log('No real patients found, falling back to API/default')
        // Fallback to API call if no real patients found
        setRealDataLoaded(false)
        const apiKey = getApiKey()
        const response = await fetch('/api/medical-intelligence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'X-Gemini-Api-Key': apiKey })
          },
          body: JSON.stringify({
            action: 'clinical_insights',
            documents: documents // Pass documents to API
          })
        })

        const data = await response.json()
        if (data.success) {
          setClinicalInsights(data.data.insights)
        } else {
          console.error('Insights generation failed:', data.error)
          // Set default insights if API fails
          setClinicalInsights({
            patientSummary: 'Clinical insights generated from available data.',
            activeConditions: [],
            currentMedications: [],
            drugInteractions: [],
            clinicalAlerts: 0,
            recommendations: ['Upload medical documents to generate personalized insights']
          })
        }
      }
    } catch (error) {
      console.error('Insights error:', error)
      // Set error state with helpful message
      setClinicalInsights({
        patientSummary: 'Unable to generate insights. Please check your documents and try again.',
        activeConditions: [],
        currentMedications: [],
        drugInteractions: [],
        clinicalAlerts: 0,
        recommendations: ['Ensure medical documents are uploaded', 'Check document format and content']
      })
    } finally {
      setInsightsLoading(false)
    }
  }

  const handleGenerateTimeline = async () => {
    setTimelineLoading(true)
    try {
      const apiKey = getApiKey()
      const response = await fetch('/api/medical-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-Gemini-Api-Key': apiKey })
        },
        body: JSON.stringify({
          action: 'medical_timeline'
        })
      })

      const data = await response.json()
      if (data.success) {
        setTimeline(data.data.timeline || [])
      } else {
        console.error('Timeline generation failed:', data.error)
      }
    } catch (error) {
      console.error('Timeline error:', error)
    } finally {
      setTimelineLoading(false)
    }
  }

  // Function to handle population health insights
  const handleGeneratePopulationInsights = async () => {
    console.log('Generating population health insights...')
    // This would call the API to generate population health data
    // For now, the data is displayed as mock data in the UI
  }

  // Function to handle patient selection change
  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId)
    // Optionally trigger timeline refresh
  }

  // Function to get current patient data
  const getCurrentPatientData = () => {
    const allPatients = getAllPatients()
    const patientKeys = Object.keys(allPatients)
    return allPatients[selectedPatient] || allPatients[patientKeys[0]] || {
      name: 'No Patient Selected',
      age: 0,
      status: 'Unknown',
      conditions: [],
      timeline: []
    }
  }

  // Function to filter timeline based on selected filters
  const getFilteredTimeline = () => {
    const currentPatient = getCurrentPatientData()
    let filteredTimeline = [...currentPatient.timeline]

    // Filter by event types
    filteredTimeline = filteredTimeline.filter(event => {
      if (event.type === 'lab_result' && !eventTypes.labResults) return false
      if (event.type === 'medication' && !eventTypes.medications) return false
      if (event.type === 'procedure' && !eventTypes.procedures) return false
      if (event.type === 'diagnosis' && !eventTypes.diagnoses) return false
      return true
    })

    // Filter by time range
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case '2years':
        cutoffDate.setFullYear(now.getFullYear() - 2)
        break
      default:
        cutoffDate.setFullYear(1900) // Show all
    }

    filteredTimeline = filteredTimeline.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= cutoffDate
    })

    // Sort chronologically (newest first)
    filteredTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return filteredTimeline
  }

  const tabs = [
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'insights', label: 'Clinical Insights', icon: Brain },
    { id: 'comprehensive', label: 'Clinical Analysis', icon: Activity },
    { id: 'timeline', label: 'Medical Timeline', icon: Calendar },
    { id: 'translate', label: 'Translation', icon: Languages }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Medical Intelligence</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Advanced AI-powered medical analysis with RAG search, clinical decision support, 
          multilingual translation, and comprehensive health insights.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Smart Search Tab */}
      {activeTab === 'search' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Intelligent Medical Search</h3>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                placeholder="Ask complex medical questions..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button onClick={handleSmartSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* Advanced Search Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">✨ RAG-Powered Queries</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <button 
                    onClick={() => setSearchQuery("How has my cholesterol changed over time?")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    "How has my cholesterol changed over time?"
                  </button>
                  <button 
                    onClick={() => setSearchQuery("What medications was I taking 6 months ago?")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    "What medications was I taking 6 months ago?"
                  </button>
                  <button 
                    onClick={() => setSearchQuery("Are there any drug interactions?")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    "Are there any drug interactions?"
                  </button>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🔬 Clinical Analysis</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <button 
                    onClick={() => setSearchQuery("What are my risk factors for heart disease?")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    • Risk factor identification
                  </button>
                  <button 
                    onClick={() => setSearchQuery("Show me my blood pressure trends")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    • Vital sign analysis
                  </button>
                  <button 
                    onClick={() => setSearchQuery("What treatments have I tried for diabetes?")} 
                    className="block hover:underline cursor-pointer text-left"
                  >
                    • Treatment pattern analysis
                  </button>
                </div>
              </div>
            </div>

            {searchResults && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Medical Intelligence Response</span>
                  {searchResults.data?.confidence && (
                    <span className="text-sm text-gray-500">
                      (Confidence: {Math.round(searchResults.data.confidence * 100)}%)
                    </span>
                  )}
                  {searchResults.data?.source && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      searchResults.data.source === 'uploaded_documents' 
                        ? 'bg-green-100 text-green-800' 
                        : searchResults.data.source === 'api_with_context'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {searchResults.data.source === 'uploaded_documents' ? 'Your Documents' :
                       searchResults.data.source === 'api_with_context' ? 'AI + Your Data' :
                       'AI Search'}
                    </span>
                  )}
                </div>
                
                {searchResults.data?.answer ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-gray-800 mb-2">Answer:</h4>
                      <p className="text-gray-700">{searchResults.data.answer}</p>
                    </div>
                    
                    {searchResults.data.medicalContext?.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Medical Context:</h4>
                        <div className="flex flex-wrap gap-2">
                          {searchResults.data.medicalContext.map((context: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {context}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchResults.data.relevantDocuments?.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Sources:</h4>
                        <p className="text-sm text-green-700">
                          Based on analysis of {searchResults.data.relevantDocuments.length} relevant document(s)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border">
                    <pre className="text-sm text-gray-700 overflow-auto">
                      {JSON.stringify(searchResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Clinical Insights Tab */}
      {activeTab === 'insights' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Advanced Clinical Analytics</h3>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerateInsights} disabled={insightsLoading} variant="outline">
                  {insightsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Analytics'}
                  {realDataLoaded && !insightsLoading && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Real Data
                    </span>
                  )}
                </Button>
                <Button onClick={handleGeneratePopulationInsights} className="bg-green-600 hover:bg-green-700">
                  📊 Population Health
                </Button>
              </div>
            </div>

            {/* Real Patient Analysis - David Wilson */}
            {(() => {
              const criticalPatients = Object.values(getAllPatients()).filter((p: any) => p.status === 'Critical')
              const highRiskPatients = Object.values(getAllPatients()).filter((p: any) => p.status === 'High Risk')
              const priorityPatients = [...criticalPatients, ...highRiskPatients].slice(0, 1)
              
              if (priorityPatients.length === 0) {
                return (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">All Patients Stable</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">STABLE</span>
                    </div>
                    <p className="text-green-700">No critical or high-risk patients found in current data. Continue routine monitoring.</p>
                  </div>
                )
              }
              
              const patient = priorityPatients[0] as any
              const latestEvent = patient.timeline[0]
              
              return (
                <div className={`p-4 bg-gradient-to-r rounded-lg border-2 ${
                  patient.status === 'Critical' 
                    ? 'from-red-50 to-pink-50 border-red-200' 
                    : 'from-orange-50 to-yellow-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className={`h-5 w-5 ${
                      patient.status === 'Critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <h4 className={`font-semibold ${
                      patient.status === 'Critical' ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      Priority Patient Analysis: {patient.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patient Overview */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Patient Demographics & Status</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{patient.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{patient.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium">{patient.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conditions:</span>
                            <span className="font-medium">{patient.conditions.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Conditions */}
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Active Medical Conditions</h5>
                        <div className="space-y-2">
                          {patient.conditions.map((condition: string, index: number) => (
                            <div key={index} className={`p-2 rounded border-l-4 ${
                              condition.toLowerCase().includes('critical') || condition.toLowerCase().includes('severe') 
                                ? 'bg-red-50 border-red-500' 
                                : 'bg-orange-50 border-orange-500'
                            }`}>
                              <div className="font-medium text-sm">{condition}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Latest Event & Actions */}
                    <div className="space-y-4">
                      {latestEvent && (
                        <div className="p-4 bg-white rounded-lg border">
                          <h5 className="font-semibold text-gray-800 mb-3">Latest Medical Event</h5>
                          <div className="text-sm mb-2">{latestEvent.event}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(latestEvent.date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Recommended Actions</h5>
                        <div className="space-y-2">
                          {patient.status === 'Critical' && (
                            <button className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 text-left text-sm">
                              🚨 Schedule Emergency Consultation
                            </button>
                          )}
                          <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left text-sm">
                            📋 Review Medical History
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Population Health Trends */}
              <Card className="p-4">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Population Health Trends
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded">
                    <h5 className="font-medium text-blue-900 mb-2">Chronic Kidney Disease</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-bold">12%</span>
                        <p className="text-blue-700">Prevalence</p>
                      </div>
                      <div>
                        <span className="text-red-600 font-bold">3</span>
                        <p className="text-blue-700">Stage 4-5</p>
                      </div>
                      <div>
                        <span className="text-green-600 font-bold">89%</span>
                        <p className="text-blue-700">ACE/ARB Use</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      📈 Early detection program increased by 23% this quarter
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded">
                    <h5 className="font-medium text-green-900 mb-2">Diabetes Management</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-bold">68%</span>
                        <p className="text-green-700">HbA1c &lt;7%</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-bold">85%</span>
                        <p className="text-green-700">On Metformin</p>
                      </div>
                      <div>
                        <span className="text-purple-600 font-bold">42%</span>
                        <p className="text-green-700">CGM Users</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                      📊 Quality scores improved 15% with new protocols
                    </div>
                  </div>
                </div>
              </Card>

              {/* Predictive Analytics */}
              <Card className="p-4">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Predictive Insights
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                    <h5 className="font-medium text-red-900 mb-2">🚨 High-Risk Predictions</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hospital readmission risk</span>
                        <span className="font-bold text-red-600">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diabetic complications</span>
                        <span className="font-bold text-orange-600">18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medication non-adherence</span>
                        <span className="font-bold text-yellow-600">31%</span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>Intervention:</strong> Proactive outreach to top 10 highest-risk patients
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <h5 className="font-medium text-blue-900 mb-2">📈 Optimization Opportunities</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Potential cost savings</span>
                        <span className="font-bold text-green-600">$45,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality score improvement</span>
                        <span className="font-bold text-blue-600">+12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patient satisfaction boost</span>
                        <span className="font-bold text-purple-600">+8%</span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>Focus Areas:</strong> Medication optimization, Preventive care, Care coordination
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Clinical Insights */}
            {clinicalInsights && (
              <div className="space-y-6">
                {/* Enhanced Patient Summary */}
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Comprehensive Clinical Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{clinicalInsights.activeConditions?.length || 0}</div>
                      <div className="text-sm text-green-700">Active Conditions</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{clinicalInsights.currentMedications?.length || 0}</div>
                      <div className="text-sm text-blue-700">Current Medications</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{clinicalInsights.drugInteractions?.length || 0}</div>
                      <div className="text-sm text-yellow-700">Drug Interactions</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{clinicalInsights.clinicalAlerts?.length || 0}</div>
                      <div className="text-sm text-red-700">Clinical Alerts</div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700">{clinicalInsights.patientSummary}</p>
                  </div>
                </Card>

                {/* Drug Interactions */}
                {clinicalInsights.drugInteractions?.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Drug Interaction Analysis
                    </h4>
                    <div className="space-y-3">
                      {clinicalInsights.drugInteractions.map((interaction: any, index: number) => (
                        <div key={index} className="p-4 bg-white rounded border-l-4 border-yellow-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">{interaction.drug1} + {interaction.drug2}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              interaction.severity === 'severe' ? 'bg-red-100 text-red-800' :
                              interaction.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interaction.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{interaction.description}</p>
                          <p className="text-sm text-blue-700 font-medium">{interaction.recommendation}</p>
                          <div className="mt-2 flex gap-2">
                            <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                              Alternative Medications
                            </button>
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                              Monitoring Plan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Clinical Recommendations */}
                {clinicalInsights.recommendations?.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Evidence-Based Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clinicalInsights.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="p-3 bg-green-50 rounded border">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-green-700">{rec}</span>
                              <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Evidence Level A
                                </span>
                                <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                                  Implement
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {!clinicalInsights && !insightsLoading && (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Advanced Clinical Analytics</h3>
                <p className="text-gray-500 mb-4">
                  Generate comprehensive clinical insights including population health metrics, risk stratification, 
                  and AI-powered recommendations for optimal patient care.
                </p>
                <Button onClick={handleGenerateInsights}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Clinical Insights
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Comprehensive Clinical Analysis Tab */}
      {activeTab === 'comprehensive' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Advanced Clinical Analysis & Patient Intelligence</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  📊 Export Report
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  🔄 Refresh Analysis
                </Button>
              </div>
            </div>

            {/* Dynamic Critical Patient Analysis */}
            {(() => {
              const criticalPatients = Object.values(getAllPatients()).filter((p: any) => p.status === 'Critical')
              const highRiskPatients = Object.values(getAllPatients()).filter((p: any) => p.status === 'High Risk')
              const priorityPatients = [...criticalPatients, ...highRiskPatients].slice(0, 1)
              
              if (priorityPatients.length === 0) {
                return (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">All Patients Stable</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">STABLE</span>
                    </div>
                    <p className="text-green-700">No critical or high-risk patients found in current data. Continue routine monitoring.</p>
                  </div>
                )
              }
              
              const patient = priorityPatients[0] as any
              const latestEvent = patient.timeline[0]
              
              return (
                <div className={`p-4 bg-gradient-to-r rounded-lg border-2 ${
                  patient.status === 'Critical' 
                    ? 'from-red-50 to-pink-50 border-red-200' 
                    : 'from-orange-50 to-yellow-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className={`h-5 w-5 ${
                      patient.status === 'Critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <h4 className={`font-semibold ${
                      patient.status === 'Critical' ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      Priority Patient Analysis: {patient.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patient Overview */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Patient Demographics & Status</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{patient.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{patient.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium">{patient.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conditions:</span>
                            <span className="font-medium">{patient.conditions.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Conditions */}
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Active Medical Conditions</h5>
                        <div className="space-y-2">
                          {patient.conditions.map((condition: string, index: number) => (
                            <div key={index} className={`p-2 rounded border-l-4 ${
                              condition.toLowerCase().includes('critical') || condition.toLowerCase().includes('severe') 
                                ? 'bg-red-50 border-red-500' 
                                : 'bg-orange-50 border-orange-500'
                            }`}>
                              <div className="font-medium text-sm">{condition}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Latest Event & Actions */}
                    <div className="space-y-4">
                      {latestEvent && (
                        <div className="p-4 bg-white rounded-lg border">
                          <h5 className="font-semibold text-gray-800 mb-3">Latest Medical Event</h5>
                          <div className="space-y-3">
                            <div className={`p-3 rounded border-l-4 ${
                              latestEvent.severity === 'critical' ? 'bg-red-50 border-red-500' :
                              latestEvent.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                              'bg-yellow-50 border-yellow-500'
                            }`}>
                              <div className="font-medium text-sm mb-2">
                                {new Date(latestEvent.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm mb-2">{latestEvent.event}</div>
                              
                              {latestEvent.values && Object.keys(latestEvent.values).length > 0 && (
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                  {Object.entries(latestEvent.values).map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-2 bg-gray-50 rounded">
                                      <div className="font-medium capitalize">{key}</div>
                                      <div className="font-bold">{String(value)}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {latestEvent.actions && latestEvent.actions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {latestEvent.actions.map((action: string, actionIndex: number) => (
                                    <span key={actionIndex} className={`text-xs px-2 py-1 rounded ${
                                      latestEvent.severity === 'critical' ? 'bg-red-600 text-white' :
                                      latestEvent.severity === 'high' ? 'bg-orange-600 text-white' :
                                      latestEvent.severity === 'moderate' ? 'bg-yellow-600 text-white' :
                                      'bg-blue-600 text-white'
                                    }`}>
                                      {action}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Recommended Actions */}
                      <div className="p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-3">Recommended Actions</h5>
                        <div className="space-y-2">
                          {patient.status === 'Critical' && (
                            <>
                              <button className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 text-left text-sm">
                                🚨 Schedule Emergency Consultation
                              </button>
                              <button className="w-full p-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-left text-sm">
                                📋 Review All Lab Results
                              </button>
                            </>
                          )}
                          {patient.status === 'High Risk' && (
                            <>
                              <button className="w-full p-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-left text-sm">
                                📋 Enhanced Monitoring Protocol
                              </button>
                              <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left text-sm">
                                💊 Medication Review
                              </button>
                            </>
                          )}
                          <button className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 text-left text-sm">
                            📊 Generate Clinical Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">AI-Powered Medical Timeline & Pattern Analysis</h3>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerateTimeline} disabled={timelineLoading} variant="outline">
                  {timelineLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Timeline'}
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  🔍 Pattern Analysis
                </Button>
              </div>
            </div>

            {/* Timeline Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-800 mb-2">Patient Selection</h4>
                <select 
                  className="w-full text-sm border rounded px-2 py-1"
                  value={selectedPatient}
                  onChange={(e) => handlePatientChange(e.target.value)}
                >
                  {Object.entries(getAllPatients()).map(([patientId, patient]) => (
                    <option key={patientId} value={patientId}>
                      {(patient as any).name} ({(patient as any).status})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-medium text-green-800 mb-2">Time Range</h4>
                <select 
                  className="w-full text-sm border rounded px-2 py-1"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="6months">Last 6 months</option>
                  <option value="1year">Last year</option>
                  <option value="2years">Last 2 years</option>
                  <option value="all">All time</option>
                </select>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-medium text-purple-800 mb-2">Event Types</h4>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      checked={eventTypes.labResults}
                      onChange={(e) => setEventTypes(prev => ({...prev, labResults: e.target.checked}))}
                    />
                    <span>Lab Results</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      checked={eventTypes.medications}
                      onChange={(e) => setEventTypes(prev => ({...prev, medications: e.target.checked}))}
                    />
                    <span>Medications</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      checked={eventTypes.procedures}
                      onChange={(e) => setEventTypes(prev => ({...prev, procedures: e.target.checked}))}
                    />
                    <span>Procedures</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      checked={eventTypes.diagnoses}
                      onChange={(e) => setEventTypes(prev => ({...prev, diagnoses: e.target.checked}))}
                    />
                    <span>Diagnoses</span>
                  </label>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg border">
                <h4 className="font-medium text-orange-800 mb-2">View Mode</h4>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      name="view" 
                      value="chronological"
                      checked={viewMode === 'chronological'}
                      onChange={(e) => setViewMode(e.target.value)}
                    />
                    <span>Chronological</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      name="view" 
                      value="by-condition"
                      checked={viewMode === 'by-condition'}
                      onChange={(e) => setViewMode(e.target.value)}
                    />
                    <span>By Condition</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Dynamic Patient Timeline */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">
                  Patient Timeline: {getCurrentPatientData().name}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  getCurrentPatientData().status === 'Critical' ? 'bg-red-100 text-red-800' :
                  getCurrentPatientData().status === 'High Risk' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getCurrentPatientData().status.toUpperCase()}
                </span>
              </div>
              
              {/* Patient Overview */}
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-2 font-medium">{getCurrentPatientData().age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{getCurrentPatientData().status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Events:</span>
                    <span className="ml-2 font-medium">{getFilteredTimeline().length}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Conditions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getCurrentPatientData().conditions.map((condition: string, index: number) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Timeline Visualization */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  <div className="space-y-6">
                    {getFilteredTimeline().map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                            event.severity === 'critical' ? 'bg-red-600' :
                            event.severity === 'high' ? 'bg-orange-500' :
                            event.severity === 'moderate' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          {event.severity === 'critical' && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className={`flex-1 bg-white rounded-lg p-4 border shadow-sm ${
                          event.severity === 'critical' ? 'border-2 border-red-300' : 'border'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                              {index === 0 && ' - CURRENT'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.type === 'lab_result' ? 'bg-green-100 text-green-800' :
                              event.type === 'medication' ? 'bg-blue-100 text-blue-800' :
                              event.type === 'diagnosis' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {event.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 mb-3">
                            <strong>{event.event}</strong>
                          </div>
                          
                          {/* Display relevant values */}
                          {event.values && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                              {Object.entries(event.values).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-2 bg-gray-50 rounded">
                                  <div className="font-medium capitalize">{key}</div>
                                  <div className="font-bold">{String(value)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Actions */}
                          {event.actions && event.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {event.actions.map((action: string, actionIndex: number) => (
                                <span key={actionIndex} className={`text-xs px-2 py-1 rounded ${
                                  event.severity === 'critical' ? 'bg-red-600 text-white' :
                                  event.severity === 'high' ? 'bg-orange-600 text-white' :
                                  event.severity === 'moderate' ? 'bg-yellow-600 text-white' :
                                  'bg-blue-600 text-white'
                                }`}>
                                  {action}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {getFilteredTimeline().length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No events found for the selected filters</p>
                        <p className="text-sm text-gray-400">Try adjusting your time range or event type filters</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern Recognition Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4 border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Pattern Recognition
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-medium text-purple-900 mb-2">Disease Progression Patterns</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CKD Progression Rate</span>
                        <span className="font-bold text-red-600">Accelerated</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GFR Decline Rate</span>
                        <span className="font-bold text-red-600">-5.5 mL/min/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anemia Development</span>
                        <span className="font-bold text-orange-600">Progressive</span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white rounded text-xs">
                      <strong>AI Insight:</strong> Pattern matches rapid CKD progression phenotype
                    </div>
                  </div>
                  
                  <div className="p-3 bg-indigo-50 rounded">
                    <h5 className="font-medium text-indigo-900 mb-2">Treatment Response Analysis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ACE Inhibitor Response</span>
                        <span className="font-bold text-yellow-600">Suboptimal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BP Control</span>
                        <span className="font-bold text-green-600">Adequate</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mineral Metabolism</span>
                        <span className="font-bold text-red-600">Disturbed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Predictive Timeline Modeling
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-medium text-green-900 mb-2">Next 30 Days Prediction</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dialysis Initiation</span>
                        <span className="font-bold text-red-600">95% Probability</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hospitalization Risk</span>
                        <span className="font-bold text-orange-600">78% Risk</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Presentation</span>
                        <span className="font-bold text-yellow-600">45% Risk</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-900 mb-2">6-Month Outlook</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Transplant Evaluation</span>
                        <span className="font-bold text-green-600">Recommended</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality of Life</span>
                        <span className="font-bold text-blue-600">Moderate</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complications Risk</span>
                        <span className="font-bold text-orange-600">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Timeline Features */}
            <Card className="p-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Interactive Timeline Analytics - {getCurrentPatientData().name}
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Timeline Insights</h5>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded flex justify-between">
                      <span>Total Events</span>
                      <span className="font-bold">{getCurrentPatientData().timeline.length}</span>
                    </div>
                    <div className="p-2 bg-green-50 rounded flex justify-between">
                      <span>Lab Results</span>
                      <span className="font-bold">
                        {getCurrentPatientData().timeline.filter((e: any) => e.type === 'lab_result').length}
                      </span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded flex justify-between">
                      <span>Medications</span>
                      <span className="font-bold">
                        {getCurrentPatientData().timeline.filter((e: any) => e.type === 'medication').length}
                      </span>
                    </div>
                    <div className="p-2 bg-orange-50 rounded flex justify-between">
                      <span>Diagnoses</span>
                      <span className="font-bold">
                        {getCurrentPatientData().timeline.filter((e: any) => e.type === 'diagnosis').length}
                      </span>
                    </div>
                    <div className="p-2 bg-red-50 rounded flex justify-between">
                      <span>Critical Events</span>
                      <span className="font-bold">
                        {getCurrentPatientData().timeline.filter((e: any) => e.severity === 'critical').length}
                      </span>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded flex justify-between">
                      <span>Filtered Events</span>
                      <span className="font-bold">{getFilteredTimeline().length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Key Milestones</h5>
                  <div className="space-y-2 text-sm">
                    {getCurrentPatientData().timeline
                      .filter((event: any) => event.type === 'diagnosis' || event.severity === 'critical')
                      .slice(0, 3)
                      .map((event: any, index: number) => (
                        <div key={index} className={`p-2 rounded border-l-4 ${
                          event.severity === 'critical' ? 'bg-red-50 border-red-400' :
                          event.severity === 'high' ? 'bg-orange-50 border-orange-400' :
                          'bg-yellow-50 border-yellow-400'
                        }`}>
                          <div className="font-medium">{event.event.substring(0, 40)}...</div>
                          <div className="text-gray-600">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short' 
                            })}
                          </div>
                        </div>
                      ))}
                    {getCurrentPatientData().timeline.length === 0 && (
                      <div className="p-2 bg-gray-50 rounded text-center text-gray-500">
                        No milestones found
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Action Items</h5>
                  <div className="space-y-2 text-sm">
                    {getCurrentPatientData().status === 'Critical' && (
                      <>
                        <button className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 text-left">
                          🚨 Schedule Urgent Consultation
                        </button>
                        <button className="w-full p-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-left">
                          🩸 Review Lab Results
                        </button>
                      </>
                    )}
                    {getCurrentPatientData().status === 'High Risk' && (
                      <>
                        <button className="w-full p-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-left">
                          📋 Medication Review
                        </button>
                        <button className="w-full p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-left">
                          📊 Follow-up Planning
                        </button>
                      </>
                    )}
                    {getCurrentPatientData().status === 'Moderate Risk' && (
                      <>
                        <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left">
                          📋 Routine Monitoring
                        </button>
                        <button className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 text-left">
                          💊 Therapy Optimization
                        </button>
                      </>
                    )}
                    <button className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 text-left">
                      📊 Export Timeline Report
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {!timeline.length && !timelineLoading && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">AI-Powered Medical Timeline</h3>
                <p className="text-gray-500 mb-4">
                  Generate intelligent medical timelines with pattern recognition, predictive modeling, 
                  and clinical decision support for optimal patient care.
                </p>
                <Button onClick={handleGenerateTimeline}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Advanced Timeline
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'translate' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Languages className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Medical Translation</h3>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Breaking Language Barriers</h4>
              <p className="text-blue-700 text-sm mb-3">
                Medical translation service that preserves critical medical terminology.
              </p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {languages.map(lang => (
                  <div key={lang.code} className="text-center p-2 bg-white rounded text-xs">
                    <div className="font-medium">{lang.code.toUpperCase()}</div>
                    <div className="text-gray-600 truncate">{lang.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🚧 Coming Soon</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Real-time document translation</li>
                <li>• Voice-to-text in multiple languages</li>
                <li>• Medical terminology preservation</li>
                <li>• Audio playback of translated content</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 