// EMR Integration System - Electronic Medical Records
import { MedicalKnowledgeBase } from './medical-knowledge-base'

export interface PatientProfile {
  id: string
  name: string
  age: number
  gender: 'M' | 'F'
  conditions: string[]
  medications: string[]
  allergies: string[]
  vitals: {
    bloodPressure: string
    weight: number
    bmi: number
  }
  labResults: Array<{
    parameter: string
    value: number
    unit: string
    status: string
    date: string
  }>
}

export interface ClinicalAlert {
  id: string
  type: string
  severity: string
  message: string
  actionRequired: string
}

export interface TreatmentPlan {
  patientId: string
  conditions: string[]
  goals: string[]
  medications: Array<{
    name: string
    indication: string
    dosage: string
    duration: string
    monitoring: string[]
  }>
  nonPharmacological: string[]
  followUp: string[]
  patientEducation: string[]
  riskFactors: string[]
}

// Mock EMR Database
const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'PAT001',
    name: 'John Smith',
    age: 59,
    gender: 'M',
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia'],
    medications: ['Lisinopril', 'Metformin', 'Atorvastatin'],
    allergies: ['Penicillin'],
    vitals: {
      bloodPressure: '135/85',
      weight: 185,
      bmi: 26.5
    },
    labResults: [
      {
        parameter: 'HbA1c',
        value: 7.2,
        unit: '%',
        status: 'abnormal',
        date: '2024-03-10'
      },
      {
        parameter: 'LDL Cholesterol',
        value: 95,
        unit: 'mg/dL',
        status: 'normal',
        date: '2024-03-10'
      }
    ]
  }
]

export class EMRIntegrationService {
  static getPatientProfile(patientId: string): PatientProfile | null {
    return MOCK_PATIENTS.find(p => p.id === patientId) || null
  }

  static generatePatientSummary(patientId: string): string {
    const patient = this.getPatientProfile(patientId)
    if (!patient) return 'Patient not found'

    return `${patient.name}, ${patient.age}yo ${patient.gender === 'M' ? 'male' : 'female'} with ${patient.conditions.join(', ')}. Current medications: ${patient.medications.join(', ')}. Latest BP: ${patient.vitals.bloodPressure}, BMI: ${patient.vitals.bmi}.`
  }

  static getClinicalAlerts(patientId: string): ClinicalAlert[] {
    const patient = this.getPatientProfile(patientId)
    if (!patient) return []

    const alerts: ClinicalAlert[] = []

    // Check for drug interactions
    if (patient.medications.includes('Lisinopril') && patient.medications.includes('Potassium')) {
      alerts.push({
        id: 'ALERT_001',
        type: 'drug_interaction',
        severity: 'moderate',
        message: 'Drug interaction: Lisinopril + Potassium supplements',
        actionRequired: 'Monitor serum potassium levels'
      })
    }

    // Check lab values
    const hba1c = patient.labResults.find(lab => lab.parameter === 'HbA1c')
    if (hba1c && hba1c.value > 7.0) {
      alerts.push({
        id: 'ALERT_002',
        type: 'lab_abnormal',
        severity: 'medium',
        message: `HbA1c elevated at ${hba1c.value}%`,
        actionRequired: 'Consider medication adjustment or lifestyle counseling'
      })
    }

    return alerts
  }

  static generateTreatmentPlan(patientId: string): TreatmentPlan | null {
    const patient = this.getPatientProfile(patientId)
    if (!patient) return null

    const treatmentPlan: TreatmentPlan = {
      patientId,
      conditions: patient.conditions,
      goals: [
        'Achieve HbA1c <7%',
        'Maintain blood pressure <130/80',
        'LDL cholesterol <100 mg/dL',
        'Weight loss of 5-10%'
      ],
      medications: patient.medications.map(med => ({
        name: med,
        indication: patient.conditions.find(condition => condition.toLowerCase().includes(med.toLowerCase())) || '',
        dosage: '10mg',
        duration: 'Ongoing',
        monitoring: this.getMedicationMonitoring(med)
      })),
      nonPharmacological: [
        'Mediterranean diet',
        'Regular exercise 150 min/week',
        'Blood glucose monitoring',
        'Weight management',
        'Smoking cessation counseling'
      ],
      followUp: [
        'Diabetes follow-up in 3 months',
        'Annual eye exam',
        'Annual foot exam',
        'Lipid panel in 6 months'
      ],
      patientEducation: [
        'Diabetes self-management',
        'Hypoglycemia recognition',
        'Medication adherence',
        'Lifestyle modifications',
        'When to seek medical attention'
      ],
      riskFactors: [
        'Family history of cardiovascular disease',
        'Overweight BMI',
        'Multiple chronic conditions'
      ]
    }

    return treatmentPlan
  }

  private static calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  private static getMedicationMonitoring(medicationName: string): string[] {
    const monitoring: { [key: string]: string[] } = {
      'Lisinopril': ['Blood pressure', 'Potassium', 'Creatinine'],
      'Metformin': ['HbA1c', 'Kidney function', 'B12 levels'],
      'Atorvastatin': ['Lipid panel', 'Liver enzymes', 'CK if symptoms']
    }
    
    return monitoring[medicationName] || ['Routine monitoring']
  }

  static getLabTrends(patientId: string, parameter: string): Array<{
    date: string
    value: number
    trend: string
  }> {
    const patient = this.getPatientProfile(patientId)
    if (!patient) return []

    return patient.labResults
      .filter(lab => lab.parameter === parameter)
      .map(lab => ({
        date: lab.date,
        value: lab.value,
        trend: lab.status === 'normal' ? 'stable' : 'needs attention'
      }))
  }
} 