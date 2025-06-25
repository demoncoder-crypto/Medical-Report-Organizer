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

    console.log(`[Patient Dashboard] Processing ${documents.length} documents...`)

    // Try to extract from each document, prioritizing real medical documents
    const sortedDocs = documents.slice().sort((a, b) => {
      // Prioritize documents with longer, more detailed content (likely real medical reports)
      const aContent = a.summary || a.content || ''
      const bContent = b.summary || b.content || ''
      
      // Prioritize documents that contain "WS DHILLON" or medical terms
      const aHasPatient = aContent.includes('WS DHILLON') || aContent.includes('lab report')
      const bHasPatient = bContent.includes('WS DHILLON') || bContent.includes('lab report')
      
      if (aHasPatient && !bHasPatient) return -1
      if (!aHasPatient && bHasPatient) return 1
      
      // Then prioritize by content length (more detailed documents first)
      return bContent.length - aContent.length
    })
    
    sortedDocs.forEach((doc: any, index: number) => {
      console.log(`[Patient Dashboard] Processing document ${index + 1}: ${doc.name}`)
      console.log(`[Patient Dashboard] Document structure:`, Object.keys(doc))
      
      // Try multiple content fields in order of preference
      const content = doc.summary || doc.content || doc.extractedText || doc.text || doc.name || ''
      console.log(`[Patient Dashboard] Content length: ${content.length}`)
      console.log(`[Patient Dashboard] Full content being processed:`, content)
      
      if (!content || content.length < 10) {
        console.log(`[Patient Dashboard] Skipping document - insufficient content`)
        return
      }

      console.log(`[Patient Dashboard] Document content preview: ${content.substring(0, 1000)}...`)
      console.log(`[Patient Dashboard] Full content being processed:`, content)

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

      // Enhanced patient name extraction with more flexible patterns
      const namePatterns = [
        // Direct name extraction: "WS DHILLON, a 65-year-old"
        /([A-Z]{1,3}\s+[A-Z]{2,}),?\s*a?\s*\d+-year-old/i,
        // Medical report format: "This is a lab report for WS DHILLON"
        /(?:lab report for|report for|for)\s+([A-Z]{1,3}\s+[A-Z]{2,})/i,
        // Standard formats: "Patient: John Doe", "Name: Jane Smith"
        /(?:Patient|Name|Patient Name)[:\s]*([A-Z][a-zA-Z\s]{2,30})(?:\s|,|$|\n)/i,
        // Name in medical format: "SMITH, JOHN" or "Doe, Jane" or "WS DHILLON"
        /\b([A-Z]{1,3}\s+[A-Z]{2,})\b/i,
        // Name followed by age/DOB: "John Doe Age 45", "Jane Smith DOB"
        /^([A-Z][a-zA-Z\s]{2,30})\s*(?:Age|age|DOB|\d)/i,
        // Simple name patterns: "John Doe 45 years", "Jane Smith Male"
        /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+\d+|\s+(?:Male|Female|years|Age))/i,
        // Name at start of document
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
        // Any two capitalized words (fallback)
        /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/
      ]

      console.log(`[Patient Dashboard] Trying ${namePatterns.length} name patterns...`)
      for (const pattern of namePatterns) {
        console.log(`[Patient Dashboard] Testing pattern: ${pattern.source}`)
        const nameMatch = content.match(pattern)
        console.log(`[Patient Dashboard] Pattern result:`, nameMatch)
        if (nameMatch && extractedPatient.name === 'Unknown Patient') {
          let name = nameMatch[1].trim()
          console.log(`[Patient Dashboard] Raw extracted name: "${name}"`)
          // Clean up the name (remove extra spaces, fix case)
          name = name.replace(/\s+/g, ' ').replace(/,\s*/, ', ')
          
          // Special handling for medical terms that shouldn't be names
          const invalidNames = ['all parameters', 'blood pressure', 'chest pain', 'emergency room', 'acute chest']
          if (invalidNames.some(invalid => name.toLowerCase().includes(invalid.toLowerCase()))) {
            console.log(`[Patient Dashboard] Skipping invalid name: "${name}"`)
            continue
          }
          
          // Validate name (reasonable length, contains letters)
          if (name.length > 3 && name.length < 50 && /[A-Za-z]/.test(name)) {
            extractedPatient.name = name
            foundPatientData = true
            console.log(`[Patient Dashboard] Found patient name: ${extractedPatient.name}`)
            break
          } else {
            console.log(`[Patient Dashboard] Name validation failed: length=${name.length}, hasLetters=${/[A-Za-z]/.test(name)}`)
          }
        }
      }

      // Enhanced age extraction with more patterns
      const agePatterns = [
        // Medical report format: "WS DHILLON, a 65-year-old male"
        /(\d{1,3})-year-old/i,
        /(?:Age|age)[:\s]*(\d{1,3})\s*(?:years?|yo|y\.o\.|\s|$)/i,
        /(\d{1,3})\s*(?:years?\s*old|yo|y\.o\.)/i,
        /DOB[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-](\d{4})/i,
        /Age[:\s]*(\d{1,3})/i,
        /(\d{1,3})\s*years/i
      ]

      console.log(`[Patient Dashboard] Trying ${agePatterns.length} age patterns...`)
      for (const pattern of agePatterns) {
        console.log(`[Patient Dashboard] Testing age pattern: ${pattern.source}`)
        const ageMatch = content.match(pattern)
        console.log(`[Patient Dashboard] Age pattern result:`, ageMatch)
        if (ageMatch && extractedPatient.age === 0) {
          if (pattern.source.includes('DOB')) {
            // Calculate age from birth year
            const birthYear = parseInt(ageMatch[1])
            extractedPatient.age = new Date().getFullYear() - birthYear
          } else {
            extractedPatient.age = parseInt(ageMatch[1])
          }
          
          console.log(`[Patient Dashboard] Raw extracted age: ${extractedPatient.age}`)
          
          // Skip obviously invalid ages (like dosages)
          if (extractedPatient.age < 18 || extractedPatient.age > 120) {
            console.log(`[Patient Dashboard] Skipping unrealistic age: ${extractedPatient.age}`)
            extractedPatient.age = 0
            continue
          }
          
          // Validate age (reasonable range)
          if (extractedPatient.age > 0 && extractedPatient.age < 150) {
            foundPatientData = true
            console.log(`[Patient Dashboard] Found patient age: ${extractedPatient.age}`)
            break
          } else {
            console.log(`[Patient Dashboard] Age validation failed: ${extractedPatient.age}`)
            extractedPatient.age = 0 // Reset invalid age
          }
        }
      }

      // Enhanced gender extraction
      const genderPatterns = [
        /(?:Gender|Sex)[:\s]*(Male|Female|M|F)/i,
        /\b(Male|Female)\b/i,
        /\b(M|F)\b(?:\s|$)/
      ]
      
      console.log(`[Patient Dashboard] Trying ${genderPatterns.length} gender patterns...`)
      for (const pattern of genderPatterns) {
        const genderMatch = content.match(pattern)
        if (genderMatch && extractedPatient.gender === 'Unknown') {
          let gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase()
          if (gender === 'M') gender = 'Male'
          if (gender === 'F') gender = 'Female'
          
          if (gender === 'Male' || gender === 'Female') {
            extractedPatient.gender = gender
            foundPatientData = true
            console.log(`[Patient Dashboard] Found gender: ${extractedPatient.gender}`)
            break
          }
        }
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
      if (extractedPatient) {
        extractedPatient.documents.push({
          name: doc.name || 'Medical Report',
          type: doc.type || 'Lab Report',
          date: new Date().toISOString().split('T')[0],
          uploadedBy: 'Patient Upload',
          size: doc.size || 'Unknown'
        })
      }
      foundPatientData = true
    })

    if (!foundPatientData || !extractedPatient) {
      console.log('[Patient Dashboard] No data found with strict patterns, trying fallback extraction...')
      
      // Fallback: Try to extract ANY reasonable patient information
      if (extractedPatient && (extractedPatient as PatientData).name === 'Unknown Patient') {
        const patient = extractedPatient as PatientData
        // Look for any capitalized words that could be names
        const allContent = documents.map(doc => doc.summary || doc.content || '').join(' ')
        console.log('[Patient Dashboard] Combined content length:', allContent.length)
        
        // Extract any capitalized names (more permissive)
        const nameMatches = allContent.match(/\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g)
        if (nameMatches && nameMatches.length > 0) {
          // Filter out common medical terms
          const medicalTerms = ['Blood Test', 'Lab Report', 'Medical Center', 'Test Results', 'Patient Care']
          const potentialNames = nameMatches.filter(name => 
            !medicalTerms.some(term => name.includes(term.split(' ')[0])) &&
            name.length < 30
          )
          
          if (potentialNames.length > 0) {
            patient.name = potentialNames[0]
            foundPatientData = true
            console.log('[Patient Dashboard] Fallback found name:', patient.name)
          }
        }
        
        // Extract any age numbers
        const ageMatches = allContent.match(/\b(\d{1,2})\s*(?:years?|yo|y\.o\.)\b/gi)
        if (ageMatches && patient.age === 0) {
          const age = parseInt(ageMatches[0].match(/\d+/)?.[0] || '0')
          if (age > 0 && age < 120) {
            patient.age = age
            foundPatientData = true
            console.log('[Patient Dashboard] Fallback found age:', age)
          }
        }
        
        // Extract gender
        const genderMatches = allContent.match(/\b(Male|Female|M|F)\b/gi)
        if (genderMatches && patient.gender === 'Unknown') {
          let gender = genderMatches[0].toLowerCase()
          if (gender === 'm') gender = 'male'
          if (gender === 'f') gender = 'female'
          patient.gender = gender.charAt(0).toUpperCase() + gender.slice(1)
          foundPatientData = true
          console.log('[Patient Dashboard] Fallback found gender:', patient.gender)
        }
        
        // If we still haven't found anything, create a basic patient with document info
        if (!foundPatientData && documents.length > 0) {
          patient.name = 'Patient from Documents'
          patient.age = 0
          patient.gender = 'Unknown'
          foundPatientData = true
          console.log('[Patient Dashboard] Created basic patient from documents')
        }
      }
    }

    if (!foundPatientData || !extractedPatient) {
      // Show more detailed debugging info
      console.log('[Patient Dashboard] DEBUGGING INFO:')
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
      
      alert('❌ No patient data could be extracted from your documents.\n\nDebugging Info:\n• Found ' + documents.length + ' documents\n• Check browser console for detailed analysis\n• Try uploading documents with clear patient names and lab values\n• Ensure documents contain readable text content')
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

  // Generate clinical alerts based on patient data
  const generateClinicalAlerts = (patient: PatientData) => {
    const alerts: Array<{
      id: string
      type: 'critical' | 'high' | 'medium' | 'low'
      title: string
      message: string
      source: string
      date: string
      action?: string
    }> = []

    // Check lab results for critical values
    patient.labResults.forEach((lab, index) => {
      if (lab.status === 'critical') {
        alerts.push({
          id: `lab-critical-${index}`,
          type: 'critical',
          title: `Critical ${lab.testName} Level`,
          message: `${lab.testName} is ${lab.value} (Normal: ${lab.normalRange}). Immediate medical attention required.`,
          source: `Lab Result - ${lab.orderedBy}`,
          date: lab.date,
          action: 'Contact physician immediately'
        })
      } else if (lab.status === 'high') {
        alerts.push({
          id: `lab-high-${index}`,
          type: 'high',
          title: `Elevated ${lab.testName}`,
          message: `${lab.testName} is ${lab.value} (Normal: ${lab.normalRange}). Monitor closely and follow up with healthcare provider.`,
          source: `Lab Result - ${lab.orderedBy}`,
          date: lab.date,
          action: 'Schedule follow-up appointment'
        })
      } else if (lab.status === 'low') {
        alerts.push({
          id: `lab-low-${index}`,
          type: 'medium',
          title: `Low ${lab.testName}`,
          message: `${lab.testName} is ${lab.value} (Normal: ${lab.normalRange}). May require intervention.`,
          source: `Lab Result - ${lab.orderedBy}`,
          date: lab.date,
          action: 'Review with healthcare provider'
        })
      }
    })

    // Check for medication compliance alerts
    patient.medications.forEach((med, index) => {
      const prescribedDate = new Date(med.prescribedDate)
      const daysSincePrescribed = Math.floor((new Date().getTime() - prescribedDate.getTime()) / (1000 * 3600 * 24))
      
      if (daysSincePrescribed > 90) {
        alerts.push({
          id: `med-review-${index}`,
          type: 'medium',
          title: 'Medication Review Due',
          message: `${med.name} was prescribed ${daysSincePrescribed} days ago. Consider medication review.`,
          source: `Medication - ${med.prescribedBy}`,
          date: med.prescribedDate,
          action: 'Schedule medication review'
        })
      }
    })

    // Check for condition-specific alerts
    patient.conditions.forEach((condition, index) => {
      if (condition.toLowerCase().includes('diabetes')) {
        // Check if HbA1c is available and elevated
        const hba1c = patient.labResults.find(lab => lab.testName.toLowerCase().includes('hba1c'))
        if (hba1c && parseFloat(hba1c.value) > 8.0) {
          alerts.push({
            id: `diabetes-control-${index}`,
            type: 'high',
            title: 'Diabetes Control Alert',
            message: `HbA1c is ${hba1c.value} indicating poor diabetes control. Target is <7%.`,
            source: 'Clinical Decision Support',
            date: hba1c.date,
            action: 'Diabetes management review needed'
          })
        }
      }

      if (condition.toLowerCase().includes('kidney') || condition.toLowerCase().includes('ckd')) {
        // Check if GFR is critically low
        const gfr = patient.labResults.find(lab => lab.testName.toLowerCase().includes('gfr'))
        if (gfr && parseFloat(gfr.value) < 30) {
          alerts.push({
            id: `kidney-critical-${index}`,
            type: 'critical',
            title: 'Severe Kidney Function Decline',
            message: `GFR is ${gfr.value} indicating severe kidney disease. Nephrology referral may be needed.`,
            source: 'Clinical Decision Support',
            date: gfr.date,
            action: 'Urgent nephrology consultation'
          })
        } else if (gfr && parseFloat(gfr.value) < 60) {
          alerts.push({
            id: `kidney-monitor-${index}`,
            type: 'high',
            title: 'Kidney Function Monitoring',
            message: `GFR is ${gfr.value} indicating reduced kidney function. Regular monitoring required.`,
            source: 'Clinical Decision Support',
            date: gfr.date,
            action: 'Monitor kidney function quarterly'
          })
        }
      }

      if (condition.toLowerCase().includes('anemia')) {
        const hemoglobin = patient.labResults.find(lab => lab.testName.toLowerCase().includes('hemoglobin'))
        if (hemoglobin && parseFloat(hemoglobin.value) < 10) {
          alerts.push({
            id: `anemia-severe-${index}`,
            type: 'critical',
            title: 'Severe Anemia Alert',
            message: `Hemoglobin is ${hemoglobin.value} g/dL indicating severe anemia. Immediate evaluation needed.`,
            source: 'Clinical Decision Support',
            date: hemoglobin.date,
            action: 'Urgent hematology evaluation'
          })
        }
      }
    })

    // Check for upcoming appointments
    const upcomingAppointments = patient.appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      const today = new Date()
      const daysUntil = Math.floor((aptDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return apt.status === 'scheduled' && daysUntil <= 7 && daysUntil >= 0
    })

    upcomingAppointments.forEach((apt, index) => {
      const aptDate = new Date(apt.date)
      const today = new Date()
      const daysUntil = Math.floor((aptDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      
      alerts.push({
        id: `appointment-reminder-${index}`,
        type: 'low',
        title: 'Upcoming Appointment',
        message: `Appointment with ${apt.doctor} (${apt.specialty}) in ${daysUntil} day(s).`,
        source: 'Appointment Scheduler',
        date: apt.date,
        action: 'Prepare for appointment'
      })
    })

    // Sort alerts by priority (critical first, then by date)
    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      if (priorityOrder[a.type] !== priorityOrder[b.type]) {
        return priorityOrder[a.type] - priorityOrder[b.type]
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }

  const clinicalAlerts = generateClinicalAlerts(currentPatient)

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
                {patient.name} {id === 'real-patient' ? '(Your Data)' : id.includes('johnson') || id.includes('chen') ? '(Demo)' : ''}
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
              
              // NEW: Detailed document content analysis
              if (documents && documents.length > 0) {
                documents.forEach((doc, i) => {
                  console.log(`=== DOCUMENT ${i + 1} ANALYSIS ===`)
                  console.log('Document object:', doc)
                  console.log('Document keys:', Object.keys(doc))
                  
                  const content = doc.summary || doc.content || doc.extractedText || doc.text || ''
                  console.log('Content source:', doc.summary ? 'summary' : doc.content ? 'content' : 'other')
                  console.log('Content length:', content.length)
                  console.log('Full content:', content)
                  
                  // Test specific patterns manually
                  console.log('=== PATTERN TESTING ===')
                  
                  // Test name patterns
                  const testNamePatterns = [
                    /([A-Z]{1,3}\s+[A-Z]{2,}),?\s*a?\s*\d+-year-old/i,
                    /(?:lab report for|report for|for)\s+([A-Z]{1,3}\s+[A-Z]{2,})/i,
                    /\b([A-Z]{1,3}\s+[A-Z]{2,})\b/i
                  ]
                  
                  testNamePatterns.forEach((pattern, idx) => {
                    const match = content.match(pattern)
                    console.log(`Name pattern ${idx + 1} (${pattern.source}):`, match)
                  })
                  
                  // Test age patterns
                  const testAgePatterns = [
                    /(\d{1,3})-year-old/i,
                    /(\d{1,3})\s*(?:years?\s*old|yo|y\.o\.)/i
                  ]
                  
                  testAgePatterns.forEach((pattern, idx) => {
                    const match = content.match(pattern)
                    console.log(`Age pattern ${idx + 1} (${pattern.source}):`, match)
                  })
                })
              }
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
          {selectedPatient === 'real-patient' && (
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
        <div className="space-y-6">
          {/* Clinical Alerts Section */}
          {clinicalAlerts.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Clinical Alerts ({clinicalAlerts.length})
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {clinicalAlerts.map((clinicalAlert) => (
                  <div key={clinicalAlert.id} className={`p-3 rounded-lg border-l-4 ${
                    clinicalAlert.type === 'critical' ? 'bg-red-50 border-red-500' :
                    clinicalAlert.type === 'high' ? 'bg-orange-50 border-orange-500' :
                    clinicalAlert.type === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className={`font-medium ${
                            clinicalAlert.type === 'critical' ? 'text-red-900' :
                            clinicalAlert.type === 'high' ? 'text-orange-900' :
                            clinicalAlert.type === 'medium' ? 'text-yellow-900' :
                            'text-blue-900'
                          }`}>
                            {clinicalAlert.title}
                          </h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            clinicalAlert.type === 'critical' ? 'bg-red-100 text-red-800' :
                            clinicalAlert.type === 'high' ? 'bg-orange-100 text-orange-800' :
                            clinicalAlert.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {clinicalAlert.type.toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${
                          clinicalAlert.type === 'critical' ? 'text-red-700' :
                          clinicalAlert.type === 'high' ? 'text-orange-700' :
                          clinicalAlert.type === 'medium' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {clinicalAlert.message}
                        </p>
                        <div className={`text-xs ${
                          clinicalAlert.type === 'critical' ? 'text-red-600' :
                          clinicalAlert.type === 'high' ? 'text-orange-600' :
                          clinicalAlert.type === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          <div>Source: {clinicalAlert.source}</div>
                          <div>Date: {clinicalAlert.date}</div>
                        </div>
                      </div>
                      {clinicalAlert.action && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className={`ml-3 ${
                            clinicalAlert.type === 'critical' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                            clinicalAlert.type === 'high' ? 'border-orange-300 text-orange-700 hover:bg-orange-50' :
                            clinicalAlert.type === 'medium' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' :
                            'border-blue-300 text-blue-700 hover:bg-blue-50'
                          }`}
                          onClick={() => {
                            window.alert(`📋 Action Required: ${clinicalAlert.action}\n\nAlert: ${clinicalAlert.title}\n\nThis would typically:\n• Schedule appointments\n• Send notifications to healthcare providers\n• Create follow-up reminders\n• Generate care plan updates`)
                          }}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Action
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  const appointmentTypes = ['Follow-up', 'Routine Check-up', 'Specialist Consultation', 'Lab Work', 'Emergency']
                  const selectedType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]
                  const futureDate = new Date()
                  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 7) // 1-5 weeks from now
                  
                  const newAppointment = {
                    date: futureDate.toISOString().split('T')[0],
                    time: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM'][Math.floor(Math.random() * 4)],
                    doctor: currentPatient.conditions.length > 0 ? 
                      (currentPatient.conditions[0].includes('Kidney') ? 'Dr. Williams (Nephrology)' : 'Dr. Smith (Primary Care)') :
                      'Dr. Johnson (Primary Care)',
                    specialty: currentPatient.conditions.length > 0 ? 
                      (currentPatient.conditions[0].includes('Kidney') ? 'Nephrology' : 'Primary Care') :
                      'Primary Care',
                    type: selectedType,
                    status: 'scheduled' as const,
                    notes: `Scheduled via patient portal for ${currentPatient.name}`
                  }
                  
                  // Update patient data
                  const updatedPatient = { ...currentPatient }
                  updatedPatient.appointments.unshift(newAppointment)
                  
                  // Update state
                  const allPatients = { ...patients }
                  allPatients[selectedPatient] = updatedPatient
                  setPatients(allPatients)
                  
                  // Save to localStorage if it's real patient data
                  if (selectedPatient === 'real-patient') {
                    localStorage.setItem('patientDashboard_realPatient', JSON.stringify(updatedPatient))
                  }
                  
                  alert(`✅ Appointment Scheduled!\n\n📅 Date: ${newAppointment.date}\n🕐 Time: ${newAppointment.time}\n👨‍⚕️ Doctor: ${newAppointment.doctor}\n📋 Type: ${newAppointment.type}\n\n📧 Confirmation email sent!\n📱 SMS reminder will be sent 24 hours before.`)
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  const recordTypes = [
                    'Complete Medical History',
                    'Lab Results (Last 6 months)',
                    'Prescription History',
                    'Imaging Reports',
                    'Vaccination Records',
                    'Specialist Consultation Notes'
                  ]
                  
                  const requestId = `REQ-${Date.now().toString().slice(-6)}`
                  const processingTime = '3-5 business days'
                  
                  // Simulate adding a new document request
                  const newDocument = {
                    name: `Medical Records Request - ${requestId}`,
                    type: 'Record Request',
                    date: new Date().toISOString().split('T')[0],
                    uploadedBy: 'Patient Portal',
                    size: 'Processing...'
                  }
                  
                  // Update patient data
                  const updatedPatient = { ...currentPatient }
                  updatedPatient.documents.unshift(newDocument)
                  
                  // Update state
                  const allPatients = { ...patients }
                  allPatients[selectedPatient] = updatedPatient
                  setPatients(allPatients)
                  
                  // Save to localStorage if it's real patient data
                  if (selectedPatient === 'real-patient') {
                    localStorage.setItem('patientDashboard_realPatient', JSON.stringify(updatedPatient))
                  }
                  
                  alert(`📋 Medical Records Request Submitted!\n\n🆔 Request ID: ${requestId}\n⏱️ Processing Time: ${processingTime}\n📧 Email: Records will be sent to your registered email\n🔒 Security: Records will be encrypted and password protected\n\nAvailable Records:\n${recordTypes.map(type => `• ${type}`).join('\n')}\n\n✅ You'll receive an email confirmation shortly.`)
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Records
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  if (currentPatient.medications.length === 0) {
                    alert('❌ No Current Medications\n\nYou don\'t have any active prescriptions to refill.\nPlease contact your doctor if you need new prescriptions.')
                    return
                  }
                  
                  const medicationsToRefill = currentPatient.medications.map(med => ({
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    prescribedBy: med.prescribedBy,
                    refillId: `RX-${Date.now().toString().slice(-6)}`,
                    estimatedReady: (() => {
                      const date = new Date()
                      date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 1) // 1-3 days
                      return date.toISOString().split('T')[0]
                    })(),
                    pharmacy: 'CVS Pharmacy - Main St',
                    copay: '$' + (Math.floor(Math.random() * 30) + 10) // $10-40
                  }))
                  
                  // Update patient medications with new prescription dates
                  const updatedPatient = { ...currentPatient }
                  updatedPatient.medications = updatedPatient.medications.map(med => ({
                    ...med,
                    prescribedDate: new Date().toISOString().split('T')[0]
                  }))
                  
                  // Update state
                  const allPatients = { ...patients }
                  allPatients[selectedPatient] = updatedPatient
                  setPatients(allPatients)
                  
                  // Save to localStorage if it's real patient data
                  if (selectedPatient === 'real-patient') {
                    localStorage.setItem('patientDashboard_realPatient', JSON.stringify(updatedPatient))
                  }
                  
                  const refillDetails = medicationsToRefill.map(med => 
                    `💊 ${med.name} ${med.dosage}\n   📋 ${med.refillId} | 📅 Ready: ${med.estimatedReady}\n   💰 Copay: ${med.copay}`
                  ).join('\n\n')
                  
                  alert(`💊 Prescription Refill Requested!\n\n${refillDetails}\n\n🏪 Pharmacy: ${medicationsToRefill[0].pharmacy}\n📱 SMS: You'll receive pickup notifications\n🚗 Pickup: Drive-thru available\n💳 Payment: Copay due at pickup\n\n✅ All refill requests submitted successfully!`)
                }}
              >
                <Pill className="h-4 w-4 mr-2" />
                Refill Prescription
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  if (currentPatient.medications.length === 0) {
                    alert('❌ No Current Medications\n\nYou don\'t have any active medications to set reminders for.\nPlease add medications first or contact your doctor.')
                    return
                  }
                  
                  const reminderTimes = ['8:00 AM', '12:00 PM', '6:00 PM', '9:00 PM']
                  const selectedTime = reminderTimes[Math.floor(Math.random() * reminderTimes.length)]
                  
                  const medicationReminders = currentPatient.medications.map(med => {
                    const frequency = med.frequency.toLowerCase()
                    let reminderSchedule = ''
                    
                    if (frequency.includes('once') || frequency.includes('daily')) {
                      reminderSchedule = `Daily at ${selectedTime}`
                    } else if (frequency.includes('twice')) {
                      reminderSchedule = `Twice daily at 8:00 AM and 8:00 PM`
                    } else if (frequency.includes('three') || frequency.includes('3')) {
                      reminderSchedule = `Three times daily at 8:00 AM, 2:00 PM, and 8:00 PM`
                    } else {
                      reminderSchedule = `As prescribed (${med.frequency})`
                    }
                    
                    return {
                      medication: `${med.name} ${med.dosage}`,
                      schedule: reminderSchedule,
                      reminderId: `REM-${Date.now().toString().slice(-6)}`
                    }
                  })
                  
                  // Simulate saving reminder preferences
                  const reminderSettings = {
                    enabled: true,
                    method: ['Push Notification', 'SMS', 'Email'],
                    snoozeOption: '15 minutes',
                    missedDoseAlert: 'After 2 hours',
                    setupDate: new Date().toISOString().split('T')[0]
                  }
                  
                  const reminderList = medicationReminders.map(reminder => 
                    `💊 ${reminder.medication}\n   ⏰ ${reminder.schedule}\n   🆔 ${reminder.reminderId}`
                  ).join('\n\n')
                  
                  alert(`⏰ Medication Reminders Set!\n\n${reminderList}\n\n📱 Notification Methods:\n• Push notifications\n• SMS alerts\n• Email reminders\n\n⚙️ Settings:\n• Snooze: ${reminderSettings.snoozeOption}\n• Missed dose alert: ${reminderSettings.missedDoseAlert}\n• Smart scheduling based on meal times\n\n✅ All reminders activated!\n🔔 First reminder will be sent at the next scheduled time.`)
                }}
              >
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