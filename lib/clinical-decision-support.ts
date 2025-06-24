import { GoogleGenerativeAI } from '@google/generative-ai'
import { MedicalDocument, MedicalTimeline } from './medical-rag'

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated'
  description: string
  recommendation: string
  sources: string[]
}

interface TreatmentPattern {
  condition: string
  medications: string[]
  duration: string
  effectiveness: 'improving' | 'stable' | 'declining' | 'unknown'
  adherence: 'good' | 'moderate' | 'poor' | 'unknown'
  sideEffects: string[]
  recommendations: string[]
}

interface VitalTrend {
  parameter: string
  values: Array<{date: Date, value: number, unit: string}>
  trend: 'improving' | 'stable' | 'declining' | 'fluctuating'
  target: {min?: number, max?: number, unit: string}
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
}

interface ClinicalAlert {
  type: 'drug_interaction' | 'vital_trend' | 'missed_medication' | 'lab_abnormal' | 'follow_up_due'
  severity: 'info' | 'warning' | 'critical'
  message: string
  recommendation: string
  documentReferences: string[]
  dueDate?: Date
}

interface ClinicalInsights {
  patientSummary: string
  activeConditions: string[]
  currentMedications: string[]
  drugInteractions: DrugInteraction[]
  treatmentPatterns: TreatmentPattern[]
  vitalTrends: VitalTrend[]
  clinicalAlerts: ClinicalAlert[]
  recommendations: string[]
  riskFactors: string[]
}

class ClinicalDecisionSupportSystem {
  private genAI: GoogleGenerativeAI
  private documents: MedicalDocument[] = []
  private timeline: MedicalTimeline[] = []

  // Drug interaction database (simplified - in production would use comprehensive database)
  private drugInteractions = [
    {
      drugs: ['warfarin', 'aspirin'],
      severity: 'severe' as const,
      description: 'Increased bleeding risk',
      recommendation: 'Monitor INR closely, consider alternative antiplatelet therapy'
    },
    {
      drugs: ['metformin', 'contrast'],
      severity: 'moderate' as const,
      description: 'Risk of lactic acidosis',
      recommendation: 'Hold metformin 48 hours before and after contrast procedures'
    }
  ]

  // Normal vital ranges
  private vitalRanges = {
    'blood pressure systolic': {min: 90, max: 140, unit: 'mmHg'},
    'blood pressure diastolic': {min: 60, max: 90, unit: 'mmHg'},
    'heart rate': {min: 60, max: 100, unit: 'bpm'},
    'glucose': {min: 70, max: 140, unit: 'mg/dL'},
    'cholesterol': {min: 0, max: 200, unit: 'mg/dL'},
    'creatinine': {min: 0.6, max: 1.2, unit: 'mg/dL'},
    'gfr': {min: 60, max: 200, unit: 'mL/min/1.73m²'}
  }

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  // Load patient data
  async loadPatientData(documents: MedicalDocument[], timeline: MedicalTimeline[]): Promise<void> {
    this.documents = documents
    this.timeline = timeline.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Generate comprehensive clinical insights
  async generateClinicalInsights(): Promise<ClinicalInsights> {
    const currentMedications = await this.extractCurrentMedications()
    const activeConditions = await this.extractActiveConditions()
    const drugInteractions = await this.checkDrugInteractions(currentMedications)
    const treatmentPatterns = await this.analyzeTreatmentPatterns()
    const vitalTrends = await this.analyzeVitalTrends()
    const clinicalAlerts = await this.generateClinicalAlerts()
    const patientSummary = await this.generatePatientSummary()
    const recommendations = await this.generateRecommendations()
    const riskFactors = await this.identifyRiskFactors()

    return {
      patientSummary,
      activeConditions,
      currentMedications,
      drugInteractions,
      treatmentPatterns,
      vitalTrends,
      clinicalAlerts,
      recommendations,
      riskFactors
    }
  }

  // Extract current medications from recent documents
  private async extractCurrentMedications(): Promise<string[]> {
    const recentDocs = this.documents
      .filter(doc => doc.type === 'prescription')
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

    const medications: Set<string> = new Set()

    for (const doc of recentDocs) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        const prompt = `
          Extract current medications from this prescription document.
          Return only the medication names as a JSON array.
          
          Document: ${doc.name}
          Content: ${doc.summary}
          
          Example: ["metformin", "lisinopril", "atorvastatin"]
        `
        
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        
        // Extract JSON from markdown code blocks if present
        let jsonText = responseText
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonText = jsonMatch[1]
        } else {
          const arrayMatch = responseText.match(/\[[\s\S]*\]/)
          if (arrayMatch) {
            jsonText = arrayMatch[0]
          }
        }
        
        const meds = JSON.parse(jsonText)
        meds.forEach((med: string) => medications.add(med.toLowerCase()))
      } catch (error) {
        // Fallback: extract from tags
        doc.tags.forEach(tag => {
          if (tag.toLowerCase().includes('medication') || tag.toLowerCase().includes('drug')) {
            medications.add(tag)
          }
        })
      }
    }

    return Array.from(medications)
  }

  // Extract active medical conditions
  private async extractActiveConditions(): Promise<string[]> {
    const conditions: Set<string> = new Set()

    // Look for conditions in recent documents
    const recentDocs = this.documents
      .filter(doc => ['lab_report', 'test_report', 'prescription'].includes(doc.type))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)

    for (const doc of recentDocs) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        const prompt = `
          Extract active medical conditions/diagnoses from this document.
          Return only the condition names as a JSON array.
          
          Document: ${doc.name}
          Content: ${doc.summary}
          
          Example: ["diabetes", "hypertension", "hyperlipidemia"]
        `
        
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        
        // Extract JSON from markdown code blocks if present
        let jsonText = responseText
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonText = jsonMatch[1]
        } else {
          const arrayMatch = responseText.match(/\[[\s\S]*\]/)
          if (arrayMatch) {
            jsonText = arrayMatch[0]
          }
        }
        
        const conditionList = JSON.parse(jsonText)
        conditionList.forEach((condition: string) => conditions.add(condition.toLowerCase()))
      } catch (error) {
        // Fallback: look in tags
        doc.tags.forEach(tag => {
          const medicalConditions = ['diabetes', 'hypertension', 'cholesterol', 'heart', 'kidney', 'liver']
          if (medicalConditions.some(condition => tag.toLowerCase().includes(condition))) {
            conditions.add(tag)
          }
        })
      }
    }

    return Array.from(conditions)
  }

  // Check for drug interactions
  private async checkDrugInteractions(medications: string[]): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = []

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i]
        const drug2 = medications[j]

        // Check against known interactions
        const knownInteraction = this.drugInteractions.find(interaction =>
          (interaction.drugs.includes(drug1) && interaction.drugs.includes(drug2))
        )

        if (knownInteraction) {
          interactions.push({
            drug1,
            drug2,
            severity: knownInteraction.severity,
            description: knownInteraction.description,
            recommendation: knownInteraction.recommendation,
            sources: ['Internal Database']
          })
        } else {
          // Use AI to check for potential interactions
          try {
            const aiInteraction = await this.checkAIDrugInteraction(drug1, drug2)
            if (aiInteraction) {
              interactions.push(aiInteraction)
            }
          } catch (error) {
            console.error('AI drug interaction check failed:', error)
          }
        }
      }
    }

    return interactions
  }

  // AI-powered drug interaction checking
  private async checkAIDrugInteraction(drug1: string, drug2: string): Promise<DrugInteraction | null> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `
        Check for drug interactions between ${drug1} and ${drug2}.
        If there is a clinically significant interaction, return JSON with:
        {
          "hasInteraction": true,
          "severity": "mild|moderate|severe|contraindicated",
          "description": "brief description",
          "recommendation": "clinical recommendation"
        }
        
        If no significant interaction, return:
        {"hasInteraction": false}
      `
      
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Extract JSON from markdown code blocks if present
      let jsonText = responseText
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      } else {
        const objectMatch = responseText.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          jsonText = objectMatch[0]
        }
      }
      
      const response = JSON.parse(jsonText)
      
      if (response.hasInteraction) {
        return {
          drug1,
          drug2,
          severity: response.severity,
          description: response.description,
          recommendation: response.recommendation,
          sources: ['AI Analysis']
        }
      }
    } catch (error) {
      console.error('AI drug interaction check failed:', error)
    }
    
    return null
  }

  // Analyze treatment patterns
  private async analyzeTreatmentPatterns(): Promise<TreatmentPattern[]> {
    const patterns: TreatmentPattern[] = []
    const conditions = await this.extractActiveConditions()

    for (const condition of conditions) {
      const relatedDocs = this.documents.filter(doc => 
        doc.summary.toLowerCase().includes(condition) || 
        doc.tags.some(tag => tag.toLowerCase().includes(condition))
      )

      if (relatedDocs.length > 0) {
        try {
          const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
          const prompt = `
            Analyze treatment pattern for ${condition} based on these documents:
            ${relatedDocs.map(doc => `${doc.date.toDateString()}: ${doc.summary}`).join('\n')}
            
            Return JSON with:
            {
              "medications": ["list of medications"],
              "duration": "treatment duration",
              "effectiveness": "improving|stable|declining|unknown",
              "adherence": "good|moderate|poor|unknown",
              "sideEffects": ["list of side effects"],
              "recommendations": ["list of recommendations"]
            }
          `
          
          const result = await model.generateContent(prompt)
          const responseText = result.response.text()
          
          // Extract JSON from markdown code blocks if present
          let jsonText = responseText
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            jsonText = jsonMatch[1]
          } else {
            // Try to find JSON object in the response
            const objectMatch = responseText.match(/\{[\s\S]*\}/)
            if (objectMatch) {
              jsonText = objectMatch[0]
            }
          }
          
          const analysis = JSON.parse(jsonText)
          
          patterns.push({
            condition,
            medications: analysis.medications || [],
            duration: analysis.duration || 'Unknown',
            effectiveness: analysis.effectiveness || 'unknown',
            adherence: analysis.adherence || 'unknown',
            sideEffects: analysis.sideEffects || [],
            recommendations: analysis.recommendations || []
          })
        } catch (error) {
          console.error('Treatment pattern analysis failed:', error)
        }
      }
    }

    return patterns
  }

  // Analyze vital sign trends
  private async analyzeVitalTrends(): Promise<VitalTrend[]> {
    const trends: VitalTrend[] = []
    const vitalParameters = Object.keys(this.vitalRanges)

    for (const parameter of vitalParameters) {
      const values = this.extractVitalValues(parameter)
      
      if (values.length >= 2) {
        const trend = this.calculateTrend(values)
        const riskLevel = this.assessRiskLevel(parameter, values)
        
        trends.push({
          parameter,
          values,
          trend,
          target: this.vitalRanges[parameter as keyof typeof this.vitalRanges],
          riskLevel
        })
      }
    }

    return trends
  }

  // Extract vital sign values from documents
  private extractVitalValues(parameter: string): Array<{date: Date, value: number, unit: string}> {
    const values: Array<{date: Date, value: number, unit: string}> = []
    
    this.documents.forEach(doc => {
      if (doc.type === 'lab_report' || doc.type === 'test_report') {
        // Simple regex extraction (in production, would use more sophisticated NLP)
        const content = doc.summary.toLowerCase()
        
        if (content.includes(parameter.toLowerCase())) {
          // Extract numeric values near the parameter
          const regex = new RegExp(`${parameter.toLowerCase()}[:\\s]*([\\d.]+)\\s*(\\w+)?`, 'i')
          const match = content.match(regex)
          
          if (match) {
            values.push({
              date: doc.date,
              value: parseFloat(match[1]),
              unit: match[2] || this.vitalRanges[parameter as keyof typeof this.vitalRanges].unit
            })
          }
        }
      }
    })

    return values.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Calculate trend direction
  private calculateTrend(values: Array<{date: Date, value: number, unit: string}>): VitalTrend['trend'] {
    if (values.length < 2) return 'stable'
    
    const recent = values.slice(-3)
    const older = values.slice(0, -3)
    
    if (recent.length < 2) return 'stable'
    
    const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, v) => sum + v.value, 0) / older.length : recentAvg
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (Math.abs(change) < 5) return 'stable'
    if (change > 15) return 'fluctuating'
    if (change > 5) return 'improving'
    if (change < -5) return 'declining'
    
    return 'stable'
  }

  // Assess risk level based on vital values
  private assessRiskLevel(parameter: string, values: Array<{date: Date, value: number, unit: string}>): VitalTrend['riskLevel'] {
    if (values.length === 0) return 'low'
    
    const latest = values[values.length - 1]
    const range = this.vitalRanges[parameter as keyof typeof this.vitalRanges]
    
    if (latest.value < (range.min || 0) * 0.5 || latest.value > (range.max || 1000) * 1.5) {
      return 'critical'
    }
    if (latest.value < (range.min || 0) * 0.8 || latest.value > (range.max || 1000) * 1.2) {
      return 'high'
    }
    if (latest.value < (range.min || 0) || latest.value > range.max) {
      return 'moderate'
    }
    
    return 'low'
  }

  // Generate clinical alerts
  private async generateClinicalAlerts(): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = []
    
    // Drug interaction alerts
    const interactions = await this.checkDrugInteractions(await this.extractCurrentMedications())
    interactions.forEach(interaction => {
      if (interaction.severity === 'severe' || interaction.severity === 'contraindicated') {
        alerts.push({
          type: 'drug_interaction',
          severity: 'critical',
          message: `Potential ${interaction.severity} interaction between ${interaction.drug1} and ${interaction.drug2}`,
          recommendation: interaction.recommendation,
          documentReferences: []
        })
      }
    })

    // Vital trend alerts
    const vitalTrends = await this.analyzeVitalTrends()
    vitalTrends.forEach(trend => {
      if (trend.riskLevel === 'critical' || trend.riskLevel === 'high') {
        alerts.push({
          type: 'vital_trend',
          severity: trend.riskLevel === 'critical' ? 'critical' : 'warning',
          message: `${trend.parameter} trend is concerning: ${trend.trend}`,
          recommendation: `Monitor ${trend.parameter} closely and consider intervention`,
          documentReferences: []
        })
      }
    })

    return alerts
  }

  // Generate patient summary
  private async generatePatientSummary(): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const recentDocs = this.documents
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
      
      const prompt = `
        Generate a concise patient summary based on recent medical documents:
        
        ${recentDocs.map(doc => `${doc.date.toDateString()}: ${doc.name} - ${doc.summary}`).join('\n')}
        
        Include:
        1. Key medical conditions
        2. Current medications
        3. Recent test results
        4. Overall health status
        
        Keep it under 200 words and focus on clinically relevant information.
      `
      
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      return "Unable to generate patient summary at this time."
    }
  }

  // Generate clinical recommendations
  private async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = []
    
    // Add drug interaction recommendations
    const interactions = await this.checkDrugInteractions(await this.extractCurrentMedications())
    interactions.forEach(interaction => {
      recommendations.push(interaction.recommendation)
    })

    // Add vital trend recommendations
    const vitalTrends = await this.analyzeVitalTrends()
    vitalTrends.forEach(trend => {
      if (trend.riskLevel !== 'low') {
        recommendations.push(`Monitor ${trend.parameter} - current trend: ${trend.trend}`)
      }
    })

    return recommendations
  }

  // Identify risk factors
  private async identifyRiskFactors(): Promise<string[]> {
    const riskFactors: Set<string> = new Set()
    
    const conditions = await this.extractActiveConditions()
    const medications = await this.extractCurrentMedications()
    
    // Medication-related risks
    if (medications.includes('warfarin')) {
      riskFactors.add('Bleeding risk due to anticoagulation')
    }
    
    // Condition-related risks
    if (conditions.includes('diabetes')) {
      riskFactors.add('Cardiovascular disease risk')
      riskFactors.add('Kidney disease risk')
    }
    
    if (conditions.includes('hypertension')) {
      riskFactors.add('Stroke risk')
      riskFactors.add('Heart disease risk')
    }

    return Array.from(riskFactors)
  }
}

export { 
  ClinicalDecisionSupportSystem, 
  type ClinicalInsights, 
  type DrugInteraction, 
  type TreatmentPattern, 
  type VitalTrend, 
  type ClinicalAlert 
} 