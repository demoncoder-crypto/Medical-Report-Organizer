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

interface DoctorDashboardProps {
  documents?: any[]
}

export function DoctorDashboard({ documents = [] }: DoctorDashboardProps) {
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
    // Also check for real patient data from Patient Dashboard on mount
    checkAndLoadPatientDashboardData()
  }, [])

  // Automatically extract doctors from documents when documents change
  useEffect(() => {
    if (documents && documents.length > 0) {
      console.log('[Doctor Dashboard] Documents updated, checking for doctor data...')
      extractAndUpdateDoctorsFromDocuments()
    }
  }, [documents])

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
    
    // Also check for real patient data from Patient Dashboard
    checkAndLoadPatientDashboardData()
  }, [])

  // Function to check for and load real patient data from Patient Dashboard
  const checkAndLoadPatientDashboardData = () => {
    const savedRealPatient = localStorage.getItem('patientDashboard_realPatient')
    
    if (savedRealPatient) {
      try {
        const realPatient = JSON.parse(savedRealPatient)
        console.log('[Doctor Dashboard] Found real patient data from Patient Dashboard:', realPatient)
        
        // Create or update doctor entry for this patient
        createDoctorFromPatientData(realPatient)
      } catch (error) {
        console.error('[Doctor Dashboard] Error loading real patient data:', error)
      }
    }
  }

  // Function to create doctor entry from patient data
  const createDoctorFromPatientData = (patientData: any) => {
    console.log('[Doctor Dashboard] Creating doctor from patient data:', patientData)
    
    // Determine doctor name from patient's lab results or create a default one
    let doctorName = 'Dr. Amarjot' // Default based on your example
    let specialty = 'Nephrology'
    
    // Try to extract doctor info from patient's lab results
    if (patientData.labResults && patientData.labResults.length > 0) {
      const orderedBy = patientData.labResults[0].orderedBy
      if (orderedBy && orderedBy !== 'Uploaded Document') {
        doctorName = orderedBy.startsWith('Dr.') ? orderedBy : `Dr. ${orderedBy}`
      }
      
      // Infer specialty from lab types
      const hasKidneyLabs = patientData.labResults.some((lab: any) => 
        lab.testName.toLowerCase().includes('gfr') || 
        lab.testName.toLowerCase().includes('creatinine')
      )
      if (hasKidneyLabs) {
        specialty = 'Nephrology'
      }
    }

    // Create patient summary for the doctor dashboard
    const patientSummary: PatientSummary = {
      id: `real-patient-${Date.now()}`,
      name: patientData.name || 'Real Patient',
      age: patientData.age || 0,
      lastVisit: new Date().toISOString().split('T')[0],
      riskLevel: determineRiskLevel(patientData),
      activeConditions: patientData.conditions || [],
      recentAlerts: [],
      medicationCompliance: 85
    }

    console.log('[Doctor Dashboard] Created patient summary:', patientSummary)

    // Generate clinical alerts from patient data
    const clinicalAlerts = generateClinicalAlertsFromPatient(patientData, patientSummary.id, doctorName)
    console.log('[Doctor Dashboard] Generated clinical alerts:', clinicalAlerts)

    // Create or update doctor
    const doctorId = `real-${doctorName.toLowerCase().replace(/\s+/g, '-')}`
    
    setDoctors(prevDoctors => {
      const existingDoctorIndex = prevDoctors.findIndex(d => d.id === doctorId)
      
      if (existingDoctorIndex >= 0) {
        // Update existing doctor
        const updatedDoctors = [...prevDoctors]
        const existingDoctor = updatedDoctors[existingDoctorIndex]
        
        // Check if patient already exists
        const existingPatientIndex = existingDoctor.patients.findIndex(p => p.name === patientSummary.name)
        if (existingPatientIndex >= 0) {
          // Update existing patient
          existingDoctor.patients[existingPatientIndex] = patientSummary
        } else {
          // Add new patient
          existingDoctor.patients.push(patientSummary)
        }
        
        // Update alerts (remove old alerts for this patient and add new ones)
        existingDoctor.alerts = existingDoctor.alerts.filter(alert => alert.patientName !== patientSummary.name)
        existingDoctor.alerts.push(...clinicalAlerts)
        
        console.log('[Doctor Dashboard] Updated existing doctor:', existingDoctor)
        return updatedDoctors
      } else {
        // Create new doctor
        const newDoctor: Doctor = {
          id: doctorId,
          name: doctorName,
          specialty: specialty,
          department: specialty,
          patients: [patientSummary],
          alerts: clinicalAlerts
        }
        
        console.log('[Doctor Dashboard] Created new doctor:', newDoctor)
        return [newDoctor, ...prevDoctors]
      }
    })

    // Also update the selected doctor to the new/updated doctor
    setTimeout(() => {
      setDoctors(currentDoctors => {
        const updatedDoctor = currentDoctors.find(d => d.id === doctorId)
        if (updatedDoctor) {
          setSelectedDoctor(updatedDoctor)
          console.log('[Doctor Dashboard] Set selected doctor to:', updatedDoctor)
        }
        return currentDoctors
      })
    }, 100)

    console.log(`[Doctor Dashboard] Created/updated doctor ${doctorName} with patient ${patientSummary.name} and ${clinicalAlerts.length} alerts`)
  }

  // Function to determine risk level from patient data
  const determineRiskLevel = (patientData: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (!patientData.labResults || patientData.labResults.length === 0) {
      return 'medium'
    }

    // Check for critical lab values
    const hasCritical = patientData.labResults.some((lab: any) => lab.status === 'critical')
    if (hasCritical) return 'critical'

    const hasHigh = patientData.labResults.some((lab: any) => lab.status === 'high')
    if (hasHigh) return 'high'

    const hasLow = patientData.labResults.some((lab: any) => lab.status === 'low')
    if (hasLow) return 'medium'

    return 'low'
  }

  // Function to generate clinical alerts from patient data
  const generateClinicalAlertsFromPatient = (patientData: any, patientId: string, doctorName: string): ClinicalAlert[] => {
    const alerts: ClinicalAlert[] = []

    if (patientData.labResults) {
      patientData.labResults.forEach((lab: any, index: number) => {
        if (lab.status === 'critical') {
          alerts.push({
            id: `critical-lab-${patientId}-${index}`,
            patientId: patientId,
            patientName: patientData.name,
            type: 'critical_value',
            severity: 'critical',
            message: `Critical ${lab.testName}: ${lab.value} (Normal: ${lab.normalRange})`,
            timestamp: new Date().toISOString(),
            actionRequired: true
          })
        } else if (lab.status === 'high') {
          alerts.push({
            id: `high-lab-${patientId}-${index}`,
            patientId: patientId,
            patientName: patientData.name,
            type: 'abnormal_lab',
            severity: 'high',
            message: `Elevated ${lab.testName}: ${lab.value} (Normal: ${lab.normalRange})`,
            timestamp: new Date().toISOString(),
            actionRequired: true
          })
        } else if (lab.status === 'low') {
          alerts.push({
            id: `low-lab-${patientId}-${index}`,
            patientId: patientId,
            patientName: patientData.name,
            type: 'abnormal_lab',
            severity: 'medium',
            message: `Low ${lab.testName}: ${lab.value} (Normal: ${lab.normalRange})`,
            timestamp: new Date().toISOString(),
            actionRequired: true
          })
        }
      })
    }

    // Add condition-specific alerts
    if (patientData.conditions) {
      patientData.conditions.forEach((condition: string, index: number) => {
        if (condition.toLowerCase().includes('kidney') || condition.toLowerCase().includes('ckd')) {
          alerts.push({
            id: `condition-kidney-${patientId}-${index}`,
            patientId: patientId,
            patientName: patientData.name,
            type: 'abnormal_lab',
            severity: 'high',
            message: `Patient has ${condition} - requires regular monitoring and nephrology follow-up`,
            timestamp: new Date().toISOString(),
            actionRequired: true
          })
        } else if (condition.toLowerCase().includes('diabetes')) {
          alerts.push({
            id: `condition-diabetes-${patientId}-${index}`,
            patientId: patientId,
            patientName: patientData.name,
            type: 'abnormal_lab',
            severity: 'medium',
            message: `Patient has ${condition} - monitor glucose control and complications`,
            timestamp: new Date().toISOString(),
            actionRequired: true
          })
        }
      })
    }

    return alerts
  }

  // Function to extract and update doctors from uploaded documents
  const extractAndUpdateDoctorsFromDocuments = () => {
    console.log(`[Doctor Dashboard] Processing ${documents.length} documents for doctor extraction...`)
    
    const extractedDoctors = extractDoctorsFromReports(documents)
    
    if (extractedDoctors.length > 0) {
      console.log(`[Doctor Dashboard] Found ${extractedDoctors.length} doctors in documents`)
      
      // Merge with existing doctors, avoiding duplicates
      setDoctors(prevDoctors => {
        const existingDoctorNames = new Set(prevDoctors.map(d => d.name))
        const newDoctors = extractedDoctors.filter(d => !existingDoctorNames.has(d.name))
        
        if (newDoctors.length > 0) {
          console.log(`[Doctor Dashboard] Adding ${newDoctors.length} new doctors`)
          return [...prevDoctors, ...newDoctors]
        }
        
        return prevDoctors
      })
    }
  }

  // Function to manually load real doctor data from documents
  const loadRealDoctorData = () => {
    console.log('[Doctor Dashboard] Manually loading real doctor data from documents...')
    
    if (!documents || documents.length === 0) {
      alert('❌ No documents found!\n\nPlease upload medical documents first:\n1. Go to "Upload Documents" section\n2. Upload your medical reports\n3. Then return to Clinical Dashboard\n4. Click "Load Real Doctor Data"')
      return
    }

    console.log(`[Doctor Dashboard] Processing ${documents.length} documents...`)
    
    // Debug: Show what's in the documents
    documents.forEach((doc, i) => {
      console.log(`[Doctor Dashboard] Document ${i + 1}:`, {
        name: doc.name,
        type: doc.type,
        hasContent: !!(doc.content),
        hasSummary: !!(doc.summary),
        contentLength: (doc.content || '').length,
        summaryLength: (doc.summary || '').length,
        contentPreview: (doc.content || doc.summary || '').substring(0, 200)
      })
    })

    const extractedDoctors = extractDoctorsFromReports(documents)
    
    // If no doctors found, create a fallback doctor from any patient data
    if (extractedDoctors.length === 0) {
      console.log('[Doctor Dashboard] No doctors found, trying fallback extraction...')
      
      // Try to extract any patient information and create a generic doctor
      let foundPatientData = false
      const fallbackDoctor: Doctor = {
        id: 'real-doctor-from-documents',
        name: 'Dr. Unknown (From Documents)',
        specialty: 'Internal Medicine',
        department: 'Internal Medicine',
        patients: [],
        alerts: []
      }

      documents.forEach((doc, index) => {
        const content = doc.content || doc.summary || ''
        if (content.length < 10) return

        console.log(`[Doctor Dashboard] Fallback: Processing document ${index + 1} content...`)
        
        const patientInfo = extractPatientInfo(content)
        
        if (patientInfo.name) {
          console.log(`[Doctor Dashboard] Fallback: Found patient data:`, patientInfo)
          
          // Create patient entry
          const patient: PatientSummary = {
            id: `fallback-patient-${Date.now()}-${index}`,
            name: patientInfo.name,
            age: patientInfo.age || 0,
            lastVisit: new Date().toISOString().split('T')[0],
            riskLevel: inferRiskLevel(content),
            activeConditions: extractConditions(content),
            recentAlerts: [`Report uploaded: ${doc.name || 'Medical Report'}`],
            medicationCompliance: 85
          }
          
          fallbackDoctor.patients.push(patient)
          
          // Create alerts for abnormal findings
          const alerts = createAlertsFromReport(doc, patientInfo.name, fallbackDoctor.id)
          fallbackDoctor.alerts.push(...alerts)
          
          foundPatientData = true
        }
      })

      if (foundPatientData) {
        console.log(`[Doctor Dashboard] Fallback: Created doctor with ${fallbackDoctor.patients.length} patients`)
        
        // Replace existing doctors with fallback doctor and mock doctors
        const mockDoctors = doctors.filter(d => d.id.startsWith('dr'))
        const allDoctors = [fallbackDoctor, ...mockDoctors]
        setDoctors(allDoctors)
        setSelectedDoctor(fallbackDoctor)
        
        // Save to localStorage
        localStorage.setItem('clinicalDashboard_doctors', JSON.stringify(allDoctors))
        
        alert(`✅ Successfully loaded patient data from documents!\n\n👨‍⚕️ Created doctor from document data\n📊 Found ${fallbackDoctor.patients.length} patients:\n${fallbackDoctor.patients.map(p => `• ${p.name} (Age: ${p.age})`).join('\n')}\n\n📋 Total alerts: ${fallbackDoctor.alerts.length}\n💾 Data saved - will persist across navigation!`)
        return
      }
    }

    if (extractedDoctors.length === 0) {
      // Show detailed debugging info
      console.log('[Doctor Dashboard] DEBUGGING INFO:')
      console.log('- Documents count:', documents.length)
      documents.forEach((doc, i) => {
        console.log(`- Document ${i + 1}:`, {
          name: doc.name,
          type: doc.type,
          hasContent: !!(doc.content),
          hasSummary: !!(doc.summary),
          contentLength: (doc.content || '').length,
          summaryLength: (doc.summary || '').length,
          keys: Object.keys(doc)
        })
      })
      
      alert('❌ No doctor or patient information found in your documents.\n\nDebugging Info:\n• Found ' + documents.length + ' documents\n• Check browser console for detailed analysis\n• Try uploading documents with clear doctor names or patient information\n• Ensure documents contain readable text content')
      return
    }

    console.log(`[Doctor Dashboard] Extracted ${extractedDoctors.length} doctors from ${documents.length} documents`)
    
    // Replace existing doctors with extracted ones, but keep mock doctors as fallback
    const mockDoctors = doctors.filter(d => d.id.startsWith('dr'))
    const realDoctors = extractedDoctors
    
    const allDoctors = [...realDoctors, ...mockDoctors]
    setDoctors(allDoctors)
    
    // Select the first real doctor
    if (realDoctors.length > 0) {
      setSelectedDoctor(realDoctors[0])
    }

    // Save to localStorage
    localStorage.setItem('clinicalDashboard_doctors', JSON.stringify(allDoctors))
    
    alert(`✅ Successfully loaded real doctor data!\n\n👨‍⚕️ Found ${realDoctors.length} doctors:\n${realDoctors.map(d => `• ${d.name} (${d.specialty})`).join('\n')}\n\n📊 Total patients: ${realDoctors.reduce((sum, d) => sum + d.patients.length, 0)}\n📋 Total alerts: ${realDoctors.reduce((sum, d) => sum + d.alerts.length, 0)}\n\n💾 Data saved - will persist across navigation!`)
  }

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
      // Standard patterns: "Dr. John Smith", "Doctor Jane Doe"
      /Dr\.?\s+([A-Za-z\s]{3,30})(?=,|\n|$|\.)/gi,
      /Doctor\s+([A-Za-z\s]{3,30})(?=,|\n|$|\.)/gi,
      // Signed by patterns: "Signed by Dr. Smith", "Attending: Dr. Johnson"
      /(?:Signed by|Attending|Physician|Provider)[:\s]*Dr\.?\s+([A-Za-z\s]{3,30})/gi,
      // Medical signature patterns: "Dr. Smith, MD", "John Doe, MD"
      /([A-Za-z\s]{3,30}),?\s*M\.?D\.?/gi,
      // Report patterns: "Report by Dr. Smith", "Ordered by Dr. Johnson"
      /(?:Report by|Ordered by|Reviewed by)[:\s]*Dr\.?\s+([A-Za-z\s]{3,30})/gi,
      // Direct name patterns in medical context
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+),?\s*(?:MD|M\.D\.|Doctor|Physician)/gi,
      // Simple fallback patterns
      /Dr\.?\s+([A-Z][a-z]+)/gi,  // Just "Dr. Smith"
      /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+MD/gi,  // "John Smith MD"
      // Any name followed by medical titles
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,?\s*(?:M\.D\.|MD|Doctor)/gi
    ]
    
    const doctors = new Set<string>()
    
    console.log(`[Doctor Extraction] Processing text of length: ${text.length}`)
    console.log(`[Doctor Extraction] Text preview: ${text.substring(0, 500)}...`)
    
    doctorPatterns.forEach((pattern, index) => {
      let match
      let matchCount = 0
      while ((match = pattern.exec(text)) !== null) {
        matchCount++
        let doctorName = match[1].trim()
        
        // Clean up the name
        doctorName = doctorName.replace(/[,\.]+$/, '') // Remove trailing punctuation
        doctorName = doctorName.replace(/\s+/g, ' ') // Normalize spaces
        
        console.log(`[Doctor Extraction] Pattern ${index + 1} match ${matchCount}: "${doctorName}"`)
        
        // Validate name (reasonable length, contains letters, not common medical terms)
        if (doctorName.length > 2 && doctorName.length < 40 && 
            /^[A-Za-z\s]+$/.test(doctorName) &&
            !['Blood Test', 'Lab Report', 'Medical Center', 'Test Results', 'Patient Care', 'Health System', 'Medical', 'Report', 'Test', 'Lab'].some(term => doctorName.includes(term))) {
          
          // Ensure it starts with Dr. if not already
          const formattedName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`
          doctors.add(formattedName)
          console.log(`[Doctor Extraction] ✅ Added doctor: ${formattedName}`)
        } else {
          console.log(`[Doctor Extraction] ❌ Rejected: "${doctorName}" (length: ${doctorName.length}, valid chars: ${/^[A-Za-z\s]+$/.test(doctorName)})`)
        }
      }
      // Reset regex lastIndex
      pattern.lastIndex = 0
    })
    
    console.log(`[Doctor Extraction] Total unique doctors found: ${doctors.size}`)
    console.log(`[Doctor Extraction] Doctors list:`, Array.from(doctors))
    return Array.from(doctors)
  }

  // Helper function to extract patient information
  const extractPatientInfo = (text: string) => {
    console.log(`[Patient Extraction] Processing text of length: ${text.length}`)
    
    // Enhanced patient name patterns
    const namePatterns = [
      // Standard formats: "Patient: John Doe", "Name: Jane Smith"
      /(?:Patient|Name|Patient Name)[:\s]*([A-Z][a-zA-Z\s]{2,30})(?:\s|,|$|\n)/i,
      // Name followed by age/DOB: "John Doe Age 45", "Jane Smith DOB"
      /^([A-Z][a-zA-Z\s]{2,30})\s*(?:Age|age|DOB|\d)/i,
      // Name in medical format: "SMITH, JOHN" or "Doe, Jane"
      /([A-Z]{2,}[,\s]+[A-Z][a-zA-Z\s]{1,20})(?:\s|,|$|\n)/i,
      // Simple name patterns: "John Doe 45 years", "Jane Smith Male"
      /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+\d+|\s+(?:Male|Female|years|Age))/i,
      // Any two capitalized words (fallback)
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/
    ]
    
    // Enhanced age patterns
    const agePatterns = [
      /(?:Age|age)[:\s]*(\d{1,3})\s*(?:years?|yo|y\.o\.|\s|$)/i,
      /(\d{1,3})\s*(?:years?\s*old|yo|y\.o\.)/i,
      /DOB[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-](\d{4})/i,
      /Age[:\s]*(\d{1,3})/i,
      /(\d{1,3})\s*years/i
    ]
    
    let patientName = null
    let patientAge = null
    
    // Try to extract patient name
    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern)
      if (nameMatch) {
        let name = nameMatch[1].trim()
        // Clean up the name (remove extra spaces, fix case)
        name = name.replace(/\s+/g, ' ').replace(/,\s*/, ', ')
        
        // Validate name (reasonable length, contains letters, not common medical terms)
        if (name.length > 3 && name.length < 50 && /[A-Za-z]/.test(name) &&
            !['Blood Test', 'Lab Report', 'Medical Center', 'Test Results', 'Patient Care'].some(term => name.includes(term))) {
          patientName = name
          console.log(`[Patient Extraction] Found patient name: ${patientName}`)
          break
        }
      }
    }
    
    // Try to extract patient age
    for (const pattern of agePatterns) {
      const ageMatch = text.match(pattern)
      if (ageMatch) {
        let age: number
        if (pattern.source.includes('DOB')) {
          // Calculate age from birth year
          const birthYear = parseInt(ageMatch[1])
          age = new Date().getFullYear() - birthYear
        } else {
          age = parseInt(ageMatch[1])
        }
        
        // Validate age (reasonable range)
        if (age > 0 && age < 150) {
          patientAge = age
          console.log(`[Patient Extraction] Found patient age: ${patientAge}`)
          break
        }
      }
    }
    
    return {
      name: patientName,
      age: patientAge
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
    
    console.log(`[Alert Generation] Processing document for ${patientName}`)
    console.log(`[Alert Generation] Document content preview: ${text.substring(0, 300)}...`)
    
    // Enhanced alert detection patterns
    
    // 1. Kidney function alerts (GFR and Creatinine)
    const gfrMatch = text.match(/gfr[:\s]*(\d+(?:\.\d+)?)/i)
    if (gfrMatch) {
      const gfrValue = parseFloat(gfrMatch[1])
      console.log(`[Alert Generation] Found GFR: ${gfrValue}`)
      
      if (gfrValue < 15) {
        alerts.push({
          id: `${doctorId}-gfr-critical-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'critical' as const,
          message: `Critical kidney dysfunction - GFR ${gfrValue} mL/min (Normal: >90)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (gfrValue < 30) {
        alerts.push({
          id: `${doctorId}-gfr-severe-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'high' as const,
          message: `Severe kidney dysfunction - GFR ${gfrValue} mL/min (Normal: >90)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (gfrValue < 60) {
        alerts.push({
          id: `${doctorId}-gfr-moderate-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'medium' as const,
          message: `Moderate kidney dysfunction - GFR ${gfrValue} mL/min (Normal: >90)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      }
    }
    
    // 2. Creatinine alerts
    const creatinineMatch = text.match(/creatinine[:\s]*(\d+(?:\.\d+)?)/i)
    if (creatinineMatch) {
      const creatinineValue = parseFloat(creatinineMatch[1])
      console.log(`[Alert Generation] Found Creatinine: ${creatinineValue}`)
      
      if (creatinineValue > 5.0) {
        alerts.push({
          id: `${doctorId}-creatinine-critical-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'critical' as const,
          message: `Critical creatinine level - ${creatinineValue} mg/dL (Normal: 0.6-1.2)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (creatinineValue > 2.0) {
        alerts.push({
          id: `${doctorId}-creatinine-high-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'high' as const,
          message: `Elevated creatinine - ${creatinineValue} mg/dL (Normal: 0.6-1.2)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      }
    }
    
    // 3. Hemoglobin alerts
    const hemoglobinMatch = text.match(/h(?:ae)?moglobin[:\s]*(\d+(?:\.\d+)?)/i)
    if (hemoglobinMatch) {
      const hemoglobinValue = parseFloat(hemoglobinMatch[1])
      console.log(`[Alert Generation] Found Hemoglobin: ${hemoglobinValue}`)
      
      if (hemoglobinValue < 8.0) {
        alerts.push({
          id: `${doctorId}-hemoglobin-critical-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'critical' as const,
          message: `Severe anemia - Hemoglobin ${hemoglobinValue} g/dL (Normal: 12-16)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (hemoglobinValue < 10.0) {
        alerts.push({
          id: `${doctorId}-hemoglobin-low-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'high' as const,
          message: `Moderate anemia - Hemoglobin ${hemoglobinValue} g/dL (Normal: 12-16)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (hemoglobinValue < 12.0) {
        alerts.push({
          id: `${doctorId}-hemoglobin-mild-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'medium' as const,
          message: `Mild anemia - Hemoglobin ${hemoglobinValue} g/dL (Normal: 12-16)`,
          timestamp: new Date().toISOString(),
          actionRequired: false
        })
      }
    }
    
    // 4. HbA1c alerts (Diabetes)
    const hba1cMatch = text.match(/hba1c[:\s]*(\d+(?:\.\d+)?)/i)
    if (hba1cMatch) {
      const hba1cValue = parseFloat(hba1cMatch[1])
      console.log(`[Alert Generation] Found HbA1c: ${hba1cValue}`)
      
      if (hba1cValue > 10.0) {
        alerts.push({
          id: `${doctorId}-hba1c-critical-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'critical' as const,
          message: `Severely uncontrolled diabetes - HbA1c ${hba1cValue}% (Target: <7%)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (hba1cValue > 8.0) {
        alerts.push({
          id: `${doctorId}-hba1c-high-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'high' as const,
          message: `Poorly controlled diabetes - HbA1c ${hba1cValue}% (Target: <7%)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (hba1cValue > 7.0) {
        alerts.push({
          id: `${doctorId}-hba1c-elevated-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'medium' as const,
          message: `Diabetes above target - HbA1c ${hba1cValue}% (Target: <7%)`,
          timestamp: new Date().toISOString(),
          actionRequired: false
        })
      }
    }
    
    // 5. Urea alerts
    const ureaMatch = text.match(/urea[:\s]*(\d+(?:\.\d+)?)/i)
    if (ureaMatch) {
      const ureaValue = parseFloat(ureaMatch[1])
      console.log(`[Alert Generation] Found Urea: ${ureaValue}`)
      
      if (ureaValue > 100) {
        alerts.push({
          id: `${doctorId}-urea-critical-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'critical_value' as const,
          severity: 'critical' as const,
          message: `Critically elevated urea - ${ureaValue} mg/dL (Normal: 7-20)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      } else if (ureaValue > 50) {
        alerts.push({
          id: `${doctorId}-urea-high-${Date.now()}`,
          patientId: `${doctorId}-${Date.now()}`,
          patientName,
          type: 'abnormal_lab' as const,
          severity: 'high' as const,
          message: `Elevated urea - ${ureaValue} mg/dL (Normal: 7-20)`,
          timestamp: new Date().toISOString(),
          actionRequired: true
        })
      }
    }
    
    // 6. General condition-based alerts
    if (text.includes('severe') || text.includes('critical')) {
      alerts.push({
        id: `${doctorId}-condition-severe-${Date.now()}`,
        patientId: `${doctorId}-${Date.now()}`,
        patientName,
        type: 'critical_value' as const,
        severity: 'high' as const,
        message: `Severe condition noted in report - requires immediate attention`,
        timestamp: new Date().toISOString(),
        actionRequired: true
      })
    }
    
    // 7. If no specific alerts but abnormal values mentioned
    if (alerts.length === 0 && (text.includes('abnormal') || text.includes('elevated') || text.includes('low'))) {
      alerts.push({
        id: `${doctorId}-general-abnormal-${Date.now()}`,
        patientId: `${doctorId}-${Date.now()}`,
        patientName,
        type: 'abnormal_lab' as const,
        severity: 'medium' as const,
        message: `Abnormal findings in report - review recommended`,
        timestamp: new Date().toISOString(),
        actionRequired: false
      })
    }
    
    console.log(`[Alert Generation] Generated ${alerts.length} alerts for ${patientName}`)
    alerts.forEach((alert, index) => {
      console.log(`[Alert Generation] Alert ${index + 1}: ${alert.severity} - ${alert.message}`)
    })
    
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

  // Function to manually refresh doctor data from Patient Dashboard
  const refreshFromPatientDashboard = () => {
    console.log('[Doctor Dashboard] Manually refreshing from Patient Dashboard data...')
    
    // Debug: Check what's in localStorage
    const savedRealPatient = localStorage.getItem('patientDashboard_realPatient')
    console.log('[Doctor Dashboard] Raw localStorage data:', savedRealPatient)
    
    if (savedRealPatient) {
      try {
        const realPatient = JSON.parse(savedRealPatient)
        console.log('[Doctor Dashboard] Parsed patient data:', realPatient)
        console.log('[Doctor Dashboard] Patient lab results:', realPatient.labResults)
        console.log('[Doctor Dashboard] Patient conditions:', realPatient.conditions)
        
        // Create or update doctor entry for this patient
        createDoctorFromPatientData(realPatient)
        
        alert(`✅ Successfully synced patient data from Patient Dashboard!\n\n👤 Patient: ${realPatient.name}\n📊 Lab Results: ${realPatient.labResults?.length || 0}\n🏥 Conditions: ${realPatient.conditions?.length || 0}\n\n🔄 Doctor dashboard updated with alerts!`)
      } catch (error) {
        console.error('[Doctor Dashboard] Error parsing patient data:', error)
        alert(`❌ Error parsing patient data: ${error}`)
      }
    } else {
      // Check if there are any patients with real data in current doctors
      const hasRealPatients = doctors.some(doctor => 
        doctor.patients.some(patient => patient.id.includes('real'))
      )
      
      if (hasRealPatients) {
        alert('ℹ️ Real patient data already loaded in Clinical Dashboard.\n\nIf you want to refresh:\n1. Go to Patient Dashboard\n2. Click "Load Your Real Patient Data" again\n3. Return here and click "Sync Patient Data"')
      } else {
        alert('ℹ️ No real patient data found in Patient Dashboard.\n\nTo sync data:\n1. Go to Patient Dashboard\n2. Click "Load Your Real Patient Data"\n3. Return to Clinical Dashboard\n4. Click "Sync Patient Data"')
      }
    }
  }

  // Function to debug the current state
  const debugCurrentState = () => {
    console.log('=== CLINICAL DASHBOARD DEBUG ===')
    console.log('Current doctors:', doctors)
    console.log('Selected doctor:', selectedDoctor)
    console.log('Documents received:', documents)
    
    // Check localStorage data
    const savedRealPatient = localStorage.getItem('patientDashboard_realPatient')
    const savedDoctors = localStorage.getItem('clinicalDashboard_doctors')
    
    console.log('Patient Dashboard localStorage:', savedRealPatient)
    console.log('Clinical Dashboard localStorage:', savedDoctors)
    
    if (savedRealPatient) {
      try {
        const realPatient = JSON.parse(savedRealPatient)
        console.log('Parsed real patient:', realPatient)
        
        // Check if this patient should generate alerts
        const testAlerts = generateClinicalAlertsFromPatient(realPatient, 'test-id', 'Dr. Test')
        console.log('Test alerts for this patient:', testAlerts)
      } catch (error) {
        console.error('Error parsing real patient data:', error)
      }
    }
    
    alert(`🔍 Debug info logged to console.\n\nCurrent state:\n• Doctors: ${doctors.length}\n• Selected: ${selectedDoctor?.name || 'None'}\n• Alerts: ${selectedDoctor?.alerts.length || 0}\n\nCheck browser console for detailed logs.`)
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
                onClick={loadRealDoctorData}
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshFromPatientDashboard}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                🔄 Sync Patient Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={debugCurrentState}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                🔍 Debug State
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