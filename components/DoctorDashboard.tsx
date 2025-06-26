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
  Plus,
  Users,
  Stethoscope,
  Brain,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Star,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  patientsAssigned: number
  activeAlerts: number
  completedToday: number
  rating: number
  status: 'available' | 'busy' | 'offline'
  lastActive: string
}

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  assignedDoctor: string
  condition: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastVisit: string
  nextAppointment?: string
  alerts: number
}

interface ClinicalAlert {
  id: string
  patientId: string
  patientName: string
  type: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  timestamp: string
  assignedDoctor: string
  status: 'new' | 'acknowledged' | 'resolved'
}

interface DoctorLog {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  timestamp: string
  type: 'assessment' | 'treatment' | 'medication' | 'observation' | 'discharge'
  title: string
  content: string
  tags: string[]
}

interface DoctorDashboardProps {
  documents?: any[]
}

export function DoctorDashboard({ documents = [] }: DoctorDashboardProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'alerts' | 'analytics' | 'logs'>('overview')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([])
  const [doctorLogs, setDoctorLogs] = useState<DoctorLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddLogModal, setShowAddLogModal] = useState(false)
  const [showEditLogModal, setShowEditLogModal] = useState(false)
  const [editingLog, setEditingLog] = useState<DoctorLog | null>(null)
  const [newLog, setNewLog] = useState<{
    patientId: string
    type: DoctorLog['type']
    title: string
    content: string
    tags: string[]
  }>({
    patientId: '',
    type: 'assessment',
    title: '',
    content: '',
    tags: []
  })

  // Mock data initialization
  const mockDoctors: Doctor[] = [
    {
      id: 'dr-smith',
      name: 'Dr. Sarah Smith',
      specialty: 'Endocrinology',
      department: 'Internal Medicine',
      patientsAssigned: 12,
      activeAlerts: 3,
      completedToday: 8,
      rating: 4.8,
      status: 'available',
      lastActive: '2 minutes ago'
    },
    {
      id: 'dr-williams',
      name: 'Dr. Michael Williams',
      specialty: 'Nephrology',
      department: 'Internal Medicine',
      patientsAssigned: 15,
      activeAlerts: 5,
      completedToday: 6,
      rating: 4.9,
      status: 'busy',
      lastActive: '15 minutes ago'
    },
    {
      id: 'dr-johnson',
      name: 'Dr. Emily Johnson',
      specialty: 'Cardiology',
      department: 'Cardiovascular',
      patientsAssigned: 18,
      activeAlerts: 2,
      completedToday: 10,
      rating: 4.7,
      status: 'available',
      lastActive: '5 minutes ago'
    }
  ]

  const mockPatients: Patient[] = [
    {
      id: 'patient-1',
      name: 'Sarah Johnson',
      age: 52,
      gender: 'Female',
      assignedDoctor: 'Dr. Sarah Smith',
      condition: 'Type 2 Diabetes',
      priority: 'high',
      lastVisit: '2025-06-20',
      nextAppointment: '2025-07-15',
      alerts: 2
    },
    {
      id: 'patient-2',
      name: 'Robert Chen',
      age: 58,
      gender: 'Male',
      assignedDoctor: 'Dr. Michael Williams',
      condition: 'CKD Stage 3',
      priority: 'critical',
      lastVisit: '2025-06-18',
      nextAppointment: '2025-08-20',
      alerts: 3
    },
    {
      id: 'patient-3',
      name: 'WS DHILLON',
      age: 65,
      gender: 'Male',
      assignedDoctor: 'Dr. Michael Williams',
      condition: 'Severe Kidney Disease',
      priority: 'critical',
      lastVisit: '2025-06-25',
      alerts: 4
    }
  ]

  const mockAlerts: ClinicalAlert[] = [
    {
      id: 'alert-1',
      patientId: 'patient-3',
      patientName: 'WS DHILLON',
      type: 'critical',
      title: 'Critical GFR Level',
      description: 'GFR is 7 mL/min indicating severe kidney disease. Immediate intervention required.',
      timestamp: '2025-06-25T10:30:00Z',
      assignedDoctor: 'Dr. Michael Williams',
      status: 'new'
    },
    {
      id: 'alert-2',
      patientId: 'patient-2',
      patientName: 'Robert Chen',
      type: 'high',
      title: 'Elevated Creatinine',
      description: 'Creatinine levels trending upward. Monitor closely and consider medication adjustment.',
      timestamp: '2025-06-25T09:15:00Z',
      assignedDoctor: 'Dr. Michael Williams',
      status: 'acknowledged'
    },
    {
      id: 'alert-3',
      patientId: 'patient-1',
      patientName: 'Sarah Johnson',
      type: 'high',
      title: 'Poor Diabetes Control',
      description: 'HbA1c is 9.2% indicating poor diabetes control. Medication review needed.',
      timestamp: '2025-06-25T08:45:00Z',
      assignedDoctor: 'Dr. Sarah Smith',
      status: 'new'
    }
  ]

  // Mock Doctor Logs
  const mockDoctorLogs: DoctorLog[] = [
    {
      id: 'log-1',
      patientId: 'patient-3',
      patientName: 'WS DHILLON',
      doctorId: 'dr-williams',
      doctorName: 'Dr. Michael Williams',
      timestamp: '2025-06-25T14:30:00Z',
      type: 'assessment',
      title: 'Critical Kidney Function Assessment',
      content: 'Patient presents with severe kidney dysfunction. GFR at 7 mL/min indicates end-stage renal disease. Immediate dialysis consultation required. Patient is symptomatic with fatigue, shortness of breath, and fluid retention. Family counseled on treatment options including dialysis and potential transplant evaluation.',
      tags: ['critical', 'nephrology', 'dialysis', 'ESRD']
    },
    {
      id: 'log-2',
      patientId: 'patient-2',
      patientName: 'Robert Chen',
      doctorId: 'dr-williams',
      doctorName: 'Dr. Michael Williams',
      timestamp: '2025-06-24T11:15:00Z',
      type: 'medication',
      title: 'ACE Inhibitor Adjustment',
      content: 'Increased Lisinopril from 10mg to 20mg daily due to suboptimal blood pressure control. Patient tolerated previous dose well without significant side effects. Will monitor renal function closely given CKD Stage 3. Follow-up in 2 weeks to assess response.',
      tags: ['medication', 'hypertension', 'ACE-inhibitor', 'CKD']
    },
    {
      id: 'log-3',
      patientId: 'patient-1',
      patientName: 'Sarah Johnson',
      doctorId: 'dr-smith',
      doctorName: 'Dr. Sarah Smith',
      timestamp: '2025-06-23T09:45:00Z',
      type: 'treatment',
      title: 'Diabetes Management Plan Update',
      content: 'HbA1c remains elevated at 9.2% despite current regimen. Adding Ozempic 0.25mg weekly to current Metformin therapy. Patient educated on injection technique and potential side effects. Referred to diabetes educator for comprehensive lifestyle counseling. Target HbA1c <7%.',
      tags: ['diabetes', 'HbA1c', 'GLP-1', 'lifestyle']
    },
    {
      id: 'log-4',
      patientId: 'patient-1',
      patientName: 'Sarah Johnson',
      doctorId: 'dr-smith',
      doctorName: 'Dr. Sarah Smith',
      timestamp: '2025-06-20T16:20:00Z',
      type: 'observation',
      title: 'Weight Management Progress',
      content: 'Patient has lost 3 lbs since last visit. Reports improved dietary compliance and regular exercise 3x/week. Blood pressure improved to 138/85 from previous 145/92. Encouraged to continue current lifestyle modifications. Consider reducing antihypertensive if trend continues.',
      tags: ['weight-loss', 'lifestyle', 'blood-pressure', 'progress']
    },
    {
      id: 'log-5',
      patientId: 'patient-2',
      patientName: 'Robert Chen',
      doctorId: 'dr-williams',
      doctorName: 'Dr. Michael Williams',
      timestamp: '2025-06-18T13:10:00Z',
      type: 'assessment',
      title: 'CKD Progression Monitoring',
      content: 'Creatinine trending upward from 1.6 to 1.8 mg/dL over past 3 months. GFR decreased from 50 to 45 mL/min. Patient counseled on CKD progression and importance of blood pressure control. Discussed potential need for nephrology referral if further decline.',
      tags: ['CKD', 'progression', 'creatinine', 'monitoring']
    },
    {
      id: 'log-6',
      patientId: 'patient-3',
      patientName: 'WS DHILLON',
      doctorId: 'dr-williams',
      doctorName: 'Dr. Michael Williams',
      timestamp: '2025-06-15T10:00:00Z',
      type: 'treatment',
      title: 'Dialysis Access Planning',
      content: 'Discussed dialysis access options with patient and family. Recommended AV fistula creation in non-dominant arm. Referred to vascular surgeon for evaluation. Patient understands the procedure and timeline. Will coordinate with dialysis center for education sessions.',
      tags: ['dialysis', 'access', 'AV-fistula', 'surgery']
    }
  ]

  // Load real patient data from uploaded documents
  const loadRealPatientData = async () => {
    console.log('[Clinical Dashboard] Loading real patient data from documents...')
    
    if (!documents || documents.length === 0) {
      alert('❌ No documents found!\n\nPlease upload medical documents first in the Upload section.')
      return
    }

    let foundNewPatients = false
    const newPatients: Patient[] = []
    const newAlerts: ClinicalAlert[] = []

    documents.forEach((doc: any) => {
      const content = doc.summary || doc.content || ''
      if (!content || content.length < 50) return

      // Extract patient information
      const nameMatch = content.match(/([A-Z]{1,3}\s+[A-Z]{2,})/i)
      const ageMatch = content.match(/(\d{1,3})-year-old/i)
      const genderMatch = content.match(/\b(male|female)\b/i)

      if (nameMatch) {
        const patientName = nameMatch[1].trim()
        const age = ageMatch ? parseInt(ageMatch[1]) : 0
        const gender = genderMatch ? genderMatch[1] : 'Unknown'

        // Determine priority based on lab values
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
        let condition = 'Under Investigation'
        let assignedDoctor = 'Dr. Michael Williams'
        let alertCount = 0

        // Check for critical conditions
        if (content.includes('GFR') && content.match(/GFR[:\s]*(\d+)/i)) {
          const gfrMatch = content.match(/GFR[:\s]*(\d+)/i)
          if (gfrMatch) {
            const gfr = parseInt(gfrMatch[1])
            if (gfr < 15) {
              priority = 'critical'
              condition = 'Severe Kidney Disease'
              alertCount = 4
            } else if (gfr < 60) {
              priority = 'high'
              condition = 'Chronic Kidney Disease'
              alertCount = 2
            }
          }
        }

        if (content.includes('Creatinine') && content.match(/Creatinine[:\s]*(\d+(?:\.\d+)?)/i)) {
          const creatMatch = content.match(/Creatinine[:\s]*(\d+(?:\.\d+)?)/i)
          if (creatMatch) {
            const creatinine = parseFloat(creatMatch[1])
            if (creatinine > 3) {
              priority = 'critical'
              alertCount = Math.max(alertCount, 3)
            }
          }
        }

        const newPatient: Patient = {
          id: `real-patient-${Date.now()}`,
          name: patientName,
          age: age,
          gender: gender.charAt(0).toUpperCase() + gender.slice(1),
          assignedDoctor: assignedDoctor,
          condition: condition,
          priority: priority,
          lastVisit: new Date().toISOString().split('T')[0],
          alerts: alertCount
        }

        newPatients.push(newPatient)
        foundNewPatients = true

        // Create alerts for critical conditions
        if (priority === 'critical') {
          newAlerts.push({
            id: `real-alert-${Date.now()}`,
            patientId: newPatient.id,
            patientName: patientName,
            type: 'critical',
            title: 'Critical Lab Values Detected',
            description: `Patient ${patientName} has critical lab values requiring immediate attention.`,
            timestamp: new Date().toISOString(),
            assignedDoctor: assignedDoctor,
            status: 'new'
          })
        }

        console.log(`[Clinical Dashboard] Added patient: ${patientName} (${priority} priority)`)
      }
    })

    if (foundNewPatients) {
      setPatients(prev => [...mockPatients, ...newPatients])
      setAlerts(prev => [...mockAlerts, ...newAlerts])
      
      // Save to localStorage
      localStorage.setItem('clinicalDashboard_realPatients', JSON.stringify(newPatients))
      localStorage.setItem('clinicalDashboard_realAlerts', JSON.stringify(newAlerts))

      alert(`✅ Successfully loaded ${newPatients.length} real patient(s)!\n\n${newPatients.map(p => `👤 ${p.name} (${p.priority} priority)`).join('\n')}\n\n🚨 ${newAlerts.length} clinical alert(s) generated`)
    } else {
      alert('❌ No patient data could be extracted from the uploaded documents.')
    }
  }

  // Load saved data on mount
  useEffect(() => {
    setDoctors(mockDoctors)
    setPatients(mockPatients)
    setAlerts(mockAlerts)
    setDoctorLogs(mockDoctorLogs) // Load mock doctor logs

    // Load saved doctor logs
    const savedLogs = localStorage.getItem('clinicalDashboard_doctorLogs')
    if (savedLogs) {
      try {
        const logs = JSON.parse(savedLogs)
        setDoctorLogs(prev => [...logs, ...prev]) // Merge saved logs with mock logs
      } catch (error) {
        console.error('Error loading doctor logs:', error)
      }
    }

    // Load any saved real patient data
    const savedPatients = localStorage.getItem('clinicalDashboard_realPatients')
    const savedAlerts = localStorage.getItem('clinicalDashboard_realAlerts')
    
    if (savedPatients) {
      try {
        const realPatients = JSON.parse(savedPatients)
        setPatients(prev => [...prev, ...realPatients])
      } catch (error) {
        console.error('Error loading saved patients:', error)
      }
    }
    
    if (savedAlerts) {
      try {
        const realAlerts = JSON.parse(savedAlerts)
        setAlerts(prev => [...prev, ...realAlerts])
      } catch (error) {
        console.error('Error loading saved alerts:', error)
      }
    }
  }, [])

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterPriority === 'all' || patient.priority === filterPriority
    const matchesDoctor = selectedDoctor === 'all' || patient.assignedDoctor.includes(selectedDoctor)
    
    return matchesSearch && matchesFilter && matchesDoctor
  })

  const filteredAlerts = alerts.filter(alert => {
    const matchesDoctor = selectedDoctor === 'all' || alert.assignedDoctor.includes(selectedDoctor)
    return matchesDoctor
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientModal(true)
  }

  const handleReviewAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      ))
      
      // Save to localStorage
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      )
      localStorage.setItem('clinicalDashboard_alerts', JSON.stringify(updatedAlerts))
      
      console.log(`Alert ${alertId} reviewed and acknowledged`)
    } catch (error) {
      console.error('Error reviewing alert:', error)
    }
  }

  const handleAddDoctorLog = () => {
    if (!newLog.patientId || !newLog.title || !newLog.content) {
      alert('Please fill in all required fields')
      return
    }

    const patient = patients.find(p => p.id === newLog.patientId)
    if (!patient) {
      alert('Patient not found')
      return
    }

    const log: DoctorLog = {
      id: `log-${Date.now()}`,
      patientId: newLog.patientId,
      patientName: patient.name,
      doctorId: 'dr-current',
      doctorName: 'Dr. Sarah Wilson',
      timestamp: new Date().toISOString(),
      type: newLog.type,
      title: newLog.title,
      content: newLog.content,
      tags: newLog.tags
    }

    setDoctorLogs(prev => [log, ...prev])
    
    // Save to localStorage
    const updatedLogs = [log, ...doctorLogs]
    localStorage.setItem('clinicalDashboard_doctorLogs', JSON.stringify(updatedLogs))

    // Reset form
    setNewLog({
      patientId: '',
      type: 'assessment',
      title: '',
      content: '',
      tags: []
    })
    setShowAddLogModal(false)

    alert('✅ Doctor log added successfully!')
  }

  const addTag = (tag: string) => {
    if (tag && !newLog.tags.includes(tag)) {
      setNewLog(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewLog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Auto-generate logs from uploaded documents
  const generateDoctorLogsFromDocuments = async () => {
    console.log('[Doctor Logs] Generating logs from uploaded documents...')
    
    if (!documents || documents.length === 0) {
      alert('❌ No documents found!\n\nPlease upload medical documents first.')
      return
    }

    const newLogs: DoctorLog[] = []
    const currentTime = new Date().toISOString()

    documents.forEach((doc: any, index: number) => {
      const content = doc.summary || doc.content || doc.name || ''
      if (!content || content.length < 20) return

      // Extract patient name
      const namePatterns = [
        /(?:Patient|Name)[:\s]*([A-Z][a-zA-Z\s]{2,30})(?:\s|,|$|\n)/i,
        /([A-Z][a-zA-Z\s]{2,30})\s*(?:Age|age|\d)/i,
        /([A-Z]{2,}[,\s]+[A-Z][a-zA-Z\s]{1,20})/i
      ]

      let patientName = 'Unknown Patient'
      for (const pattern of namePatterns) {
        const match = content.match(pattern)
        if (match) {
          patientName = match[1].trim().replace(/\s+/g, ' ')
          if (patientName.length > 3 && patientName.length < 50) break
        }
      }

      // Determine doctor based on document content
      let assignedDoctor = 'Dr. Sarah Wilson'
      let doctorId = 'dr-wilson'
      
      if (content.toLowerCase().includes('kidney') || content.toLowerCase().includes('nephro') || content.toLowerCase().includes('creatinine') || content.toLowerCase().includes('gfr')) {
        assignedDoctor = 'Dr. Michael Williams'
        doctorId = 'dr-williams'
      } else if (content.toLowerCase().includes('diabetes') || content.toLowerCase().includes('endocrin') || content.toLowerCase().includes('hba1c')) {
        assignedDoctor = 'Dr. Sarah Smith'
        doctorId = 'dr-smith'
      } else if (content.toLowerCase().includes('heart') || content.toLowerCase().includes('cardio') || content.toLowerCase().includes('blood pressure')) {
        assignedDoctor = 'Dr. Emily Johnson'
        doctorId = 'dr-johnson'
      }

      // Generate log based on document content
      let logType: DoctorLog['type'] = 'assessment'
      let title = 'Document Review and Assessment'
      let logContent = `Reviewed uploaded document: ${doc.name}. `
      const tags: string[] = ['document-review']

      // Analyze content for specific conditions
      if (content.includes('GFR') || content.includes('creatinine')) {
        logType = 'assessment'
        title = 'Kidney Function Assessment'
        logContent += 'Laboratory results indicate kidney function abnormalities requiring monitoring and potential intervention. '
        tags.push('nephrology', 'lab-results')
        
        const gfrMatch = content.match(/GFR[:\s]*(\d+)/i)
        const creatMatch = content.match(/creatinine[:\s]*(\d+(?:\.\d+)?)/i)
        
        if (gfrMatch) {
          const gfr = parseInt(gfrMatch[1])
          if (gfr < 15) {
            logContent += `Critical GFR level of ${gfr} mL/min indicates end-stage renal disease. Immediate nephrology consultation and dialysis evaluation required.`
            tags.push('critical', 'dialysis')
          } else if (gfr < 60) {
            logContent += `GFR of ${gfr} mL/min indicates chronic kidney disease. Monitor progression and optimize medical management.`
            tags.push('CKD')
          }
        }
        
        if (creatMatch) {
          const creat = parseFloat(creatMatch[1])
          if (creat > 3) {
            logContent += ` Elevated creatinine at ${creat} mg/dL requires immediate attention.`
            tags.push('elevated-creatinine')
          }
        }
      }

      if (content.includes('HbA1c') || content.includes('diabetes')) {
        logType = 'treatment'
        title = 'Diabetes Management Review'
        logContent += 'Diabetes monitoring results reviewed. '
        tags.push('diabetes', 'endocrinology')
        
        const hba1cMatch = content.match(/HbA1c[:\s]*(\d+(?:\.\d+)?)/i)
        if (hba1cMatch) {
          const hba1c = parseFloat(hba1cMatch[1])
          if (hba1c > 9) {
            logContent += `HbA1c of ${hba1c}% indicates poor glycemic control. Medication adjustment and lifestyle intervention required.`
            tags.push('poor-control', 'medication-adjustment')
          } else if (hba1c > 7) {
            logContent += `HbA1c of ${hba1c}% is above target. Consider treatment optimization.`
            tags.push('above-target')
          }
        }
      }

      if (content.includes('prescription') || content.includes('medication')) {
        logType = 'medication'
        title = 'Medication Review'
        logContent += 'Prescription and medication history reviewed for compliance and effectiveness.'
        tags.push('medication', 'prescription')
      }

      // Create the log entry
      const log: DoctorLog = {
        id: `auto-log-${Date.now()}-${index}`,
        patientId: `real-patient-${patientName.replace(/\s+/g, '-').toLowerCase()}`,
        patientName: patientName,
        doctorId: doctorId,
        doctorName: assignedDoctor,
        timestamp: new Date(Date.now() - (index * 60000)).toISOString(), // Stagger timestamps
        type: logType,
        title: title,
        content: logContent,
        tags: tags
      }

      newLogs.push(log)
      console.log(`[Doctor Logs] Generated log for ${patientName} by ${assignedDoctor}`)
    })

    if (newLogs.length > 0) {
      setDoctorLogs(prev => [...newLogs, ...prev])
      
      // Save to localStorage
      const allLogs = [...newLogs, ...doctorLogs]
      localStorage.setItem('clinicalDashboard_doctorLogs', JSON.stringify(allLogs))

      alert(`✅ Generated ${newLogs.length} doctor log(s) from uploaded documents!\n\n${newLogs.map(log => `📝 ${log.title} - ${log.patientName} (${log.doctorName})`).join('\n')}`)
    } else {
      alert('❌ No suitable content found in documents for log generation.')
    }
  }

  const handleEditLog = (log: DoctorLog) => {
    setEditingLog(log)
    setNewLog({
      patientId: log.patientId,
      type: log.type,
      title: log.title,
      content: log.content,
      tags: log.tags
    })
    setShowEditLogModal(true)
  }

  const handleUpdateLog = () => {
    if (!editingLog || !newLog.title || !newLog.content) {
      alert('Please fill in all required fields')
      return
    }

    const updatedLog: DoctorLog = {
      ...editingLog,
      type: newLog.type,
      title: newLog.title,
      content: newLog.content,
      tags: newLog.tags,
      timestamp: new Date().toISOString() // Update timestamp when edited
    }

    setDoctorLogs(prev => prev.map(log => 
      log.id === editingLog.id ? updatedLog : log
    ))

    // Save to localStorage
    const updatedLogs = doctorLogs.map(log => 
      log.id === editingLog.id ? updatedLog : log
    )
    localStorage.setItem('clinicalDashboard_doctorLogs', JSON.stringify(updatedLogs))

    // Reset form
    setNewLog({
      patientId: '',
      type: 'assessment',
      title: '',
      content: '',
      tags: []
    })
    setEditingLog(null)
    setShowEditLogModal(false)

    alert('✅ Doctor log updated successfully!')
  }

  const handleDeleteLog = (logId: string) => {
    if (confirm('Are you sure you want to delete this log entry?')) {
      setDoctorLogs(prev => prev.filter(log => log.id !== logId))
      
      // Save to localStorage
      const updatedLogs = doctorLogs.filter(log => log.id !== logId)
      localStorage.setItem('clinicalDashboard_doctorLogs', JSON.stringify(updatedLogs))
      
      alert('✅ Doctor log deleted successfully!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="h-7 w-7 mr-3 text-blue-600" />
            Clinical Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive clinical workflow management and patient monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notification Button */}
          <div className="relative">
            <Button 
              variant="outline"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {alerts.filter(a => a.status === 'new').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {alerts.filter(a => a.status === 'new').length}
                </span>
              )}
            </Button>
            
            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Clinical Notifications</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.filter(a => a.status === 'new').length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    alerts.filter(a => a.status === 'new').map((alert) => (
                      <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {alert.patientName} • {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReviewAlert(alert.id)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={loadRealPatientData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Load Real Patient Data
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Doctor Selection & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4 bg-white border-0 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Select Doctor</h3>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.name}>
                {doctor.name}
              </option>
            ))}
          </select>
          
          <div className="mt-4 space-y-3">
            {doctors.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(doctor.status)}`} />
                  <span className="text-sm font-medium">{doctor.name}</span>
                </div>
                <span className="text-xs text-gray-500">{doctor.patientsAssigned} patients</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                <p className="text-xs text-blue-600">↗ Active cases</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.type === 'critical').length}
                </p>
                <p className="text-xs text-red-600">↗ Needs attention</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.filter(d => d.status === 'available').length}
                </p>
                <p className="text-xs text-green-600">↗ Available now</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'patients', label: 'Patient Management', icon: Users },
          { id: 'alerts', label: 'Clinical Alerts', icon: Bell },
          { id: 'logs', label: 'Doctor Logs', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Doctor Performance Cards */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(doctor.status)}`} />
                      <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{doctor.specialty}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{doctor.patientsAssigned}</p>
                      <p className="text-xs text-gray-500">Patients</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{doctor.activeAlerts}</p>
                      <p className="text-xs text-gray-500">Alerts</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{doctor.completedToday}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Last active: {doctor.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Alerts */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Critical Alerts</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('alerts')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {filteredAlerts.filter(a => a.type === 'critical').slice(0, 3).map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Patient: {alert.patientName}</span>
                        <span>Doctor: {alert.assignedDoctor}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name or condition..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </Card>

          {/* Patient List */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Patient List ({filteredPatients.length})
            </h3>
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.age} years, {patient.gender}</p>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{patient.assignedDoctor}</p>
                        <p className="text-xs text-gray-500">Last visit: {patient.lastVisit}</p>
                        {patient.nextAppointment && (
                          <p className="text-xs text-blue-600">Next: {patient.nextAppointment}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(patient.priority)}`}>
                          {patient.priority.toUpperCase()}
                        </span>
                        {patient.alerts > 0 && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {patient.alerts} alerts
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Alerts</h3>
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(alert.type)}`}>
                          {alert.type.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.status === 'new' ? 'bg-red-100 text-red-800' :
                          alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Patient: {alert.patientName}</span>
                        <span>Doctor: {alert.assignedDoctor}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        Acknowledge
                      </Button>
                      <Button size="sm">
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Doctor Update Logs</h3>
              <div className="flex space-x-3">
                <Button 
                  onClick={generateDoctorLogsFromDocuments}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate from Documents
                </Button>
                <Button 
                  onClick={() => setShowAddLogModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log Entry
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {doctorLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No doctor logs yet.</p>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={() => setShowAddLogModal(true)} variant="outline">
                      Add Manual Entry
                    </Button>
                    <Button onClick={generateDoctorLogsFromDocuments} className="bg-blue-600 hover:bg-blue-700">
                      Generate from Documents
                    </Button>
                  </div>
                </div>
              ) : (
                doctorLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{log.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Patient: <span className="font-medium">{log.patientName}</span></span>
                          <span>Doctor: <span className="font-medium">{log.doctorName}</span></span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          log.type === 'assessment' ? 'bg-blue-100 text-blue-800' :
                          log.type === 'treatment' ? 'bg-green-100 text-green-800' :
                          log.type === 'medication' ? 'bg-purple-100 text-purple-800' :
                          log.type === 'observation' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditLog(log)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{log.content}</p>
                    {log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {log.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Priority Distribution</h3>
              <div className="space-y-4">
                {['critical', 'high', 'medium', 'low'].map((priority) => {
                  const count = patients.filter(p => p.priority === priority).length
                  const percentage = patients.length > 0 ? (count / patients.length) * 100 : 0
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{priority}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              priority === 'critical' ? 'bg-red-500' :
                              priority === 'high' ? 'bg-orange-500' :
                              priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Doctors</span>
                  <span className="text-sm font-medium">{doctors.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Doctors</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">{doctors.filter(d => d.status === 'available').length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <span className="text-sm font-medium text-red-600">{alerts.filter(a => a.status === 'new').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Security</span>
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

      {/* Patient Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPatientModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-gray-900">{selectedPatient.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-gray-900">{selectedPatient.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(selectedPatient.priority)}`}>
                    {selectedPatient.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Condition</label>
                  <p className="text-gray-900">{selectedPatient.condition}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned Doctor</label>
                  <p className="text-gray-900">{selectedPatient.assignedDoctor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Visit</label>
                  <p className="text-gray-900">{selectedPatient.lastVisit}</p>
                </div>
                {selectedPatient.nextAppointment && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Next Appointment</label>
                    <p className="text-gray-900">{selectedPatient.nextAppointment}</p>
                  </div>
                )}
              </div>
              
              {selectedPatient.alerts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Active Alerts</h4>
                  <p className="text-red-700">This patient has {selectedPatient.alerts} active clinical alerts requiring attention.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Doctor Log Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddLogModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newLog.patientId}
                  onChange={(e) => setNewLog(prev => ({ ...prev, patientId: e.target.value }))}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.condition}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newLog.type}
                  onChange={(e) => setNewLog(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="assessment">Assessment</option>
                  <option value="treatment">Treatment</option>
                  <option value="medication">Medication</option>
                  <option value="observation">Observation</option>
                  <option value="discharge">Discharge</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Brief title for this log entry"
                  value={newLog.title}
                  onChange={(e) => setNewLog(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="Detailed log entry content..."
                  value={newLog.content}
                  onChange={(e) => setNewLog(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newLog.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement
                      if (input?.value) {
                        addTag(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddLogModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDoctorLog} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Log Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Log Modal */}
      {showEditLogModal && editingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Doctor Log Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEditLogModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={editingLog.patientName}
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={editingLog.doctorName}
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newLog.type}
                  onChange={(e) => setNewLog(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="assessment">Assessment</option>
                  <option value="treatment">Treatment</option>
                  <option value="medication">Medication</option>
                  <option value="observation">Observation</option>
                  <option value="discharge">Discharge</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Brief title for this log entry"
                  value={newLog.title}
                  onChange={(e) => setNewLog(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="Detailed log entry content..."
                  value={newLog.content}
                  onChange={(e) => setNewLog(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newLog.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelectorAll('input[placeholder="Add a tag"]')[1] as HTMLInputElement
                      if (input?.value) {
                        addTag(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditLogModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLog} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Update Log Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 