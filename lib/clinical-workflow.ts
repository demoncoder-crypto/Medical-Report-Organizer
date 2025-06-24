// Clinical Workflow Integration System
import { EMRIntegrationService, PatientProfile, ClinicalAlert } from './emr-integration'
import { MedicalKnowledgeBase } from './medical-knowledge-base'

export interface WorkflowTask {
  id: string
  patientId: string
  type: 'review_labs' | 'medication_reconciliation' | 'follow_up_scheduling' | 'documentation' | 'insurance_authorization'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  dueDate: string
  assignedTo: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimatedTime: number // minutes
  createdDate: string
}

export interface TreatmentRecommendation {
  patientId: string
  condition: string
  recommendation: string
  evidenceLevel: 'A' | 'B' | 'C'
  rationale: string
  alternatives: string[]
  contraindications: string[]
  monitoring: string[]
  followUpRequired: boolean
  followUpTimeframe: string
}

export interface InsuranceClaim {
  id: string
  patientId: string
  serviceDate: string
  procedures: Array<{
    code: string
    description: string
    cost: number
  }>
  diagnosis: string[]
  provider: string
  status: 'pending' | 'submitted' | 'approved' | 'denied' | 'appealing'
  submissionDate?: string
  approvalDate?: string
  denialReason?: string
  estimatedReimbursement: number
}

export interface PatientSummaryReport {
  patientId: string
  generatedDate: string
  demographics: {
    name: string
    age: number
    gender: string
  }
  chiefComplaint: string
  medicalHistory: string[]
  currentMedications: string[]
  allergies: string[]
  vitalSigns: string
  recentLabResults: Array<{
    parameter: string
    value: string
    status: string
    interpretation: string
  }>
  clinicalAlerts: ClinicalAlert[]
  riskFactors: string[]
  treatmentPlan: {
    goals: string[]
    interventions: string[]
    monitoring: string[]
  }
  nextSteps: string[]
}

// Mock workflow data
const WORKFLOW_TASKS: WorkflowTask[] = [
  {
    id: 'TASK001',
    patientId: 'PAT001',
    type: 'review_labs',
    priority: 'high',
    title: 'Review abnormal HbA1c results',
    description: 'Patient John Smith has HbA1c of 7.2%, above target of <7%',
    dueDate: '2024-03-20T10:00:00Z',
    assignedTo: 'Dr. Williams',
    status: 'pending',
    estimatedTime: 15,
    createdDate: '2024-03-15T08:00:00Z'
  },
  {
    id: 'TASK002',
    patientId: 'PAT001',
    type: 'follow_up_scheduling',
    priority: 'medium',
    title: 'Schedule diabetes follow-up',
    description: 'Schedule 3-month follow-up appointment for diabetes management review.',
    dueDate: '2024-03-25T14:00:00Z',
    assignedTo: 'Medical Assistant',
    status: 'pending',
    estimatedTime: 10,
    createdDate: '2024-03-15T08:00:00Z'
  }
]

const INSURANCE_CLAIMS: InsuranceClaim[] = [
  {
    id: 'CLAIM001',
    patientId: 'PAT001',
    serviceDate: '2024-03-15',
    procedures: [
      {
        code: '99213',
        description: 'Office visit - established patient',
        cost: 150
      },
      {
        code: '83036',
        description: 'HbA1c test',
        cost: 45
      }
    ],
    diagnosis: ['Type 2 Diabetes', 'Hypertension'],
    provider: 'Dr. Williams',
    status: 'pending',
    estimatedReimbursement: 156
  }
]

export class ClinicalWorkflowService {
  // Real-time patient summary generation
  static generateRealTimePatientSummary(patientId: string): PatientSummaryReport | null {
    const patient = EMRIntegrationService.getPatientProfile(patientId)
    if (!patient) return null

    const alerts = EMRIntegrationService.getClinicalAlerts(patientId)
    const patientSummaryText = EMRIntegrationService.generatePatientSummary(patientId)

    // Generate treatment recommendations
    const treatmentRecommendations = this.generateTreatmentRecommendations(patient)
    
    const summary: PatientSummaryReport = {
      patientId,
      generatedDate: new Date().toISOString(),
      demographics: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender
      },
      chiefComplaint: 'Diabetes management and hypertension control',
      medicalHistory: patient.conditions,
      currentMedications: patient.medications,
      allergies: patient.allergies,
      vitalSigns: `BP: ${patient.vitals.bloodPressure}, Weight: ${patient.vitals.weight}lbs, BMI: ${patient.vitals.bmi}`,
      recentLabResults: patient.labResults.map(lab => {
        const evaluation = MedicalKnowledgeBase.evaluateLabValue(lab.parameter, lab.value, patient.gender)
        return {
          parameter: lab.parameter,
          value: `${lab.value} ${lab.unit}`,
          status: evaluation.status,
          interpretation: evaluation.interpretation
        }
      }),
      clinicalAlerts: alerts,
      riskFactors: this.identifyRiskFactors(patient),
      treatmentPlan: {
        goals: ['HbA1c <7%', 'BP <130/80', 'LDL <100'],
        interventions: treatmentRecommendations.map(rec => rec.recommendation),
        monitoring: ['HbA1c q3months', 'BP monitoring', 'Annual eye exam']
      },
      nextSteps: this.generateNextSteps(patient, alerts)
    }

    return summary
  }

  // Treatment recommendation engine
  static generateTreatmentRecommendations(patient: PatientProfile): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = []

    // Diabetes management
    if (patient.conditions.includes('Type 2 Diabetes')) {
      const hba1c = patient.labResults.find(lab => lab.parameter === 'HbA1c')
      
      if (hba1c && hba1c.value > 7.0) {
        recommendations.push({
          patientId: patient.id,
          condition: 'Type 2 Diabetes',
          recommendation: 'Consider intensifying diabetes therapy - add GLP-1 agonist or increase metformin dose',
          evidenceLevel: 'A',
          rationale: `Current HbA1c ${hba1c.value}% is above target of <7%. ADA guidelines recommend intensification.`,
          alternatives: ['SGLT-2 inhibitor', 'DPP-4 inhibitor', 'Insulin'],
          contraindications: ['eGFR <30 for metformin', 'History of pancreatitis for GLP-1'],
          monitoring: ['HbA1c in 3 months', 'Kidney function', 'Hypoglycemia symptoms'],
          followUpRequired: true,
          followUpTimeframe: '6-8 weeks'
        })
      }
    }

    // Hypertension management
    if (patient.conditions.includes('Hypertension')) {
      const bpReading = patient.vitals.bloodPressure
      const [systolic] = bpReading.split('/').map(Number)
      
      if (systolic > 130) {
        recommendations.push({
          patientId: patient.id,
          condition: 'Hypertension',
          recommendation: 'Consider increasing lisinopril dose or adding thiazide diuretic',
          evidenceLevel: 'A',
          rationale: `Current BP ${bpReading} is above target <130/80. AHA/ACC guidelines recommend dual therapy.`,
          alternatives: ['ARB', 'Calcium channel blocker', 'Beta-blocker'],
          contraindications: ['Pregnancy', 'Bilateral renal artery stenosis'],
          monitoring: ['Blood pressure', 'Electrolytes', 'Kidney function'],
          followUpRequired: true,
          followUpTimeframe: '2-4 weeks'
        })
      }
    }

    return recommendations
  }

  // Workflow task management
  static getWorkflowTasks(providerId: string): WorkflowTask[] {
    return WORKFLOW_TASKS.filter(task => task.assignedTo === providerId)
  }

  static createWorkflowTask(task: Omit<WorkflowTask, 'id' | 'createdDate'>): WorkflowTask {
    const newTask: WorkflowTask = {
      ...task,
      id: `TASK${Date.now()}`,
      createdDate: new Date().toISOString()
    }
    
    WORKFLOW_TASKS.push(newTask)
    return newTask
  }

  static updateTaskStatus(taskId: string, status: WorkflowTask['status']): boolean {
    const task = WORKFLOW_TASKS.find(t => t.id === taskId)
    if (task) {
      task.status = status
      return true
    }
    return false
  }

  // Insurance claim automation
  static generateInsuranceClaim(
    patientId: string,
    serviceDate: string,
    procedures: Array<{code: string, description: string, cost: number}>,
    diagnosis: string[],
    provider: string
  ): InsuranceClaim {
    const claim: InsuranceClaim = {
      id: `CLAIM${Date.now()}`,
      patientId,
      serviceDate,
      procedures,
      diagnosis,
      provider,
      status: 'pending',
      estimatedReimbursement: procedures.reduce((sum, proc) => sum + proc.cost, 0) * 0.8 // 80% reimbursement estimate
    }

    INSURANCE_CLAIMS.push(claim)
    return claim
  }

  static submitInsuranceClaim(claimId: string): boolean {
    const claim = INSURANCE_CLAIMS.find(c => c.id === claimId)
    if (claim && claim.status === 'pending') {
      claim.status = 'submitted'
      claim.submissionDate = new Date().toISOString()
      return true
    }
    return false
  }

  static getInsuranceClaims(patientId?: string): InsuranceClaim[] {
    if (patientId) {
      return INSURANCE_CLAIMS.filter(claim => claim.patientId === patientId)
    }
    return INSURANCE_CLAIMS
  }

  // Clinical decision support helpers
  private static identifyRiskFactors(patient: PatientProfile): string[] {
    const riskFactors: string[] = []
    
    if (patient.vitals.bmi > 25) {
      riskFactors.push(`Overweight (BMI: ${patient.vitals.bmi})`)
    }
    
    if (patient.conditions.includes('Type 2 Diabetes') && patient.conditions.includes('Hypertension')) {
      riskFactors.push('Multiple cardiovascular risk factors')
    }
    
    const hba1c = patient.labResults.find(lab => lab.parameter === 'HbA1c')
    if (hba1c && hba1c.value > 8.0) {
      riskFactors.push('Poor glycemic control (HbA1c >8%)')
    }
    
    if (patient.age > 65) {
      riskFactors.push('Advanced age')
    }

    return riskFactors
  }

  private static generateNextSteps(patient: PatientProfile, alerts: ClinicalAlert[]): string[] {
    const nextSteps: string[] = []
    
    // Based on alerts
    alerts.forEach(alert => {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        nextSteps.push(alert.actionRequired)
      }
    })
    
    // Standard follow-ups
    if (patient.conditions.includes('Type 2 Diabetes')) {
      nextSteps.push('Schedule diabetes educator consultation')
      nextSteps.push('Order annual diabetic eye exam')
    }
    
    if (patient.conditions.includes('Hypertension')) {
      nextSteps.push('Home blood pressure monitoring education')
    }
    
    // Preventive care
    if (patient.age > 50) {
      nextSteps.push('Discuss colorectal cancer screening')
    }
    
    return nextSteps
  }

  // Performance metrics
  static getWorkflowMetrics(): {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    averageCompletionTime: number
    tasksByPriority: Record<string, number>
  } {
    const now = new Date()
    const completedTasks = WORKFLOW_TASKS.filter(task => task.status === 'completed')
    const overdueTasks = WORKFLOW_TASKS.filter(task => 
      task.status !== 'completed' && new Date(task.dueDate) < now
    )
    
    const tasksByPriority = WORKFLOW_TASKS.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalTasks: WORKFLOW_TASKS.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      averageCompletionTime: 25, // Mock average in minutes
      tasksByPriority
    }
  }
} 