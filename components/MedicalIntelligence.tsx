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
  Activity
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
          language: selectedLanguage
        })
      })

      const data = await response.json()
      if (data.success) {
        setSearchResults(data)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    setInsightsLoading(true)
    try {
      const apiKey = getApiKey()
      const response = await fetch('/api/medical-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-Gemini-Api-Key': apiKey })
        },
        body: JSON.stringify({
          action: 'clinical_insights'
        })
      })

      const data = await response.json()
      if (data.success) {
        setClinicalInsights(data.data.insights)
      } else {
        console.error('Insights generation failed:', data.error)
      }
    } catch (error) {
      console.error('Insights error:', error)
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Clinical Decision Support</h3>
              </div>
              <Button onClick={handleGenerateInsights} disabled={insightsLoading}>
                {insightsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Insights'}
              </Button>
            </div>

            {clinicalInsights && (
              <div className="space-y-6">
                {/* Patient Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Patient Summary
                  </h4>
                  <p className="text-blue-700">{clinicalInsights.patientSummary}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                {/* Drug Interactions */}
                {clinicalInsights.drugInteractions?.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Drug Interactions
                    </h4>
                    <div className="space-y-2">
                      {clinicalInsights.drugInteractions.map((interaction: any, index: number) => (
                        <div key={index} className="p-3 bg-white rounded border-l-4 border-yellow-400">
                          <div className="flex items-center gap-2 mb-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {clinicalInsights.recommendations?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Clinical Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {clinicalInsights.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!clinicalInsights && !insightsLoading && (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Clinical Decision Support</h3>
                <p className="text-gray-500 mb-4">
                  Generate comprehensive clinical insights including drug interactions, treatment patterns, and risk analysis.
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
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Comprehensive Clinical Analysis</h3>
            </div>

            {/* Demo Patient Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Summary Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Real-Time Patient Summary
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>John Smith</strong>, 59yo male with Type 2 Diabetes, Hypertension, Hyperlipidemia.</p>
                  <p><strong>Current medications:</strong> Lisinopril, Metformin, Atorvastatin</p>
                  <p><strong>Latest vitals:</strong> BP: 135/85, Weight: 185lbs, BMI: 26.5</p>
                  
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-yellow-400">
                    <p className="font-medium text-yellow-800">⚠️ Clinical Alert</p>
                    <p className="text-sm text-yellow-700">HbA1c elevated at 7.2% - Consider medication adjustment</p>
                  </div>
                </div>
              </div>

              {/* Drug Interaction Analysis */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Drug Interaction Analysis
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border-l-4 border-red-400">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Lisinopril + Potassium</span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">MODERATE</span>
                    </div>
                    <p className="text-sm text-gray-700">Risk of hyperkalemia</p>
                    <p className="text-sm text-blue-700 font-medium">Monitor serum potassium levels</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Value Analysis */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Laboratory Value Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded border">
                  <div className="text-sm text-gray-600">HbA1c</div>
                  <div className="text-xl font-bold text-red-600">7.2%</div>
                  <div className="text-xs text-red-600">Above target (&lt;7%)</div>
                  <div className="text-xs text-gray-500 mt-1">Normal: 4.0-5.6%</div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="text-sm text-gray-600">LDL Cholesterol</div>
                  <div className="text-xl font-bold text-green-600">95 mg/dL</div>
                  <div className="text-xs text-green-600">At target</div>
                  <div className="text-xs text-gray-500 mt-1">Normal: &lt;100 mg/dL</div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="text-sm text-gray-600">Blood Pressure</div>
                  <div className="text-xl font-bold text-yellow-600">135/85</div>
                  <div className="text-xs text-yellow-600">Elevated</div>
                  <div className="text-xs text-gray-500 mt-1">Target: &lt;130/80</div>
                </div>
              </div>
            </div>

            {/* Treatment Recommendations */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Evidence-Based Treatment Recommendations
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-purple-800">Type 2 Diabetes Management</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">LEVEL A</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Consider intensifying diabetes therapy - add GLP-1 agonist or increase metformin dose
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>Rationale:</strong> Current HbA1c 7.2% is above target of &lt;7%. ADA guidelines recommend intensification.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600"><strong>Alternatives:</strong> SGLT-2 inhibitor, DPP-4 inhibitor, Insulin</p>
                    <p className="text-xs text-gray-600"><strong>Monitoring:</strong> HbA1c in 3 months, Kidney function</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-purple-800">Hypertension Management</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">LEVEL A</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Consider increasing lisinopril dose or adding thiazide diuretic
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>Rationale:</strong> Current BP 135/85 is above target &lt;130/80. AHA/ACC guidelines recommend dual therapy.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600"><strong>Alternatives:</strong> ARB, Calcium channel blocker</p>
                    <p className="text-xs text-gray-600"><strong>Monitoring:</strong> Blood pressure, Electrolytes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Workflow Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Workflow Tasks
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border-l-4 border-red-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-sm font-medium">HIGH PRIORITY</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">Review abnormal HbA1c results</p>
                    <p className="text-xs text-gray-500">Due: Today</p>
                  </div>
                  <div className="p-2 bg-white rounded border-l-4 border-yellow-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-sm font-medium">MEDIUM</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">Schedule diabetes follow-up</p>
                    <p className="text-xs text-gray-500">Due: This week</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border">
                <h4 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Insurance Claims
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Office visit + HbA1c</span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">PENDING</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">CPT: 99213, 83036</p>
                    <p className="text-xs text-green-600">Est. reimbursement: $156</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Clinical Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">94%</div>
                  <div className="text-sm text-gray-600">Medication Adherence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Quality Measures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15min</div>
                  <div className="text-sm text-gray-600">Avg Task Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">2.3</div>
                  <div className="text-sm text-gray-600">Risk Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

              {activeTab === 'timeline' && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold">Medical Timeline</h3>
                </div>
                <Button onClick={handleGenerateTimeline} disabled={timelineLoading}>
                  {timelineLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Timeline'}
                </Button>
              </div>

              {timeline.length > 0 && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {timeline.length} medical events chronologically
                  </div>
                  
                  <div className="space-y-3">
                    {timeline.map((event: any, index: number) => (
                      <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            event.type === 'medication' ? 'bg-blue-500' :
                            event.type === 'lab_result' ? 'bg-green-500' :
                            event.type === 'diagnosis' ? 'bg-red-500' :
                            event.type === 'procedure' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.type === 'medication' ? 'bg-blue-100 text-blue-800' :
                              event.type === 'lab_result' ? 'bg-green-100 text-green-800' :
                              event.type === 'diagnosis' ? 'bg-red-100 text-red-800' :
                              event.type === 'procedure' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="font-medium text-gray-800">{event.event}</div>
                          {event.value && (
                            <div className="text-sm text-gray-600 mt-1">Value: {event.value}</div>
                          )}
                          {event.doctor && (
                            <div className="text-sm text-gray-500 mt-1">Dr. {event.doctor}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!timeline.length && !timelineLoading && (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Medical Timeline</h3>
                  <p className="text-gray-500 mb-4">
                    Generate a chronological reconstruction of medical events with AI-powered pattern recognition.
                  </p>
                  <Button onClick={handleGenerateTimeline}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Medical Timeline
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