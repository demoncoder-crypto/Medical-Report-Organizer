// Comprehensive Medical Knowledge Base
export interface DrugInteractionEntry {
  drug1: string
  drug2: string
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated'
  mechanism: string
  clinicalEffect: string
  management: string
  evidence: string
  sources: string[]
}

export interface LabRange {
  parameter: string
  unit: string
  normalMin: number
  normalMax: number
  criticalLow: number
  criticalHigh: number
  gender?: 'M' | 'F' | 'both'
}

export interface ClinicalGuideline {
  condition: string
  organization: string
  firstLine: string[]
  secondLine: string[]
  monitoring: string[]
  evidenceLevel: 'A' | 'B' | 'C'
}

export interface MedicationProfile {
  name: string
  genericName: string
  class: string
  mechanism: string
  indications: string[]
  contraindications: string[]
  sideEffects: string[]
  interactions: string[]
  monitoring: string[]
  dosing: {
    adult: string
    pediatric?: string
    renal?: string
    hepatic?: string
  }
}

// Comprehensive Drug Interaction Database
export const DRUG_INTERACTIONS: DrugInteractionEntry[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'severe',
    mechanism: 'Additive anticoagulant effects',
    clinicalEffect: 'Increased bleeding risk, especially GI and intracranial',
    management: 'Avoid combination if possible. If necessary, monitor INR closely',
    evidence: 'Multiple RCTs show 2-3x increased bleeding risk',
    sources: ['FDA Drug Interactions Database', 'Lexicomp']
  },
  {
    drug1: 'metformin',
    drug2: 'contrast dye',
    severity: 'severe',
    mechanism: 'Reduced renal clearance of metformin',
    clinicalEffect: 'Risk of lactic acidosis',
    management: 'Hold metformin 48 hours before and after contrast',
    evidence: 'FDA Black Box Warning',
    sources: ['FDA', 'ACR Guidelines']
  },
  {
    drug1: 'lisinopril',
    drug2: 'potassium',
    severity: 'moderate',
    mechanism: 'ACE inhibitors reduce potassium excretion',
    clinicalEffect: 'Hyperkalemia risk',
    management: 'Monitor serum potassium weekly initially',
    evidence: 'Well-documented in clinical practice',
    sources: ['AHA Guidelines']
  },
  {
    drug1: 'simvastatin',
    drug2: 'amiodarone',
    severity: 'severe',
    mechanism: 'CYP3A4 inhibition increases statin levels',
    clinicalEffect: 'Increased risk of rhabdomyolysis',
    management: 'Limit simvastatin to 20mg daily or switch to different statin',
    evidence: 'FDA safety communication 2011',
    sources: ['FDA', 'Cardiology guidelines']
  },
  {
    drug1: 'digoxin',
    drug2: 'furosemide',
    severity: 'moderate',
    mechanism: 'Diuretic-induced hypokalemia increases digoxin toxicity',
    clinicalEffect: 'Increased risk of digoxin toxicity',
    management: 'Monitor potassium and digoxin levels closely',
    evidence: 'Classic pharmacology interaction',
    sources: ['Pharmacology textbooks', 'Clinical experience']
  }
]

// Laboratory Normal Ranges
export const LAB_RANGES: LabRange[] = [
  {
    parameter: 'Hemoglobin',
    unit: 'g/dL',
    normalMin: 12.0,
    normalMax: 15.5,
    criticalLow: 7.0,
    criticalHigh: 20.0,
    gender: 'F'
  },
  {
    parameter: 'Hemoglobin',
    unit: 'g/dL',
    normalMin: 13.5,
    normalMax: 17.5,
    criticalLow: 7.0,
    criticalHigh: 20.0,
    gender: 'M'
  },
  {
    parameter: 'Glucose',
    unit: 'mg/dL',
    normalMin: 70,
    normalMax: 99,
    criticalLow: 50,
    criticalHigh: 400,
    gender: 'both'
  },
  {
    parameter: 'HbA1c',
    unit: '%',
    normalMin: 4.0,
    normalMax: 5.6,
    criticalLow: 3.0,
    criticalHigh: 15.0,
    gender: 'both'
  },
  {
    parameter: 'Total Cholesterol',
    unit: 'mg/dL',
    normalMin: 0,
    normalMax: 200,
    criticalLow: 0,
    criticalHigh: 500,
    gender: 'both'
  },
  {
    parameter: 'LDL Cholesterol',
    unit: 'mg/dL',
    normalMin: 0,
    normalMax: 100,
    criticalLow: 0,
    criticalHigh: 300,
    gender: 'both'
  },
  {
    parameter: 'HDL Cholesterol',
    unit: 'mg/dL',
    normalMin: 40,
    normalMax: 200,
    criticalLow: 20,
    criticalHigh: 200,
    gender: 'M'
  },
  {
    parameter: 'HDL Cholesterol',
    unit: 'mg/dL',
    normalMin: 50,
    normalMax: 200,
    criticalLow: 20,
    criticalHigh: 200,
    gender: 'F'
  },
  {
    parameter: 'Creatinine',
    unit: 'mg/dL',
    normalMin: 0.6,
    normalMax: 1.2,
    criticalLow: 0.3,
    criticalHigh: 10.0,
    gender: 'both'
  },
  {
    parameter: 'eGFR',
    unit: 'mL/min/1.73m²',
    normalMin: 90,
    normalMax: 200,
    criticalLow: 15,
    criticalHigh: 200,
    gender: 'both'
  },
  {
    parameter: 'Blood Pressure Systolic',
    unit: 'mmHg',
    normalMin: 90,
    normalMax: 120,
    criticalLow: 70,
    criticalHigh: 180,
    gender: 'both'
  },
  {
    parameter: 'Blood Pressure Diastolic',
    unit: 'mmHg',
    normalMin: 60,
    normalMax: 80,
    criticalLow: 40,
    criticalHigh: 110,
    gender: 'both'
  }
]

// Clinical Guidelines Database
export const CLINICAL_GUIDELINES: ClinicalGuideline[] = [
  {
    condition: 'Hypertension',
    organization: 'AHA/ACC 2017',
    firstLine: ['ACE inhibitor', 'ARB', 'Thiazide diuretic', 'Calcium channel blocker'],
    secondLine: ['Beta-blocker', 'Aldosterone antagonist'],
    monitoring: ['Blood pressure', 'Electrolytes', 'Kidney function'],
    evidenceLevel: 'A'
  },
  {
    condition: 'Type 2 Diabetes',
    organization: 'ADA 2023',
    firstLine: ['Metformin', 'Lifestyle modification'],
    secondLine: ['GLP-1 agonist', 'SGLT-2 inhibitor', 'Insulin'],
    monitoring: ['HbA1c q3months', 'Annual eye exam', 'Lipids'],
    evidenceLevel: 'A'
  },
  {
    condition: 'Hyperlipidemia',
    organization: 'ACC/AHA 2018',
    firstLine: ['High-intensity statin', 'Moderate-intensity statin'],
    secondLine: ['Ezetimibe', 'PCSK9 inhibitor'],
    monitoring: ['Lipid panel 4-12 weeks', 'Liver enzymes', 'CK if symptoms'],
    evidenceLevel: 'A'
  }
]

// Medication Database
export const MEDICATION_DATABASE: MedicationProfile[] = [
  {
    name: 'Lisinopril',
    genericName: 'lisinopril',
    class: 'ACE Inhibitor',
    mechanism: 'Inhibits angiotensin-converting enzyme',
    indications: ['Hypertension', 'Heart failure', 'Post-MI'],
    contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Angioedema history'],
    sideEffects: ['Dry cough', 'Hyperkalemia', 'Angioedema', 'Hypotension'],
    interactions: ['Potassium supplements', 'NSAIDs', 'Lithium'],
    monitoring: ['Blood pressure', 'Potassium', 'Creatinine'],
    dosing: {
      adult: '5-40mg daily',
      renal: 'Reduce dose if CrCl <30',
      hepatic: 'No adjustment needed'
    }
  },
  {
    name: 'Metformin',
    genericName: 'metformin',
    class: 'Biguanide',
    mechanism: 'Decreases hepatic glucose production, increases insulin sensitivity',
    indications: ['Type 2 diabetes', 'Prediabetes', 'PCOS'],
    contraindications: ['eGFR <30', 'Metabolic acidosis', 'Severe heart failure'],
    sideEffects: ['GI upset', 'Lactic acidosis (rare)', 'B12 deficiency'],
    interactions: ['Contrast dye', 'Alcohol', 'Topiramate'],
    monitoring: ['HbA1c', 'Kidney function', 'B12 levels'],
    dosing: {
      adult: '500-2000mg daily in divided doses',
      renal: 'Avoid if eGFR <30',
      hepatic: 'Use with caution'
    }
  }
]

// Clinical Decision Support Functions
export class MedicalKnowledgeBase {
  static findDrugInteractions(medications: string[]): DrugInteractionEntry[] {
    const interactions: DrugInteractionEntry[] = []
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].toLowerCase()
        const drug2 = medications[j].toLowerCase()
        
        const interaction = DRUG_INTERACTIONS.find(entry =>
          (entry.drug1.toLowerCase().includes(drug1) && entry.drug2.toLowerCase().includes(drug2)) ||
          (entry.drug1.toLowerCase().includes(drug2) && entry.drug2.toLowerCase().includes(drug1))
        )
        
        if (interaction) {
          interactions.push(interaction)
        }
      }
    }
    
    return interactions
  }
  
  static evaluateLabValue(parameter: string, value: number, gender?: 'M' | 'F'): {
    status: 'normal' | 'abnormal' | 'critical'
    interpretation: string
    recommendations: string[]
  } {
    const labRange = LAB_RANGES.find(range => 
      range.parameter.toLowerCase() === parameter.toLowerCase() &&
      (range.gender === 'both' || range.gender === gender)
    )
    
    if (!labRange) {
      return {
        status: 'normal',
        interpretation: 'Reference range not available',
        recommendations: ['Consult laboratory reference values']
      }
    }
    
    if (value <= labRange.criticalLow || value >= labRange.criticalHigh) {
      return {
        status: 'critical',
        interpretation: `CRITICAL: ${value} ${labRange.unit} (Normal: ${labRange.normalMin}-${labRange.normalMax})`,
        recommendations: ['Immediate clinical attention required', 'Repeat test to confirm']
      }
    }
    
    if (value < labRange.normalMin || value > labRange.normalMax) {
      return {
        status: 'abnormal',
        interpretation: `Abnormal: ${value} ${labRange.unit} (Normal: ${labRange.normalMin}-${labRange.normalMax})`,
        recommendations: ['Clinical correlation recommended', 'Consider repeat testing']
      }
    }
    
    return {
      status: 'normal',
      interpretation: `Normal: ${value} ${labRange.unit}`,
      recommendations: ['Continue routine monitoring']
    }
  }
  
  static getTreatmentGuidelines(condition: string): ClinicalGuideline | null {
    return CLINICAL_GUIDELINES.find(guideline =>
      guideline.condition.toLowerCase() === condition.toLowerCase()
    ) || null
  }
  
  static getMedicationInfo(medicationName: string): MedicationProfile | null {
    return MEDICATION_DATABASE.find(med =>
      med.name.toLowerCase() === medicationName.toLowerCase() ||
      med.genericName.toLowerCase() === medicationName.toLowerCase()
    ) || null
  }
  
  static generateTreatmentRecommendations(
    conditions: string[],
    currentMedications: string[],
    labValues: Array<{parameter: string, value: number, unit: string}>
  ): {
    recommendations: string[]
    warnings: string[]
    monitoring: string[]
  } {
    const recommendations: string[] = []
    const warnings: string[] = []
    const monitoring: string[] = []
    
    // Check each condition against guidelines
    conditions.forEach(condition => {
      const guideline = this.getTreatmentGuidelines(condition)
      if (guideline) {
        const isOnFirstLine = guideline.firstLine.some(med =>
          currentMedications.some(currentMed => 
            currentMed.toLowerCase().includes(med.toLowerCase())
          )
        )
        
        if (!isOnFirstLine) {
          recommendations.push(`Consider first-line therapy for ${condition}: ${guideline.firstLine.join(', ')}`)
        }
        
        monitoring.push(...guideline.monitoring)
      }
    })
    
    // Check drug interactions
    const interactions = this.findDrugInteractions(currentMedications)
    interactions.forEach(interaction => {
      if (interaction.severity === 'severe' || interaction.severity === 'contraindicated') {
        warnings.push(`${interaction.severity.toUpperCase()}: ${interaction.drug1} + ${interaction.drug2} - ${interaction.management}`)
      }
    })
    
    return {
      recommendations: Array.from(new Set(recommendations)),
      warnings: Array.from(new Set(warnings)),
      monitoring: Array.from(new Set(monitoring))
    }
  }
} 