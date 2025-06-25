'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Calendar, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Heart, 
  Pill, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Download,
  Eye,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PatientData {
  id: string
  name: string
  age: number
  dateOfBirth: string
  gender: string
  bloodType: string
  allergies: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  conditions: string[]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    prescribedDate: string
    prescribedBy: string
  }>
  vitals: Array<{
    date: string
    bloodPressure: string
    heartRate: number
    temperature: number
    weight: number
    height: number
  }>
  labResults: Array<{
    date: string
    testName: string
    value: string
    normalRange: string
    status: 'normal' | 'high' | 'low' | 'critical'
    orderedBy: string
  }>
  appointments: Array<{
    date: string
    time: string
    doctor: string
    specialty: string
    type: string
    status: 'scheduled' | 'completed' | 'cancelled'
    notes?: string
  }>
  documents: Array<{
    name: string
    type: string
    date: string
    uploadedBy: string
    size: string
  }>
}

interface PatientDashboardProps {
  documents?: any[]
}

export function PatientDashboard({ documents = [] }: PatientDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>('current-patient')
  const [activeTab, setActiveTab] = useState<'overview' | 'medical-history' | 'lab-results' | 'appointments' | 'documents'>('overview')
  const [patients, setPatients] = useState<Record<string, PatientData>>({})

  // Mock patient data
  const mockPatients: Record<string, PatientData> = {
    'sarah-johnson': {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      age: 52,
      dateOfBirth: '1971-08-15',
      gender: 'Female',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Shellfish'],
      emergencyContact: {
        name: 'Michael Johnson',
        phone: '(555) 123-4567',
        relationship: 'Spouse'
      },
      conditions: ['Type 2 Diabetes', 'Hypertension', 'Obesity'],
      medications: [
        {
          name: 'Metformin',
          dosage: '1000mg',
          frequency: 'Twice daily',
          prescribedDate: '2024-01-15',
          prescribedBy: 'Dr. Smith'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          prescribedDate: '2024-02-20',
          prescribedBy: 'Dr. Smith'
        }
      ],
      vitals: [
        {
          date: '2025-06-20',
          bloodPressure: '142/88',
          heartRate: 78,
          temperature: 98.6,
          weight: 185,
          height: 65
        },
        {
          date: '2025-04-15',
          bloodPressure: '138/85',
          heartRate: 82,
          temperature: 98.4,
          weight: 188,
          height: 65
        }
      ],
      labResults: [
        {
          date: '2025-06-20',
          testName: 'HbA1c',
          value: '9.2%',
          normalRange: '<7%',
          status: 'high',
          orderedBy: 'Dr. Smith'
        },
        {
          date: '2025-06-20',
          testName: 'Glucose (Fasting)',
          value: '245 mg/dL',
          normalRange: '70-100 mg/dL',
          status: 'critical',
          orderedBy: 'Dr. Smith'
        }
      ],
      appointments: [
        {
          date: '2025-07-15',
          time: '10:00 AM',
          doctor: 'Dr. Smith',
          specialty: 'Endocrinology',
          type: 'Follow-up',
          status: 'scheduled'
        },
        {
          date: '2025-06-20',
          time: '2:30 PM',
          doctor: 'Dr. Smith',
          specialty: 'Endocrinology',
          type: 'Routine Check-up',
          status: 'completed',
          notes: 'Diabetes management review. Medication adjustment needed.'
        }
      ],
      documents: [
        {
          name: 'Lab Results - June 2025',
          type: 'Lab Report',
          date: '2025-06-20',
          uploadedBy: 'Dr. Smith',
          size: '245 KB'
        },
        {
          name: 'Diabetes Management Plan',
          type: 'Treatment Plan',
          date: '2025-06-20',
          uploadedBy: 'Dr. Smith',
          size: '156 KB'
        }
      ]
    },
    'robert-chen': {
      id: 'robert-chen',
      name: 'Robert Chen',
      age: 58,
      dateOfBirth: '1965-03-22',
      gender: 'Male',
      bloodType: 'O-',
      allergies: ['Aspirin'],
      emergencyContact: {
        name: 'Linda Chen',
        phone: '(555) 987-6543',
        relationship: 'Wife'
      },
      conditions: ['CKD Stage 3', 'Hypertension', 'Hyperlipidemia'],
      medications: [
        {
          name: 'Losartan',
          dosage: '50mg',
          frequency: 'Once daily',
          prescribedDate: '2025-03-20',
          prescribedBy: 'Dr. Williams'
        },
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          prescribedDate: '2024-11-15',
          prescribedBy: 'Dr. Williams'
        }
      ],
      vitals: [
        {
          date: '2025-06-18',
          bloodPressure: '128/78',
          heartRate: 72,
          temperature: 98.2,
          weight: 175,
          height: 70
        }
      ],
      labResults: [
        {
          date: '2025-06-18',
          testName: 'GFR',
          value: '45 mL/min',
          normalRange: '>90 mL/min',
          status: 'low',
          orderedBy: 'Dr. Williams'
        },
        {
          date: '2025-06-18',
          testName: 'Creatinine',
          value: '1.8 mg/dL',
          normalRange: '0.6-1.2 mg/dL',
          status: 'high',
          orderedBy: 'Dr. Williams'
        }
      ],
      appointments: [
        {
          date: '2025-08-20',
          time: '11:00 AM',
          doctor: 'Dr. Williams',
          specialty: 'Nephrology',
          type: 'Follow-up',
          status: 'scheduled'
        }
      ],
      documents: [
        {
          name: 'Kidney Function Tests',
          type: 'Lab Report',
          date: '2025-06-18',
          uploadedBy: 'Dr. Williams',
          size: '198 KB'
        }
      ]
    }
  }

  // Function to load real patient data from uploaded documents
  const loadRealPatientData = async () => {
    console.log('[Patient Dashboard] Loading real patient data from documents...')
    
    if (!documents || documents.length === 0) {
      alert('❌ No documents found!\n\nPlease upload medical documents first:\n1. Go to "Upload Documents" section\n2. Upload your medical reports\n3. Then return to Patient Dashboard\n4. Click "Load Your Real Patient Data"')
      return
    }

    let extractedPatient: PatientData | null = null
    let foundPatientData = false

    // Try to extract from each document
    documents.forEach((doc: any, index: number) => {
      console.log(`[Patient Dashboard] Processing document ${index + 1}: ${doc.name}`)
      
      const content = doc.content || doc.summary || doc.extractedText || doc.text || doc.name || ''
      if (!content) return

      console.log(`[Patient Dashboard] Document content preview: ${content.substring(0, 300)}...`)

      // Initialize patient if not already done
      if (!extractedPatient) {
        extractedPatient = {
          id: 'real-patient',
          name: 'Unknown Patient',
          age: 0,
          dateOfBirth: 'Unknown',
          gender: 'Unknown',
          bloodType: 'Unknown',
          allergies: [],
          emergencyContact: {
            name: 'Unknown',
            phone: 'Unknown',
            relationship: 'Unknown'
          },
          conditions: [],
          medications: [],
          vitals: [],
          labResults: [],
          appointments: [],
          documents: []
        }
      }

      // Enhanced patient name extraction
      const namePatterns = [
        /(?:Patient|Name|Patient Name)[:\s]*([A-Z][A-Z\s]{2,30})(?:\s|,|$|\n)/i,
        /^([A-Z][A-Z\s]{2,30})\s*(?:Age|age|\d)/i,
        /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s*(?:Age|DOB|Male|Female|\d)/i
      ]

      for (const pattern of namePatterns) {
        const nameMatch = content.match(pattern)
        if (nameMatch && extractedPatient.name === 'Unknown Patient') {
          extractedPatient.name = nameMatch[1].trim()
          foundPatientData = true
          console.log(`[Patient Dashboard] Found patient name: ${extractedPatient.name}`)
          break
        }
      }

      // Enhanced age extraction
      const agePatterns = [
        /(?:Age|age)[:\s]*(\d{1,3})\s*(?:years?|yo|y\.o\.|\s|$)/i,
        /(\d{1,3})\s*(?:years?\s*old|yo|y\.o\.)/i,
        /DOB[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-](\d{4})/i
      ]

      for (const pattern of agePatterns) {
        const ageMatch = content.match(pattern)
        if (ageMatch && extractedPatient.age === 0) {
          if (pattern.source.includes('DOB')) {
            // Calculate age from birth year
            const birthYear = parseInt(ageMatch[1])
            extractedPatient.age = new Date().getFullYear() - birthYear
          } else {
            extractedPatient.age = parseInt(ageMatch[1])
          }
          foundPatientData = true
          console.log(`[Patient Dashboard] Found patient age: ${extractedPatient.age}`)
          break
        }
      }

      // Enhanced gender extraction
      const genderMatch = content.match(/(?:Gender|Sex)[:\s]*(Male|Female|M|F)/i)
      if (genderMatch && extractedPatient.gender === 'Unknown') {
        extractedPatient.gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase()
        if (extractedPatient.gender === 'M') extractedPatient.gender = 'Male'
        if (extractedPatient.gender === 'F') extractedPatient.gender = 'Female'
        foundPatientData = true
        console.log(`[Patient Dashboard] Found gender: ${extractedPatient.gender}`)
      }

      // Comprehensive lab results extraction
      const labTests = {
        gfr: { 
          patterns: [/(?:GFR|eGFR)[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mL/min', 
          normalRange: '>90 mL/min',
          getName: () => 'GFR'
        },
        creatinine: { 
          patterns: [/creatinine[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mg/dL', 
          normalRange: '0.6-1.2 mg/dL',
          getName: () => 'Creatinine'
        },
        hemoglobin: { 
          patterns: [/h(?:ae)?moglobin[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' g/dL', 
          normalRange: '12-16 g/dL',
          getName: () => 'Hemoglobin'
        },
        hba1c: { 
          patterns: [/HbA1c[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: '%', 
          normalRange: '<7%',
          getName: () => 'HbA1c'
        },
        glucose: { 
          patterns: [/glucose[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mg/dL', 
          normalRange: '70-100 mg/dL',
          getName: () => 'Glucose'
        },
        urea: { 
          patterns: [/urea[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mg/dL', 
          normalRange: '7-20 mg/dL',
          getName: () => 'Urea'
        },
        sodium: { 
          patterns: [/sodium[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mEq/L', 
          normalRange: '136-145 mEq/L',
          getName: () => 'Sodium'
        },
        potassium: { 
          patterns: [/potassium[:\s]*(\d+(?:\.\d+)?)/i], 
          unit: ' mEq/L', 
          normalRange: '3.5-5.0 mEq/L',
          getName: () => 'Potassium'
        }
      }

      Object.entries(labTests).forEach(([key, test]) => {
        for (const pattern of test.patterns) {
          const match = content.match(pattern)
          if (match) {
            const value = parseFloat(match[1])
            let status: 'normal' | 'high' | 'low' | 'critical' = 'normal'

            // Determine status based on lab test
            switch (key) {
              case 'gfr':
                status = value < 15 ? 'critical' : value < 60 ? 'low' : 'normal'
                break
              case 'creatinine':
                status = value > 3 ? 'critical' : value > 1.2 ? 'high' : 'normal'
                break
              case 'hemoglobin':
                status = value < 10 ? 'critical' : value < 12 ? 'low' : 'normal'
                break
              case 'hba1c':
                status = value > 9 ? 'critical' : value > 7 ? 'high' : 'normal'
                break
              case 'glucose':
                status = value > 200 ? 'critical' : value > 100 ? 'high' : 'normal'
                break
              case 'urea':
                status = value > 50 ? 'critical' : value > 20 ? 'high' : 'normal'
                break
              case 'sodium':
                status = value < 130 || value > 150 ? 'critical' : 
                         value < 136 || value > 145 ? 'high' : 'normal'
                break
              case 'potassium':
                status = value < 3.0 || value > 5.5 ? 'critical' : 
                         value < 3.5 || value > 5.0 ? 'high' : 'normal'
                break
            }

            if (extractedPatient) {
              extractedPatient.labResults.push({
                date: new Date().toISOString().split('T')[0],
                testName: test.getName(),
                value: `${value}${test.unit}`,
                normalRange: test.normalRange,
                status,
                orderedBy: 'Uploaded Document'
              })
            }

            foundPatientData = true
            console.log(`[Patient Dashboard] Found lab result: ${test.getName()} = ${value}${test.unit} (${status})`)
            break
          }
        }
      })

      // Add document to patient record
      extractedPatient.documents.push({
        name: doc.name || 'Medical Report',
        type: doc.type || 'Lab Report',
        date: new Date().toISOString().split('T')[0],
        uploadedBy: 'Patient Upload',
        size: doc.size || 'Unknown'
      })
      foundPatientData = true
    })

    if (!foundPatientData || !extractedPatient) {
      alert('❌ No patient data could be extracted from your documents.\n\nTips for better extraction:\n• Ensure documents contain patient name\n• Include lab results with values\n• Upload clear, readable documents\n• Try documents with structured medical data')
      return
    }

    // Auto-detect medical conditions based on lab results
    if (extractedPatient) {
      const patient = extractedPatient as PatientData
      patient.labResults.forEach((lab) => {
        if (lab.testName === 'GFR' && parseFloat(lab.value) < 60) {
          if (!patient.conditions.includes('Chronic Kidney Disease')) {
            patient.conditions.push('Chronic Kidney Disease')
          }
        }
        if (lab.testName === 'HbA1c' && parseFloat(lab.value) > 6.5) {
          if (!patient.conditions.includes('Diabetes')) {
            patient.conditions.push('Diabetes')
          }
        }
        if (lab.testName === 'Hemoglobin' && parseFloat(lab.value) < 12) {
          if (!patient.conditions.includes('Anemia')) {
            patient.conditions.push('Anemia')
          }
        }
      })
    }

    // Add to patients list
    if (extractedPatient) {
      const patient = extractedPatient as PatientData
      const allPatients = { ...mockPatients }
      allPatients['real-patient'] = patient
      setPatients(allPatients)
      setSelectedPatient('real-patient')

      // Save to localStorage for persistence
      localStorage.setItem('patientDashboard_realPatient', JSON.stringify(patient))

      // Show success notification
      const labCount = patient.labResults.length
      const conditionCount = patient.conditions.length
      const docCount = patient.documents.length

      alert(`✅ Successfully loaded your real patient data!\n\n👤 Patient: ${patient.name}\n🎂 Age: ${patient.age} years\n⚕️ Gender: ${patient.gender}\n\n📊 Data Extracted:\n• ${labCount} lab results\n• ${conditionCount} medical conditions\n• ${docCount} documents processed\n\n💾 Data saved - will persist across navigation!`)

      console.log('[Patient Dashboard] Real patient data loaded successfully:', patient)
    }
  }

  // Function to clear real patient data
  const clearRealPatientData = () => {
    if (confirm('⚠️ This will remove your real patient data and reset to demo data. Are you sure?')) {
      localStorage.removeItem('patientDashboard_realPatient')
      const allPatients = { ...mockPatients }
      delete allPatients['real-patient']
      setPatients(allPatients)
      setSelectedPatient('sarah-johnson')
      alert('🗑️ Real patient data cleared! Reset to demo data.')
    }
  }

  // Load real patient data from localStorage on component mount
  useEffect(() => {
    const savedRealPatient = localStorage.getItem('patientDashboard_realPatient')
    if (savedRealPatient) {
      try {
        const realPatient = JSON.parse(savedRealPatient)
        const allPatients = { ...mockPatients }
        allPatients['real-patient'] = realPatient
        setPatients(allPatients)
        setSelectedPatient('real-patient')
        console.log('[Patient Dashboard] Loaded real patient data from localStorage')
      } catch (error) {
        console.error('[Patient Dashboard] Error loading saved patient data:', error)
      }
    }
  }, [])

  const getCurrentPatient = (): PatientData => {
    return patients[selectedPatient] || patients['sarah-johnson'] || mockPatients['sarah-johnson']
  }

  const currentPatient = getCurrentPatient()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'medical-history', label: 'Medical History', icon: FileText },
    { id: 'lab-results', label: 'Lab Results', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Dashboard</h2>
          <p className="text-gray-600">Manage your health information and medical records</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            {Object.entries(patients).map(([id, patient]) => (
              <option key={id} value={id}>
                {patient.name} {id === 'current-patient' ? '(Your Data)' : '(Demo)'}
              </option>
            ))}
          </select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('=== PATIENT DASHBOARD DEBUG ===')
              console.log('Documents received:', documents)
              console.log('Current patients state:', patients)
              console.log('Selected patient:', selectedPatient)
              console.log('Current patient data:', getCurrentPatient())
              console.log('Available documents count:', documents?.length || 0)
            }}
          >
            🔍 Debug
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={loadRealPatientData}
            className="bg-green-600 hover:bg-green-700"
          >
            🏥 Load Your Real Patient Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearRealPatientData}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            🗑️ Clear Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{currentPatient.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Age:</span> {currentPatient.age} years
              </div>
              <div>
                <span className="font-medium">Gender:</span> {currentPatient.gender}
              </div>
              <div>
                <span className="font-medium">Blood Type:</span> {currentPatient.bloodType}
              </div>
              <div>
                <span className="font-medium">DOB:</span> {currentPatient.dateOfBirth}
              </div>
            </div>
          </div>
          {selectedPatient === 'current-patient' && (
            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
              Your Data
            </span>
          )}
        </div>
      </Card>

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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Summary */}
          <Card className="p-4 lg:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Health Summary
            </h4>
            <div className="space-y-4">
              {/* Conditions */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Active Conditions</h5>
                <div className="flex flex-wrap gap-2">
                  {currentPatient.conditions.map((condition, index) => (
                    <span key={index} className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                      {condition}
                    </span>
                  ))}
                  {currentPatient.conditions.length === 0 && (
                    <span className="text-sm text-gray-500">No active conditions recorded</span>
                  )}
                </div>
              </div>

              {/* Recent Vitals */}
              {currentPatient.vitals.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Latest Vitals</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700">Blood Pressure</div>
                      <div className="font-bold text-blue-900">{currentPatient.vitals[0].bloodPressure}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700">Heart Rate</div>
                      <div className="font-bold text-green-900">{currentPatient.vitals[0].heartRate} bpm</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-700">Weight</div>
                      <div className="font-bold text-purple-900">{currentPatient.vitals[0].weight} lbs</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-700">Temperature</div>
                      <div className="font-bold text-orange-900">{currentPatient.vitals[0].temperature}°F</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Allergies */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Allergies</h5>
                <div className="flex flex-wrap gap-2">
                  {currentPatient.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                      {allergy}
                    </span>
                  ))}
                  {currentPatient.allergies.length === 0 && (
                    <span className="text-sm text-gray-500">No known allergies</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Records
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Pill className="h-4 w-4 mr-2" />
                  Refill Prescription
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Medication Reminder
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Emergency Contact</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {currentPatient.emergencyContact.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {currentPatient.emergencyContact.phone}
                </div>
                <div>
                  <span className="font-medium">Relationship:</span> {currentPatient.emergencyContact.relationship}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'medical-history' && (
        <div className="space-y-6">
          {/* Current Medications */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Current Medications
            </h4>
            <div className="space-y-3">
              {currentPatient.medications.map((medication, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-900">{medication.name}</h5>
                    <span className="text-sm text-blue-700">{medication.dosage}</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <div>Frequency: {medication.frequency}</div>
                    <div>Prescribed by: {medication.prescribedBy} on {medication.prescribedDate}</div>
                  </div>
                </div>
              ))}
              {currentPatient.medications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No current medications recorded
                </div>
              )}
            </div>
          </Card>

          {/* Medical Conditions */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Medical Conditions
            </h4>
            <div className="space-y-3">
              {currentPatient.conditions.map((condition, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-red-900">{condition}</div>
                  <div className="text-sm text-red-700 mt-1">
                    Active condition requiring ongoing management
                  </div>
                </div>
              ))}
              {currentPatient.conditions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active medical conditions recorded
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'lab-results' && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Laboratory Results
          </h4>
          <div className="space-y-3">
            {currentPatient.labResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                result.status === 'critical' ? 'bg-red-50 border-red-200' :
                result.status === 'high' ? 'bg-orange-50 border-orange-200' :
                result.status === 'low' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${
                    result.status === 'critical' ? 'text-red-900' :
                    result.status === 'high' ? 'text-orange-900' :
                    result.status === 'low' ? 'text-yellow-900' :
                    'text-green-900'
                  }`}>
                    {result.testName}
                  </h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.status === 'critical' ? 'bg-red-100 text-red-800' :
                    result.status === 'high' ? 'bg-orange-100 text-orange-800' :
                    result.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <div className={`text-sm ${
                  result.status === 'critical' ? 'text-red-700' :
                  result.status === 'high' ? 'text-orange-700' :
                  result.status === 'low' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  <div className="flex justify-between">
                    <span>Value: <strong>{result.value}</strong></span>
                    <span>Normal: {result.normalRange}</span>
                  </div>
                  <div className="mt-1">
                    Date: {result.date} | Ordered by: {result.orderedBy}
                  </div>
                </div>
              </div>
            ))}
            {currentPatient.labResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No laboratory results available
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'appointments' && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </h4>
          <div className="space-y-3">
            {currentPatient.appointments.map((appointment, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                appointment.status === 'scheduled' ? 'bg-blue-50 border-blue-200' :
                appointment.status === 'completed' ? 'bg-green-50 border-green-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${
                    appointment.status === 'scheduled' ? 'text-blue-900' :
                    appointment.status === 'completed' ? 'text-green-900' :
                    'text-gray-900'
                  }`}>
                    {appointment.doctor} - {appointment.specialty}
                  </h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.toUpperCase()}
                  </span>
                </div>
                <div className={`text-sm ${
                  appointment.status === 'scheduled' ? 'text-blue-700' :
                  appointment.status === 'completed' ? 'text-green-700' :
                  'text-gray-700'
                }`}>
                  <div>Date: {appointment.date} at {appointment.time}</div>
                  <div>Type: {appointment.type}</div>
                  {appointment.notes && (
                    <div className="mt-1 italic">Notes: {appointment.notes}</div>
                  )}
                </div>
              </div>
            ))}
            {currentPatient.appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Medical Documents
          </h4>
          <div className="space-y-3">
            {currentPatient.documents.map((document, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{document.name}</h5>
                  <div className="text-sm text-gray-600">
                    <div>Type: {document.type} | Size: {document.size}</div>
                    <div>Date: {document.date} | Uploaded by: {document.uploadedBy}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {currentPatient.documents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents available
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
} 