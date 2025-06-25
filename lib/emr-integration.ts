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

// EMR Integration Layer - Simulates real Epic, Cerner, and other EHR systems
// In production, this would connect to actual FHIR APIs

export interface FHIRPatient {
  id: string
  identifier: string
  name: {
    given: string[]
    family: string
  }
  gender: 'male' | 'female' | 'other'
  birthDate: string
  telecom: Array<{
    system: 'phone' | 'email'
    value: string
  }>
  address: Array<{
    line: string[]
    city: string
    state: string
    postalCode: string
  }>
  maritalStatus?: string
  contact?: Array<{
    relationship: string
    name: string
    telecom: string
  }>
}

export interface FHIRObservation {
  id: string
  status: 'registered' | 'preliminary' | 'final' | 'amended'
  category: string
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string // Patient/123
  }
  effectiveDateTime: string
  valueQuantity?: {
    value: number
    unit: string
    system: string
  }
  valueString?: string
  interpretation?: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  referenceRange?: Array<{
    low: {
      value: number
      unit: string
    }
    high: {
      value: number
      unit: string
    }
    text: string
  }>
}

export interface FHIRMedicationRequest {
  id: string
  status: 'active' | 'on-hold' | 'cancelled' | 'completed'
  intent: 'proposal' | 'plan' | 'order'
  medicationCodeableConcept: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  authoredOn: string
  requester: {
    reference: string
  }
  dosageInstruction: Array<{
    text: string
    timing: {
      repeat: {
        frequency: number
        period: number
        periodUnit: string
      }
    }
    route: {
      coding: Array<{
        code: string
        display: string
      }>
    }
    doseAndRate: Array<{
      doseQuantity: {
        value: number
        unit: string
      }
    }>
  }>
}

export interface FHIRCondition {
  id: string
  clinicalStatus: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  verificationStatus: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  category: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  onsetDateTime?: string
  recordedDate: string
}

export interface FHIRAppointment {
  id: string
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled'
  serviceCategory: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  serviceType: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  appointmentType: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  reasonCode: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  start: string
  end: string
  participant: Array<{
    actor: {
      reference: string
      display: string
    }
    required: 'required' | 'optional' | 'information-only'
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action'
  }>
}

// FHIR Integration Service (Epic/Cerner)
export class FHIRIntegrationService {
  private static baseUrl = process.env.FHIR_BASE_URL || 'https://api.epic.com/fhir/r4'
  private static apiKey = process.env.EMR_API_KEY || 'demo-key'

  // In production, these would be real API calls to Epic/Cerner FHIR endpoints
  static async getPatient(patientId: string): Promise<FHIRPatient | null> {
    try {
      // Simulate Epic MyChart API call
      const mockPatient: FHIRPatient = {
        id: patientId,
        identifier: `MRN-${patientId}`,
        name: {
          given: ['Sarah', 'Elizabeth'],
          family: 'Johnson'
        },
        gender: 'female',
        birthDate: '1978-05-15',
        telecom: [
          {
            system: 'phone',
            value: '555-123-4567'
          },
          {
            system: 'email',
            value: 'sarah.johnson@email.com'
          }
        ],
        address: [
          {
            line: ['123 Main St', 'Apt 4B'],
            city: 'Boston',
            state: 'MA',
            postalCode: '02101'
          }
        ],
        maritalStatus: 'married',
        contact: [
          {
            relationship: 'spouse',
            name: 'John Johnson',
            telecom: '555-123-4568'
          }
        ]
      }

      return mockPatient
    } catch (error) {
      console.error('EMR Integration Error:', error)
      return null
    }
  }

  static async getPatientObservations(patientId: string, category?: string): Promise<FHIRObservation[]> {
    // Simulate lab results from Epic/Cerner
    const mockObservations: FHIRObservation[] = [
      {
        id: 'obs-1',
        status: 'final',
        category: 'laboratory',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '4548-4',
              display: 'Hemoglobin A1c/Hemoglobin.total in Blood'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        valueQuantity: {
          value: 9.2,
          unit: '%',
          system: 'http://unitsofmeasure.org'
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'H',
                display: 'High'
              }
            ]
          }
        ],
        referenceRange: [
          {
            low: {
              value: 4.0,
              unit: '%'
            },
            high: {
              value: 5.6,
              unit: '%'
            },
            text: 'Normal (non-diabetic)'
          }
        ]
      },
      {
        id: 'obs-2',
        status: 'final',
        category: 'laboratory',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '2339-0',
              display: 'Glucose [Mass/volume] in Blood'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        valueQuantity: {
          value: 245,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org'
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'H',
                display: 'High'
              }
            ]
          }
        ]
      },
      {
        id: 'obs-3',
        status: 'final',
        category: 'vital-signs',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: '2024-01-20T14:15:00Z',
        valueQuantity: {
          value: 165,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org'
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'H',
                display: 'High'
              }
            ]
          }
        ]
      }
    ]

    return category 
      ? mockObservations.filter(obs => obs.category === category)
      : mockObservations
  }

  static async getPatientMedications(patientId: string): Promise<FHIRMedicationRequest[]> {
    const mockMedications: FHIRMedicationRequest[] = [
      {
        id: 'med-1',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '860975',
              display: 'Metformin 500 MG Oral Tablet'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        authoredOn: '2024-01-01T00:00:00Z',
        requester: {
          reference: 'Practitioner/dr-williams'
        },
        dosageInstruction: [
          {
            text: 'Take 1 tablet by mouth twice daily with meals',
            timing: {
              repeat: {
                frequency: 2,
                period: 1,
                periodUnit: 'd'
              }
            },
            route: {
              coding: [
                {
                  code: 'PO',
                  display: 'Oral'
                }
              ]
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 500,
                  unit: 'mg'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'med-2',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '314076',
              display: 'Lisinopril 10 MG Oral Tablet'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        authoredOn: '2024-01-01T00:00:00Z',
        requester: {
          reference: 'Practitioner/dr-williams'
        },
        dosageInstruction: [
          {
            text: 'Take 1 tablet by mouth once daily',
            timing: {
              repeat: {
                frequency: 1,
                period: 1,
                periodUnit: 'd'
              }
            },
            route: {
              coding: [
                {
                  code: 'PO',
                  display: 'Oral'
                }
              ]
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 10,
                  unit: 'mg'
                }
              }
            ]
          }
        ]
      }
    ]

    return mockMedications
  }

  static async getPatientConditions(patientId: string): Promise<FHIRCondition[]> {
    const mockConditions: FHIRCondition[] = [
      {
        id: 'cond-1',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'confirmed',
              display: 'Confirmed'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '44054006',
              display: 'Type 2 diabetes mellitus'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        onsetDateTime: '2018-03-15',
        recordedDate: '2018-03-15T00:00:00Z'
      },
      {
        id: 'cond-2',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'confirmed',
              display: 'Confirmed'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '38341003',
              display: 'Essential hypertension'
            }
          ]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        onsetDateTime: '2019-08-22',
        recordedDate: '2019-08-22T00:00:00Z'
      }
    ]

    return mockConditions
  }

  static async getPatientAppointments(patientId: string): Promise<FHIRAppointment[]> {
    const mockAppointments: FHIRAppointment[] = [
      {
        id: 'appt-1',
        status: 'booked',
        serviceCategory: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/service-category',
                code: '17',
                display: 'General Practice'
              }
            ]
          }
        ],
        serviceType: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/service-type',
                code: '124',
                display: 'General Practice'
              }
            ]
          }
        ],
        appointmentType: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
              code: 'ROUTINE',
              display: 'Routine appointment'
            }
          ]
        },
        reasonCode: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '390906007',
                display: 'Follow-up encounter'
              }
            ]
          }
        ],
        start: '2024-01-25T10:00:00Z',
        end: '2024-01-25T10:30:00Z',
        participant: [
          {
            actor: {
              reference: `Patient/${patientId}`,
              display: 'Sarah Johnson'
            },
            required: 'required',
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Practitioner/dr-williams',
              display: 'Dr. Sarah Williams'
            },
            required: 'required',
            status: 'accepted'
          }
        ]
      }
    ]

    return mockAppointments
  }

  // Comprehensive patient summary combining all EMR data
  static async getComprehensivePatientSummary(patientId: string): Promise<{
    patient: FHIRPatient | null
    conditions: FHIRCondition[]
    medications: FHIRMedicationRequest[]
    observations: FHIRObservation[]
    appointments: FHIRAppointment[]
    clinicalSummary: {
      activeProblems: string[]
      currentMedications: string[]
      recentLabs: Array<{
        name: string
        value: string
        status: 'normal' | 'abnormal' | 'critical'
        date: string
      }>
      upcomingAppointments: Array<{
        date: string
        type: string
        provider: string
      }>
      riskFactors: string[]
      recommendations: string[]
    }
  }> {
    try {
      const [patient, conditions, medications, observations, appointments] = await Promise.all([
        this.getPatient(patientId),
        this.getPatientConditions(patientId),
        this.getPatientMedications(patientId),
        this.getPatientObservations(patientId),
        this.getPatientAppointments(patientId)
      ])

      // Generate clinical summary
      const activeProblems = conditions
        .filter(c => c.clinicalStatus.coding[0]?.code === 'active')
        .map(c => c.code.coding[0]?.display || 'Unknown condition')

      const currentMedications = medications
        .filter(m => m.status === 'active')
        .map(m => m.medicationCodeableConcept.coding[0]?.display || 'Unknown medication')

      const recentLabs = observations
        .filter(o => o.category === 'laboratory')
        .map(o => ({
          name: o.code.coding[0]?.display || 'Unknown test',
          value: o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit}` : o.valueString || 'N/A',
          status: o.interpretation?.[0]?.coding[0]?.code === 'H' ? 'abnormal' as const : 'normal' as const,
          date: new Date(o.effectiveDateTime).toLocaleDateString()
        }))

      const upcomingAppointments = appointments
        .filter(a => new Date(a.start) > new Date())
        .map(a => ({
          date: new Date(a.start).toLocaleDateString(),
          type: a.appointmentType.coding[0]?.display || 'Unknown',
          provider: a.participant.find(p => p.actor.reference.includes('Practitioner'))?.actor.display || 'Unknown'
        }))

      // Generate risk factors and recommendations
      const riskFactors: string[] = []
      const recommendations: string[] = []

      // Analyze conditions for risk factors
      if (activeProblems.some(p => p.toLowerCase().includes('diabetes'))) {
        riskFactors.push('Diabetes mellitus - increased cardiovascular risk')
        recommendations.push('Monitor HbA1c every 3 months, annual eye exam')
      }

      if (activeProblems.some(p => p.toLowerCase().includes('hypertension'))) {
        riskFactors.push('Hypertension - cardiovascular risk factor')
        recommendations.push('Monitor blood pressure regularly, lifestyle modifications')
      }

      // Analyze lab values for additional risks
      const hba1c = observations.find(o => o.code.coding[0]?.code === '4548-4')
      if (hba1c && hba1c.valueQuantity && hba1c.valueQuantity.value > 7) {
        riskFactors.push('Poor glycemic control (HbA1c > 7%)')
        recommendations.push('Consider medication adjustment, diabetes education')
      }

      return {
        patient,
        conditions,
        medications,
        observations,
        appointments,
        clinicalSummary: {
          activeProblems,
          currentMedications,
          recentLabs,
          upcomingAppointments,
          riskFactors,
          recommendations
        }
      }
    } catch (error) {
      console.error('Error getting comprehensive patient summary:', error)
      throw error
    }
  }

  // Real-time clinical alerts based on EMR data
  static async getClinicalAlerts(patientId: string): Promise<Array<{
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    type: 'lab' | 'medication' | 'appointment' | 'condition'
    message: string
    actionRequired: boolean
    timestamp: string
  }>> {
    const summary = await this.getComprehensivePatientSummary(patientId)
    const alerts: Array<{
      id: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      type: 'lab' | 'medication' | 'appointment' | 'condition'
      message: string
      actionRequired: boolean
      timestamp: string
    }> = []

    // Check for critical lab values
    summary.observations.forEach((obs, index) => {
      if (obs.interpretation?.[0]?.coding[0]?.code === 'H') {
        const testName = obs.code.coding[0]?.display || 'Unknown test'
        const value = obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit}` : 'N/A'
        
        alerts.push({
          id: `alert-lab-${index}`,
          severity: 'high',
          type: 'lab',
          message: `Abnormal ${testName}: ${value}`,
          actionRequired: true,
          timestamp: obs.effectiveDateTime
        })
      }
    })

    return alerts
  }
} 