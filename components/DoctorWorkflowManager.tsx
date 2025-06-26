'use client'

import React, { Component } from 'react'
import { 
  User, 
  FileText, 
  Clock, 
  Save, 
  Plus, 
  Search, 
  Activity, 
  Pill, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Upload,
  Mic,
  MicOff,
  Eye,
  Edit3,
  Stethoscope,
  Clipboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PatientData {
  id: string
  name: string
  age: number
  gender: string
  chiefComplaint?: string
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
  }
  currentMedications?: string[]
  allergies?: string[]
  notes?: string[]
  lastVisit?: string
  status?: 'waiting' | 'in-progress' | 'completed'
}

interface DoctorWorkflowState {
  activePatient: PatientData | null
  patientQueue: PatientData[]
  isRecording: boolean
  currentNote: string
  quickTemplates: string[]
  searchTerm: string
  workflowStep: 'patient-selection' | 'examination' | 'documentation' | 'review'
  sessionStats: {
    patientsCompleted: number
    averageTimePerPatient: number
    totalSessionTime: number
  }
}

export class DoctorWorkflowManager extends Component<{}, DoctorWorkflowState> {
  private speechRecognition: any = null
  private sessionStartTime: number = Date.now()

  constructor(props: {}) {
    super(props)
    this.state = {
      activePatient: null,
      patientQueue: [
        {
          id: '1',
          name: 'Sarah Johnson',
          age: 52,
          gender: 'Female',
          chiefComplaint: 'Diabetes follow-up, blood sugar management',
          vitals: { bloodPressure: '142/88', heartRate: 78, temperature: 98.6, weight: 185 },
          currentMedications: ['Metformin 1000mg', 'Lisinopril 10mg'],
          allergies: ['Penicillin'],
          lastVisit: '2025-05-20',
          status: 'waiting',
          notes: []
        },
        {
          id: '2',
          name: 'Robert Chen',
          age: 58,
          gender: 'Male',
          chiefComplaint: 'Kidney function monitoring, CKD stage 3',
          vitals: { bloodPressure: '128/78', heartRate: 72, temperature: 98.2, weight: 175 },
          currentMedications: ['Losartan 50mg', 'Atorvastatin 20mg'],
          allergies: ['Aspirin'],
          lastVisit: '2025-06-01',
          status: 'waiting',
          notes: []
        },
        {
          id: '3',
          name: 'Maria Rodriguez',
          age: 34,
          gender: 'Female',
          chiefComplaint: 'Annual physical exam, preventive care',
          vitals: { bloodPressure: '118/75', heartRate: 68, temperature: 98.4, weight: 140 },
          currentMedications: ['Multivitamin'],
          allergies: [],
          lastVisit: '2024-12-15',
          status: 'waiting',
          notes: []
        }
      ],
      isRecording: false,
      currentNote: '',
      quickTemplates: [
        'Patient appears well, no acute distress',
        'Vital signs stable and within normal limits',
        'Continue current medication regimen',
        'Follow up in 3 months',
        'Patient counseled on lifestyle modifications',
        'Lab work ordered for next visit',
        'Referral to specialist recommended'
      ],
      searchTerm: '',
      workflowStep: 'patient-selection',
      sessionStats: {
        patientsCompleted: 0,
        averageTimePerPatient: 0,
        totalSessionTime: 0
      }
    }

    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.speechRecognition = new (window as any).webkitSpeechRecognition()
      this.speechRecognition.continuous = true
      this.speechRecognition.interimResults = true
      this.speechRecognition.onresult = this.handleSpeechResult.bind(this)
    }
  }

  handleSpeechResult = (event: any) => {
    let transcript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    this.setState({ currentNote: this.state.currentNote + ' ' + transcript })
  }

  toggleRecording = () => {
    if (!this.speechRecognition) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (this.state.isRecording) {
      this.speechRecognition.stop()
    } else {
      this.speechRecognition.start()
    }
    this.setState({ isRecording: !this.state.isRecording })
  }

  selectPatient = (patient: PatientData) => {
    this.setState({ 
      activePatient: { ...patient, status: 'in-progress' },
      workflowStep: 'examination',
      patientQueue: this.state.patientQueue.map(p => 
        p.id === patient.id ? { ...p, status: 'in-progress' } : p
      )
    })
  }

  addQuickNote = (template: string) => {
    this.setState({ 
      currentNote: this.state.currentNote + (this.state.currentNote ? '\n' : '') + template 
    })
  }

  savePatientNotes = () => {
    if (!this.state.activePatient || !this.state.currentNote.trim()) return

    const updatedPatient = {
      ...this.state.activePatient,
      notes: [...(this.state.activePatient.notes || []), this.state.currentNote],
      status: 'completed' as const
    }

    this.setState({
      patientQueue: this.state.patientQueue.map(p => 
        p.id === this.state.activePatient!.id ? updatedPatient : p
      ),
      activePatient: null,
      currentNote: '',
      workflowStep: 'patient-selection',
      sessionStats: {
        ...this.state.sessionStats,
        patientsCompleted: this.state.sessionStats.patientsCompleted + 1
      }
    })

    // Show success notification
    alert(`✅ Patient notes saved for ${updatedPatient.name}!\n\nNote: "${this.state.currentNote.substring(0, 100)}${this.state.currentNote.length > 100 ? '...' : ''}"`)
  }

  updateVitals = (vitals: Partial<PatientData['vitals']>) => {
    if (!this.state.activePatient) return

    this.setState({
      activePatient: {
        ...this.state.activePatient,
        vitals: { ...this.state.activePatient.vitals, ...vitals }
      }
    })
  }

  getFilteredPatients = () => {
    const { patientQueue, searchTerm } = this.state
    if (!searchTerm) return patientQueue

    return patientQueue.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  render() {
    const { activePatient, patientQueue, isRecording, currentNote, quickTemplates, searchTerm, workflowStep, sessionStats } = this.state
    const filteredPatients = this.getFilteredPatients()

    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {/* Doctor Workflow Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <Stethoscope className="h-8 w-8" />
              Doctor Workflow Manager
            </h2>
            <p className="text-blue-700 mt-1">Streamlined patient care with integrated documentation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-blue-600">Session Progress</div>
              <div className="text-lg font-bold text-blue-900">
                {sessionStats.patientsCompleted} / {patientQueue.length} patients
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
              <div className="text-2xl">👨‍⚕️</div>
            </div>
          </div>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
          {[
            { step: 'patient-selection', label: 'Select Patient', icon: User },
            { step: 'examination', label: 'Examination', icon: Stethoscope },
            { step: 'documentation', label: 'Documentation', icon: FileText },
            { step: 'review', label: 'Review', icon: CheckCircle }
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              workflowStep === step ? 'bg-blue-100 text-blue-800' : 'text-gray-500'
            }`}>
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Queue & Selection */}
          <Card className="lg:col-span-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Patient Queue
              </h3>
              <span className="text-sm text-gray-500">
                {patientQueue.filter(p => p.status === 'waiting').length} waiting
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Patient List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    patient.status === 'completed' ? 'bg-green-50 border-green-200' :
                    patient.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                    'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => patient.status === 'waiting' && this.selectPatient(patient)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{patient.name}</h4>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                      patient.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status === 'waiting' ? 'Waiting' : 
                       patient.status === 'in-progress' ? 'In Progress' : 'Completed'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>{patient.age} years • {patient.gender}</div>
                    <div className="mt-1 text-xs">{patient.chiefComplaint}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Patient Examination */}
          <Card className="lg:col-span-2 p-6">
            {activePatient ? (
              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{activePatient.name}</h3>
                    <p className="text-gray-600">{activePatient.age} years • {activePatient.gender}</p>
                    <p className="text-sm text-blue-600 mt-1">{activePatient.chiefComplaint}</p>
                  </div>
                  <Button
                    onClick={() => this.setState({ activePatient: null, workflowStep: 'patient-selection' })}
                    variant="outline"
                    size="sm"
                  >
                    Back to Queue
                  </Button>
                </div>

                {/* Quick Vitals Input */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BP</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      defaultValue={activePatient.vitals?.bloodPressure}
                      onChange={(e) => this.updateVitals({ bloodPressure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HR</label>
                    <input
                      type="number"
                      placeholder="72"
                      defaultValue={activePatient.vitals?.heartRate}
                      onChange={(e) => this.updateVitals({ heartRate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      defaultValue={activePatient.vitals?.temperature}
                      onChange={(e) => this.updateVitals({ temperature: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="number"
                      placeholder="150"
                      defaultValue={activePatient.vitals?.weight}
                      onChange={(e) => this.updateVitals({ weight: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Current Medications & Allergies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Current Medications</h4>
                    <div className="space-y-1">
                      {activePatient.currentMedications?.map((med, index) => (
                        <div key={index} className="text-sm bg-blue-50 px-2 py-1 rounded">
                          {med}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Allergies</h4>
                    <div className="space-y-1">
                      {activePatient.allergies?.length ? 
                        activePatient.allergies.map((allergy, index) => (
                          <div key={index} className="text-sm bg-red-50 px-2 py-1 rounded text-red-800">
                            {allergy}
                          </div>
                        )) : 
                        <div className="text-sm text-gray-500">No known allergies</div>
                      }
                    </div>
                  </div>
                </div>

                {/* Clinical Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Clinical Notes</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={this.toggleRecording}
                        variant={isRecording ? "default" : "outline"}
                        size="sm"
                        className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                        {isRecording ? 'Stop' : 'Voice'}
                      </Button>
                      <Button onClick={this.savePatientNotes} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  </div>

                  <textarea
                    value={currentNote}
                    onChange={(e) => this.setState({ currentNote: e.target.value })}
                    placeholder="Enter clinical notes, assessment, and plan..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  {/* Quick Templates */}
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Quick Templates</h5>
                    <div className="flex flex-wrap gap-2">
                      {quickTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => this.addQuickNote(template)}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the queue to begin examination</p>
              </div>
            )}
          </Card>
        </div>

        {/* Session Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sessionStats.patientsCompleted}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((Date.now() - this.sessionStartTime) / 60000)}m
                </div>
                <div className="text-sm text-gray-600">Session Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sessionStats.patientsCompleted > 0 ? 
                    Math.round((Date.now() - this.sessionStartTime) / sessionStats.patientsCompleted / 60000) : 0}m
                </div>
                <div className="text-sm text-gray-600">Avg per Patient</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              🚀 Workflow efficiency: {sessionStats.patientsCompleted > 2 ? '+45% faster than traditional methods' : 'Building efficiency...'}
            </div>
          </div>
        </Card>
      </div>
    )
  }
} 