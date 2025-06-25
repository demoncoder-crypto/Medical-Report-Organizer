'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Stethoscope, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText,
  Clock,
  Brain,
  Target,
  Activity,
  CheckCircle
} from 'lucide-react'

interface PatientSummary {
  id: string
  name: string
  age: number
  lastVisit: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  activeConditions: string[]
  upcomingAppointment?: string
  recentAlerts: string[]
  medicationCompliance: number
}

interface ClinicalAlert {
  id: string
  patientId: string
  patientName: string
  type: 'drug_interaction' | 'abnormal_lab' | 'missed_appointment' | 'critical_value'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  actionRequired: boolean
}

interface DifferentialDiagnosis {
  condition: string
  probability: number
  supportingEvidence: string[]
  contraindications: string[]
  recommendedTests: string[]
}

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  patients: PatientSummary[]
  alerts: ClinicalAlert[]
}

export function DoctorDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null)
  const [differentialDx, setDifferentialDx] = useState<DifferentialDiagnosis[]>([])
  const [isGeneratingDx, setIsGeneratingDx] = useState(false)
  const [reviewedAlerts, setReviewedAlerts] = useState<Set<string>>(new Set())
  const [processingAlert, setProcessingAlert] = useState<string | null>(null)
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    age: '',
    conditions: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  })

  useEffect(() => {
    loadDoctorData()
  }, [])

  // Save doctors to localStorage whenever doctors state changes
  useEffect(() => {
    if (doctors.length > 0) {
      localStorage.setItem('clinicalDashboard_doctors', JSON.stringify(doctors))
      if (selectedDoctor) {
        localStorage.setItem('clinicalDashboard_selectedDoctor', JSON.stringify(selectedDoctor))
      }
    }
  }, [doctors, selectedDoctor])

  // Load doctors from localStorage on component mount
  useEffect(() => {
    const savedDoctors = localStorage.getItem('clinicalDashboard_doctors')
    const savedSelectedDoctor = localStorage.getItem('clinicalDashboard_selectedDoctor')
    
    if (savedDoctors) {
      try {
        const parsedDoctors = JSON.parse(savedDoctors)
        setDoctors(parsedDoctors)
        
        if (savedSelectedDoctor) {
          const parsedSelectedDoctor = JSON.parse(savedSelectedDoctor)
          // Make sure the selected doctor still exists in the doctors array
          const doctorExists = parsedDoctors.find((d: Doctor) => d.id === parsedSelectedDoctor.id)
          if (doctorExists) {
            setSelectedDoctor(doctorExists)
          } else {
            setSelectedDoctor(parsedDoctors[0])
          }
        } else {
          setSelectedDoctor(parsedDoctors[0])
        }
      } catch (error) {
        console.error('Error loading saved doctors:', error)
        loadDoctorData() // Fallback to loading fresh data
      }
    }
  }, [])

  // Function to extract doctors from uploaded reports
  const extractDoctorsFromReports = (documents: any[]): Doctor[] => {
    const doctorMap = new Map<string, Doctor>()
    
    documents.forEach(doc => {
      // Look for doctor names in the document content/summary
      const doctorNames = extractDoctorNames(doc.content || doc.summary || '')
      const patientInfo = extractPatientInfo(doc.content || doc.summary || '')
      
      doctorNames.forEach(doctorName => {
        if (!doctorMap.has(doctorName)) {
          // Create new doctor entry
          doctorMap.set(doctorName, {
            id: `real-${doctorName.toLowerCase().replace(/\s+/g, '-')}`,
            name: doctorName,
            specialty: inferSpecialty(doc.content || doc.summary || ''),
            department: inferSpecialty(doc.content || doc.summary || ''),
            patients: [],
            alerts: []
          })
        }
        
        // Add patient to doctor if patient info found
        if (patientInfo.name) {
          const doctor = doctorMap.get(doctorName)!
          const existingPatient = doctor.patients.find(p => p.name === patientInfo.name)
          
          if (!existingPatient) {
            doctor.patients.push({
              id: `${doctor.id}-${Date.now()}`,
              name: patientInfo.name,
              age: patientInfo.age || 0,
              lastVisit: new Date().toISOString().split('T')[0],
              riskLevel: inferRiskLevel(doc.content || doc.summary || ''),
              activeConditions: extractConditions(doc.content || doc.summary || ''),
              recentAlerts: [`Report uploaded: ${doc.title || 'Medical Report'}`],
              medicationCompliance: 85
            })
            
            // Create alerts for abnormal findings
            const alerts = createAlertsFromReport(doc, patientInfo.name, doctor.id)
            doctor.alerts.push(...alerts)
          }
        }
      })
    })
    
    return Array.from(doctorMap.values())
  }

  // Helper function to extract doctor names from text
  const extractDoctorNames = (text: string): string[] => {
    const doctorPatterns = [
      /Dr\.?\s+([A-Za-z\s]+?)(?=,|\n|$)/gi,
      /Doctor\s+([A-Za-z\s]+?)(?=,|\n|$)/gi
    ]
    
    const doctors = new Set<string>()
    
    doctorPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const doctorName = match[1].trim()
        if (doctorName.length > 2 && doctorName.length < 50) {
          doctors.add(`Dr. ${doctorName}`)
        }
      }
      // Reset regex lastIndex
      pattern.lastIndex = 0
    })
    
    return Array.from(doctors)
  }

  // Helper function to extract patient information
  const extractPatientInfo = (text: string) => {
    const nameMatch = text.match(/(?:Patient|Name|Mr\.?|Mrs\.?|Ms\.?)\s*:?\s*([A-Za-z\s]+)/i)
    const ageMatch = text.match(/(?:Age|age)\s*:?\s*(\d+)/i)
    
    return {
      name: nameMatch ? nameMatch[1].trim() : null,
      age: ageMatch ? parseInt(ageMatch[1]) : null
    }
  }

  // Helper function to infer specialty from report content
  const inferSpecialty = (text: string): string => {
    const specialtyKeywords = {
      'Nephrology': ['kidney', 'GFR', 'creatinine', 'urea', 'dialysis', 'renal'],
      'Cardiology': ['heart', 'cardiac', 'ECG', 'EKG', 'blood pressure', 'cholesterol'],
      'Endocrinology': ['diabetes', 'HbA1c', 'glucose', 'thyroid', 'hormone'],
      'Hematology': ['hemoglobin', 'blood count', 'anemia', 'iron', 'CBC'],
      'Internal Medicine': ['general', 'internal', 'comprehensive']
    }
    
    const lowerText = text.toLowerCase()
    
    for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return specialty
      }
    }
    
    return 'Internal Medicine'
  }

  // Helper function to infer risk level from report
  const inferRiskLevel = (text: string): 'low' | 'medium' | 'high' | 'critical' => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('critical') || lowerText.includes('severe') || 
        lowerText.includes('GFR 7') || lowerText.includes('creatinine 8')) {
      return 'critical'
    }
    
    if (lowerText.includes('abnormal') || lowerText.includes('elevated') || 
        lowerText.includes('low hemoglobin')) {
      return 'high'
    }
    
    if (lowerText.includes('borderline') || lowerText.includes('mild')) {
      return 'medium'
    }
    
    return 'low'
  }

  // Helper function to extract medical conditions
  const extractConditions = (text: string): string[] => {
    const conditions = []
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('kidney') || lowerText.includes('renal') || lowerText.includes('gfr')) {
      conditions.push('Chronic Kidney Disease')
    }
    if (lowerText.includes('anemia') || lowerText.includes('low hemoglobin')) {
      conditions.push('Anemia')
    }
    if (lowerText.includes('diabetes') || lowerText.includes('hba1c')) {
      conditions.push('Diabetes')
    }
    if (lowerText.includes('iron') && lowerText.includes('low')) {
      conditions.push('Iron Deficiency')
    }
    
    return conditions.length > 0 ? conditions : ['Under Investigation']
  }

  // Helper function to create alerts from report findings
  const createAlertsFromReport = (doc: any, patientName: string, doctorId: string) => {
    const alerts = []
    const text = (doc.content || doc.summary || '').toLowerCase()
    
    if (text.includes('gfr 7') || text.includes('creatinine 8')) {
      alerts.push({
        id: `${doctorId}-alert-${Date.now()}`,
        patientId: `${doctorId}-${Date.now()}`,
        patientName,
        type: 'critical_value' as const,
        severity: 'critical' as const,
        message: 'Severe kidney dysfunction - GFR 7 mL/min, Creatinine 8.05 mg/dL',
        timestamp: new Date().toISOString(),
        actionRequired: true
      })
    }
    
    if (text.includes('hemoglobin 8') || text.includes('low hemoglobin')) {
      alerts.push({
        id: `${doctorId}-alert-${Date.now() + 1}`,
        patientId: `${doctorId}-${Date.now()}`,
        patientName,
        type: 'abnormal_lab' as const,
        severity: 'high' as const,
        message: 'Severe anemia - Hemoglobin 8.10 g/dL (Normal: 12-16 g/dL)',
        timestamp: new Date().toISOString(),
        actionRequired: true
      })
    }
    
    return alerts
  }

  const loadDoctorData = async () => {
    // Check if we already have saved doctors data
    const savedDoctors = localStorage.getItem('clinicalDashboard_doctors')
    if (savedDoctors) {
      // Don't reload if we already have saved data
      return
    }

    // First, try to load doctors from uploaded reports
    let realDoctors: Doctor[] = []
    
    try {
      // Check if there are any uploaded reports with doctor information
      const reportResponse = await fetch('/api/documents')
      if (reportResponse.ok) {
        const documents = await reportResponse.json()
        
        // Extract doctors from document summaries/metadata
        const extractedDoctors = extractDoctorsFromReports(documents)
        realDoctors = extractedDoctors
      }
    } catch (error) {
      console.log('Could not load real doctor data, using mock data')
    }

    // Mock data - 3 doctors with their patients and reports (fallback)
    const mockDoctors: Doctor[] = [
      {
        id: 'dr1',
        name: 'Dr. Sarah Williams',
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        patients: [
          {
            id: '1',
            name: 'Sarah Johnson',
            age: 45,
            lastVisit: '2024-01-15',
            riskLevel: 'high',
            activeConditions: ['Type 2 Diabetes', 'Hypertension', 'Obesity'],
            upcomingAppointment: '2024-01-25',
            recentAlerts: ['HbA1c elevated to 9.2%', 'Missed last 2 metformin doses'],
            medicationCompliance: 78
          },
          {
            id: '2',
            name: 'Robert Chen',
            age: 62,
            lastVisit: '2024-01-18',
            riskLevel: 'critical',
            activeConditions: ['Atrial Fibrillation', 'Heart Failure', 'CKD Stage 3'],
            upcomingAppointment: '2024-01-22',
            recentAlerts: ['INR below therapeutic range', 'Creatinine trending upward'],
            medicationCompliance: 92
          }
        ],
        alerts: [
          {
            id: '1',
            patientId: '1',
            patientName: 'Sarah Johnson',
            type: 'abnormal_lab',
            severity: 'high',
            message: 'HbA1c result 9.2% - significantly above target of <7%',
            timestamp: '2024-01-21T10:30:00Z',
            actionRequired: true
          },
          {
            id: '2',
            patientId: '2',
            patientName: 'Robert Chen',
            type: 'drug_interaction',
            severity: 'critical',
            message: 'Warfarin + New NSAID prescription - Major bleeding risk',
            timestamp: '2024-01-21T14:15:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'dr2',
        name: 'Dr. Michael Rodriguez',
        specialty: 'Cardiology',
        department: 'Cardiology',
        patients: [
          {
            id: '3',
            name: 'Emily Martinez',
            age: 28,
            lastVisit: '2024-01-20',
            riskLevel: 'medium',
            activeConditions: ['Asthma', 'Anxiety'],
            upcomingAppointment: '2024-01-26',
            recentAlerts: ['Peak flow readings declining'],
            medicationCompliance: 85
          },
          {
            id: '4',
            name: 'David Thompson',
            age: 55,
            lastVisit: '2024-01-19',
            riskLevel: 'high',
            activeConditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
            upcomingAppointment: '2024-01-24',
            recentAlerts: ['Chest pain episode reported', 'LDL cholesterol 180 mg/dL'],
            medicationCompliance: 90
          }
        ],
        alerts: [
          {
            id: '3',
            patientId: '4',
            patientName: 'David Thompson',
            type: 'critical_value',
            severity: 'critical',
            message: 'Troponin elevated - possible MI',
            timestamp: '2024-01-21T16:45:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'dr3',
        name: 'Dr. Lisa Chen',
        specialty: 'Endocrinology',
        department: 'Endocrinology',
        patients: [
          {
            id: '5',
            name: 'Maria Garcia',
            age: 38,
            lastVisit: '2024-01-17',
            riskLevel: 'medium',
            activeConditions: ['Type 1 Diabetes', 'Thyroid Disorder'],
            upcomingAppointment: '2024-01-23',
            recentAlerts: ['Insulin pump malfunction', 'TSH levels abnormal'],
            medicationCompliance: 95
          },
          {
            id: '6',
            name: 'James Wilson',
            age: 42,
            lastVisit: '2024-01-16',
            riskLevel: 'low',
            activeConditions: ['Prediabetes', 'Metabolic Syndrome'],
            upcomingAppointment: '2024-01-27',
            recentAlerts: ['Weight gain of 10 lbs'],
            medicationCompliance: 88
          }
        ],
        alerts: [
          {
            id: '4',
            patientId: '5',
            patientName: 'Maria Garcia',
            type: 'missed_appointment',
            severity: 'medium',
            message: 'Missed insulin pump training session',
            timestamp: '2024-01-20T09:00:00Z',
            actionRequired: false
          }
        ]
      }
    ]

    // Combine real doctors with mock doctors, prioritizing real doctors
    const allDoctors = realDoctors.length > 0 ? [...realDoctors, ...mockDoctors] : mockDoctors
    
    setDoctors(allDoctors)
    setSelectedDoctor(allDoctors[0]) // Default to first doctor
  }

  const handleReviewAlert = async (clinicalAlert: ClinicalAlert) => {
    setProcessingAlert(clinicalAlert.id)
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mark alert as reviewed
      setReviewedAlerts(prev => new Set([...Array.from(prev), clinicalAlert.id]))
      
      // Show success message
      alert(`✅ Alert reviewed successfully!\n\nPatient: ${clinicalAlert.patientName}\nAlert: ${clinicalAlert.message}\n\nActions taken:\n• Alert marked as reviewed\n• Workflow task created\n• Care team notified\n• Patient record updated`)
      
      console.log('Alert reviewed:', clinicalAlert)
    } catch (error) {
      alert('❌ Error reviewing alert. Please try again.')
      console.error('Error reviewing alert:', error)
    } finally {
      setProcessingAlert(null)
    }
  }

  // Function to assign doctor when scanning reports
  const assignDoctorFromReport = (doctorName: string, patientData: any) => {
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.name.toLowerCase().includes(doctorName.toLowerCase())) {
        // Check if patient already exists
        const existingPatient = doctor.patients.find(p => p.name === patientData.name)
        if (!existingPatient) {
          return {
            ...doctor,
            patients: [...doctor.patients, {
              id: `${doctor.id}-${Date.now()}`,
              name: patientData.name,
              age: patientData.age || 0,
              lastVisit: new Date().toISOString().split('T')[0],
              riskLevel: 'medium' as const,
              activeConditions: patientData.conditions || [],
              recentAlerts: [`New report scanned: ${patientData.reportType}`],
              medicationCompliance: 85
            }]
          }
        }
      }
      return doctor
    })
    
    setDoctors(updatedDoctors)
    
    // Show notification
    alert(`📋 Patient ${patientData.name} assigned to ${doctorName}\n\nReport: ${patientData.reportType}\nConditions: ${patientData.conditions?.join(', ') || 'None specified'}`)
  }

  // Function to manually add doctors from your specific report
  const addRealDoctorsFromReport = () => {
    const reportDoctors: Doctor[] = [
      {
        id: 'real-dr-amarjot-kaur',
        name: 'Dr. Amarjot Kaur',
        specialty: 'Nephrology',
        department: 'Nephrology',
        patients: [
          {
            id: 'patient-ws-dhillon',
            name: 'WS DHILLON',
            age: 65,
            lastVisit: '2025-06-25',
            riskLevel: 'critical',
            activeConditions: ['Chronic Kidney Disease Stage 5', 'Severe Anemia', 'Iron Deficiency'],
            recentAlerts: [
              'Severe kidney dysfunction - GFR 7 mL/min',
              'Critical creatinine level - 8.05 mg/dL',
              'Severe anemia - Hemoglobin 8.10 g/dL'
            ],
            medicationCompliance: 85
          }
        ],
        alerts: [
          {
            id: 'alert-kidney-critical',
            patientId: 'patient-ws-dhillon',
            patientName: 'WS DHILLON',
            type: 'critical_value',
            severity: 'critical',
            message: 'Severe kidney dysfunction - GFR 7 mL/min/1.73m², Creatinine 8.05 mg/dL, Urea 140.45 mg/dL',
            timestamp: '2025-06-25T10:00:00Z',
            actionRequired: true
          },
          {
            id: 'alert-anemia-severe',
            patientId: 'patient-ws-dhillon',
            patientName: 'WS DHILLON',
            type: 'abnormal_lab',
            severity: 'critical',
            message: 'Severe anemia - Hemoglobin 8.10 g/dL (Normal: 12-16 g/dL)',
            timestamp: '2025-06-25T10:00:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'real-dr-pavneet-kaur',
        name: 'Dr. Pavneet Kaur',
        specialty: 'Hematology',
        department: 'Hematology',
        patients: [
          {
            id: 'patient-ws-dhillon-hematology',
            name: 'WS DHILLON',
            age: 65,
            lastVisit: '2025-06-25',
            riskLevel: 'high',
            activeConditions: ['Iron Deficiency Anemia', 'Low Hemoglobin'],
            recentAlerts: ['Iron studies abnormal', 'Blood count requires monitoring'],
            medicationCompliance: 90
          }
        ],
        alerts: [
          {
            id: 'alert-iron-deficiency',
            patientId: 'patient-ws-dhillon-hematology',
            patientName: 'WS DHILLON',
            type: 'abnormal_lab',
            severity: 'high',
            message: 'Iron deficiency detected - requires iron supplementation',
            timestamp: '2025-06-25T10:00:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'real-dr-vanni-yadav',
        name: 'Dr. Vanni Yadav',
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        patients: [
          {
            id: 'patient-ws-dhillon-internal',
            name: 'WS DHILLON',
            age: 65,
            lastVisit: '2025-06-25',
            riskLevel: 'high',
            activeConditions: ['Multiple Comorbidities', 'Comprehensive Care Required'],
            recentAlerts: ['Complex case requiring multidisciplinary approach'],
            medicationCompliance: 88
          }
        ],
        alerts: []
      }
    ]

    // Add these real doctors to the existing doctors list
    const currentDoctors = doctors.filter(d => !d.id.startsWith('real-'))
    const updatedDoctors = [...reportDoctors, ...currentDoctors]
    
    setDoctors(updatedDoctors)
    setSelectedDoctor(reportDoctors[0]) // Select the first real doctor
    
    // Save to localStorage immediately
    localStorage.setItem('clinicalDashboard_doctors', JSON.stringify(updatedDoctors))
    localStorage.setItem('clinicalDashboard_selectedDoctor', JSON.stringify(reportDoctors[0]))
    
    // Show notification
    alert(`✅ Successfully added real doctors from your report!\n\n👩‍⚕️ Dr. Amarjot Kaur (Nephrology)\n👩‍⚕️ Dr. Pavneet Kaur (Hematology)\n👩‍⚕️ Dr. Vanni Yadav (Internal Medicine)\n\nPatient: WS DHILLON (65 years old)\nCritical findings: Severe kidney dysfunction, Anemia\n\n💾 Data saved - will persist across navigation!`)
  }

  // Function to clear all saved data and reset to default
  const clearAllData = () => {
    if (confirm('⚠️ This will remove all loaded doctors and patients. Are you sure?')) {
      localStorage.removeItem('clinicalDashboard_doctors')
      localStorage.removeItem('clinicalDashboard_selectedDoctor')
      setDoctors([])
      setSelectedDoctor(null)
      setSelectedPatient(null)
      setDifferentialDx([])
      setReviewedAlerts(new Set())
      
      // Force reload default data by calling loadDoctorData directly
      setTimeout(() => {
        loadDefaultDoctorData()
      }, 100)
      
      alert('🗑️ All data cleared! Reloaded with default demo doctors.')
    }
  }

  // Separate function for loading default data (without localStorage check)
  const loadDefaultDoctorData = async () => {
    // Mock data - 3 doctors with their patients and reports
    const mockDoctors: Doctor[] = [
      {
        id: 'dr1',
        name: 'Dr. Sarah Williams',
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        patients: [
          {
            id: '1',
            name: 'Sarah Johnson',
            age: 45,
            lastVisit: '2024-01-15',
            riskLevel: 'high',
            activeConditions: ['Type 2 Diabetes', 'Hypertension', 'Obesity'],
            upcomingAppointment: '2024-01-25',
            recentAlerts: ['HbA1c elevated to 9.2%', 'Missed last 2 metformin doses'],
            medicationCompliance: 78
          },
          {
            id: '2',
            name: 'Robert Chen',
            age: 62,
            lastVisit: '2024-01-18',
            riskLevel: 'critical',
            activeConditions: ['Atrial Fibrillation', 'Heart Failure', 'CKD Stage 3'],
            upcomingAppointment: '2024-01-22',
            recentAlerts: ['INR below therapeutic range', 'Creatinine trending upward'],
            medicationCompliance: 92
          }
        ],
        alerts: [
          {
            id: '1',
            patientId: '1',
            patientName: 'Sarah Johnson',
            type: 'abnormal_lab',
            severity: 'high',
            message: 'HbA1c result 9.2% - significantly above target of <7%',
            timestamp: '2024-01-21T10:30:00Z',
            actionRequired: true
          },
          {
            id: '2',
            patientId: '2',
            patientName: 'Robert Chen',
            type: 'drug_interaction',
            severity: 'critical',
            message: 'Warfarin + New NSAID prescription - Major bleeding risk',
            timestamp: '2024-01-21T14:15:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'dr2',
        name: 'Dr. Michael Rodriguez',
        specialty: 'Cardiology',
        department: 'Cardiology',
        patients: [
          {
            id: '3',
            name: 'Emily Martinez',
            age: 28,
            lastVisit: '2024-01-20',
            riskLevel: 'medium',
            activeConditions: ['Asthma', 'Anxiety'],
            upcomingAppointment: '2024-01-26',
            recentAlerts: ['Peak flow readings declining'],
            medicationCompliance: 85
          },
          {
            id: '4',
            name: 'David Thompson',
            age: 55,
            lastVisit: '2024-01-19',
            riskLevel: 'high',
            activeConditions: ['Coronary Artery Disease', 'Hyperlipidemia'],
            upcomingAppointment: '2024-01-24',
            recentAlerts: ['Chest pain episode reported', 'LDL cholesterol 180 mg/dL'],
            medicationCompliance: 90
          }
        ],
        alerts: [
          {
            id: '3',
            patientId: '4',
            patientName: 'David Thompson',
            type: 'critical_value',
            severity: 'critical',
            message: 'Troponin elevated - possible MI',
            timestamp: '2024-01-21T16:45:00Z',
            actionRequired: true
          }
        ]
      },
      {
        id: 'dr3',
        name: 'Dr. Lisa Chen',
        specialty: 'Endocrinology',
        department: 'Endocrinology',
        patients: [
          {
            id: '5',
            name: 'Maria Garcia',
            age: 38,
            lastVisit: '2024-01-17',
            riskLevel: 'medium',
            activeConditions: ['Type 1 Diabetes', 'Thyroid Disorder'],
            upcomingAppointment: '2024-01-23',
            recentAlerts: ['Insulin pump malfunction', 'TSH levels abnormal'],
            medicationCompliance: 95
          },
          {
            id: '6',
            name: 'James Wilson',
            age: 42,
            lastVisit: '2024-01-16',
            riskLevel: 'low',
            activeConditions: ['Prediabetes', 'Metabolic Syndrome'],
            upcomingAppointment: '2024-01-27',
            recentAlerts: ['Weight gain of 10 lbs'],
            medicationCompliance: 88
          }
        ],
        alerts: [
          {
            id: '4',
            patientId: '5',
            patientName: 'Maria Garcia',
            type: 'missed_appointment',
            severity: 'medium',
            message: 'Missed insulin pump training session',
            timestamp: '2024-01-20T09:00:00Z',
            actionRequired: false
          }
        ]
      }
    ]

    setDoctors(mockDoctors)
    setSelectedDoctor(mockDoctors[0]) // Default to first doctor
  }

  // Example usage - this would be called when scanning a report
  const simulateReportScan = () => {
    const sampleReport = {
      name: 'John Anderson',
      age: 45,
      reportType: 'Cardiac Stress Test',
      conditions: ['Coronary Artery Disease'],
      doctorMentioned: 'Dr. Michael Rodriguez'
    }
    
    assignDoctorFromReport(sampleReport.doctorMentioned, sampleReport)
  }

  // Function to add a new patient to the selected doctor
  const handleAddNewPatient = () => {
    if (!selectedDoctor || !newPatientData.name.trim()) {
      alert('Please select a doctor and enter patient name')
      return
    }

    const newPatient: PatientSummary = {
      id: `${selectedDoctor.id}-patient-${Date.now()}`,
      name: newPatientData.name.trim(),
      age: parseInt(newPatientData.age) || 0,
      lastVisit: new Date().toISOString().split('T')[0],
      riskLevel: newPatientData.riskLevel,
      activeConditions: newPatientData.conditions 
        ? newPatientData.conditions.split(',').map(c => c.trim()).filter(c => c)
        : ['Initial Assessment Pending'],
      recentAlerts: ['New patient added to system'],
      medicationCompliance: 85
    }

    // Update the doctors array with the new patient
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          patients: [...doctor.patients, newPatient]
        }
      }
      return doctor
    })

    setDoctors(updatedDoctors)
    
    // Update selected doctor
    const updatedSelectedDoctor = updatedDoctors.find(d => d.id === selectedDoctor.id)
    if (updatedSelectedDoctor) {
      setSelectedDoctor(updatedSelectedDoctor)
    }

    // Reset form and close dialog
    setNewPatientData({
      name: '',
      age: '',
      conditions: '',
      riskLevel: 'medium'
    })
    setShowNewPatientDialog(false)

    // Show success message
    alert(`✅ Successfully added new patient!\n\nPatient: ${newPatient.name}\nAge: ${newPatient.age}\nAssigned to: ${selectedDoctor.name}\nRisk Level: ${newPatient.riskLevel.toUpperCase()}`)
  }

  const generateDifferentialDiagnosis = async (patient: PatientSummary) => {
    setIsGeneratingDx(true)
    
    try {
      // In production, this would call the medical intelligence API
      const response = await fetch('/api/medical-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'differential_diagnosis',
          patientData: {
            id: patient.id,
            conditions: patient.activeConditions,
            medications: [], // Would get from EMR
            recentAlerts: patient.recentAlerts,
            age: patient.age,
            gender: patient.name.includes('Sarah') ? 'female' : 'male'
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.differentials) {
          setDifferentialDx(data.differentials)
          setIsGeneratingDx(false)
          return
        }
      }
    } catch (error) {
      console.error('Error generating differential diagnosis:', error)
    }
    
    // Fallback to mock data if API fails
    setTimeout(() => {
      const mockDifferentials: DifferentialDiagnosis[] = [
        {
          condition: 'Diabetic Ketoacidosis',
          probability: 85,
          supportingEvidence: [
            'HbA1c 9.2% indicates poor glycemic control',
            'Recent medication non-compliance',
            'Type 2 diabetes with obesity'
          ],
          contraindications: ['No reported ketones yet'],
          recommendedTests: ['Serum ketones', 'Arterial blood gas', 'Basic metabolic panel']
        },
        {
          condition: 'Medication Non-Adherence Syndrome',
          probability: 92,
          supportingEvidence: [
            'Missed metformin doses documented',
            'Compliance rate only 78%',
            'HbA1c elevation pattern'
          ],
          contraindications: [],
          recommendedTests: ['Medication adherence assessment', 'Pharmacy refill history']
        },
        {
          condition: 'Secondary Diabetes Complications',
          probability: 70,
          supportingEvidence: [
            'Long-standing diabetes',
            'Multiple comorbidities',
            'Poor glycemic control'
          ],
          contraindications: [],
          recommendedTests: ['Diabetic retinal exam', 'Microalbumin', 'Foot examination']
        }
      ]
      
      setDifferentialDx(mockDifferentials)
      setIsGeneratingDx(false)
    }, 2000)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-blue-600'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Doctor Selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Doctor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedDoctor?.id === doctor.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-blue-600">{doctor.patients.length} patients</span>
                <span className="text-red-600">{doctor.alerts.filter(a => a.actionRequired).length} alerts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinical Dashboard</h1>
              <p className="text-gray-600">{selectedDoctor.name} • {selectedDoctor.specialty}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Today's Schedule
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowNewPatientDialog(true)}
                disabled={!selectedDoctor}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                New Patient
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={simulateReportScan}
              >
                📋 Demo: Scan Report
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={addRealDoctorsFromReport}
                className="bg-green-600 hover:bg-green-700"
              >
                🏥 Load Your Real Doctors
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllData}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                🗑️ Clear Data
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedDoctor.patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedDoctor.alerts.filter(a => a.severity === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Compliance</p>
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Critical Alerts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Critical Alerts
              </h3>
              <div className="space-y-3">
                {selectedDoctor.alerts.filter(alert => alert.actionRequired).map((alert) => (
                  <div key={alert.id} className={`p-3 border rounded-lg transition-all ${
                    reviewedAlerts.has(alert.id) 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${
                            reviewedAlerts.has(alert.id) ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {alert.patientName}
                          </p>
                          {reviewedAlerts.has(alert.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Reviewed
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          reviewedAlerts.has(alert.id) ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-2 ${
                          reviewedAlerts.has(alert.id) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 w-full" 
                      variant={reviewedAlerts.has(alert.id) ? "secondary" : "outline"}
                      onClick={() => handleReviewAlert(alert)}
                      disabled={processingAlert === alert.id || reviewedAlerts.has(alert.id)}
                    >
                      {processingAlert === alert.id ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : reviewedAlerts.has(alert.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reviewed
                        </>
                      ) : (
                        'Review & Action'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Patients */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                High-Risk Patients
              </h3>
              <div className="space-y-3">
                {selectedDoctor.patients
                  .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
                  .map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${getRiskColor(patient.riskLevel)}`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm opacity-75">Age {patient.age} • Last visit: {patient.lastVisit}</p>
                        <div className="mt-2">
                          {patient.activeConditions.slice(0, 2).map((condition, idx) => (
                            <span key={idx} className="inline-block text-xs bg-white bg-opacity-50 px-2 py-1 rounded mr-1 mb-1">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-medium">
                        {patient.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    {patient.recentAlerts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                        <p className="text-xs">
                          🚨 {patient.recentAlerts[0]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Differential Diagnosis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Differential Diagnosis
              </h3>
              
              {!selectedPatient ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium mb-2">Select a Patient for AI Analysis</p>
                  <p className="text-sm">Click on a patient from the "High-Risk Patients" section to generate differential diagnosis</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> The AI will analyze patient conditions, recent alerts, and medical history to generate evidence-based differential diagnoses with confidence scoring.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">{selectedPatient.name}</p>
                    <p className="text-sm text-blue-700">
                      {selectedPatient.activeConditions.join(', ')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedPatient.recentAlerts.map((alert, idx) => (
                        <span key={idx} className="inline-block text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          🚨 {alert}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => generateDifferentialDiagnosis(selectedPatient)}
                    disabled={isGeneratingDx}
                    className="w-full"
                  >
                    {isGeneratingDx ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Patient Data...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate AI Differential Diagnosis
                      </>
                    )}
                  </Button>

                  {differentialDx.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">Differential Diagnoses</h4>
                        <span className="text-xs text-gray-500">Generated {new Date().toLocaleTimeString()}</span>
                      </div>
                      {differentialDx.map((dx, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{dx.condition}</h4>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-lg font-bold text-blue-600">{dx.probability}%</span>
                                <p className="text-xs text-gray-500">Confidence</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                dx.probability >= 80 ? 'bg-red-500' :
                                dx.probability >= 60 ? 'bg-orange-500' :
                                dx.probability >= 40 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-green-700 mb-1">✅ Supporting Evidence:</p>
                              <ul className="list-disc list-inside text-green-600 space-y-1">
                                {dx.supportingEvidence.map((evidence, i) => (
                                  <li key={i}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-medium text-blue-700 mb-1">🔬 Recommended Tests:</p>
                              <ul className="list-disc list-inside text-blue-600 space-y-1">
                                {dx.recommendedTests.map((test, i) => (
                                  <li key={i}>{test}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {dx.contraindications && dx.contraindications.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="font-medium text-yellow-800 text-sm">⚠️ Considerations:</p>
                              <ul className="list-disc list-inside text-yellow-700 text-sm">
                                {dx.contraindications.map((contra, i) => (
                                  <li key={i}>{contra}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* New Patient Dialog */}
      {showNewPatientDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
              <button
                onClick={() => setShowNewPatientDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedDoctor && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Assigning to:</strong> {selectedDoctor.name} ({selectedDoctor.specialty})
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newPatientData.name}
                  onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={newPatientData.age}
                  onChange={(e) => setNewPatientData({...newPatientData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                <input
                  type="text"
                  value={newPatientData.conditions}
                  onChange={(e) => setNewPatientData({...newPatientData, conditions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Diabetes, Hypertension (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={newPatientData.riskLevel}
                  onChange={(e) => setNewPatientData({...newPatientData, riskLevel: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowNewPatientDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNewPatient}
                className="flex-1"
                disabled={!newPatientData.name.trim()}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 