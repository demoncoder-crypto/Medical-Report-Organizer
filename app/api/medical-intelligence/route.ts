import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { MedicalRAGSystem, type MedicalDocument } from '@/lib/medical-rag'
import { MedicalTranslationService } from '@/lib/translation-service'
import { ClinicalDecisionSupportSystem } from '@/lib/clinical-decision-support'
import { MedicalKnowledgeBase } from '@/lib/medical-knowledge-base'
import { EMRIntegrationService, FHIRIntegrationService } from '@/lib/emr-integration'
import { ClinicalWorkflowService } from '@/lib/clinical-workflow'
import { ConversationalMedicalAI } from '@/lib/conversational-ai'
import { getDocuments } from '@/lib/document-store'

export async function POST(req: NextRequest) {
  try {
    const userApiKey = req.headers.get('X-Gemini-Api-Key')
    const apiKey = userApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key is missing. Please configure your Google Gemini API key.' 
      }, { status: 400 })
    }

    const body = await req.json()
    const { action, query, language = 'en', documentId, patientId, medications, labValues, sessionId, context, type } = body

    // Initialize services
    const ragSystem = new MedicalRAGSystem(apiKey)
    const translationService = new MedicalTranslationService(apiKey)
    const clinicalSupport = new ClinicalDecisionSupportSystem(apiKey)

    // Load documents
    const documents = await getDocuments()
    
    // Also load client-side documents from localStorage
    let clientDocs: any[] = []
    try {
      // Since we can't access localStorage server-side, we'll work with server documents
      // In production, you'd get user documents from database
      clientDocs = []
    } catch (error) {
      console.log('No client documents available')
    }
    
    const allDocs = [...documents, ...clientDocs]
    
    const medicalDocs: MedicalDocument[] = allDocs.map(doc => ({
      id: doc.id || Date.now().toString(),
      name: doc.name,
      type: doc.type,
      date: new Date(doc.date),
      content: doc.content || '',
      summary: doc.summary || '',
      doctor: doc.doctor,
      hospital: doc.hospital,
      tags: doc.tags || []
    }))

    // Add documents to RAG system
    for (const doc of medicalDocs) {
      await ragSystem.addDocument(doc)
    }

    switch (action || type) {
      case 'smart_search':
        return await handleSmartSearch(ragSystem, translationService, query, language)
      
      case 'conversational_search':
        return await handleConversationalSearch(apiKey, query, context, sessionId)
      
      case 'clinical_insights':
        return await handleClinicalInsights(clinicalSupport, medicalDocs)
      
      case 'translate_document':
        return await handleTranslateDocument(translationService, documentId, language, medicalDocs)
      
      case 'medical_timeline':
        return await handleMedicalTimeline(ragSystem, medicalDocs)
      
      case 'drug_interactions':
        return await handleDrugInteractions(clinicalSupport, medicalDocs)
      
      case 'comprehensive_analysis':
        return await handleComprehensiveAnalysis(medications, labValues, patientId)
      
      case 'patient_summary':
        return await handlePatientSummary(patientId)
      
      case 'treatment_recommendations':
        return await handleTreatmentRecommendations(patientId)
      
      case 'workflow_tasks':
        return await handleWorkflowTasks(patientId)
      
      case 'insurance_claims':
        return await handleInsuranceClaims(patientId)
      
      case 'differential_diagnosis':
        return await handleDifferentialDiagnosis(body.patientData, apiKey)
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Supported actions: smart_search, conversational_search, clinical_insights, translate_document, medical_timeline, drug_interactions, comprehensive_analysis, patient_summary, treatment_recommendations, workflow_tasks, insurance_claims, differential_diagnosis' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in medical intelligence API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

// Handle conversational search with advanced AI
async function handleConversationalSearch(
  apiKey: string,
  query: string,
  context: any,
  sessionId: string
) {
  try {
    const conversationalAI = new ConversationalMedicalAI(apiKey)
    
    const response = await conversationalAI.askMedicalQuestion(query, context, sessionId)
    
    return NextResponse.json({
      success: true,
      conversationalResponse: response,
      sessionId
    })
  } catch (error) {
    throw new Error(`Conversational search failed: ${error}`)
  }
}

// Handle smart search with RAG and translation
async function handleSmartSearch(
  ragSystem: MedicalRAGSystem, 
  translationService: MedicalTranslationService, 
  query: string, 
  language: string
) {
  try {
    // Translate query to English if needed
    let searchQuery = query
    if (language !== 'en') {
      searchQuery = await translationService.translateMedicalQuery(query, 'en')
    }

    // Perform RAG search
    const insight = await ragSystem.answerMedicalQuery(searchQuery)

    // Translate response back to user's language if needed
    let translatedAnswer = insight.answer
    if (language !== 'en') {
      const translation = await translationService.translateMedicalDocument(
        insight.answer, 
        language,
        { documentType: 'other', criticalTerms: ['medication', 'diagnosis', 'treatment'] }
      )
      translatedAnswer = translation.translatedText
    }

    return NextResponse.json({
      success: true,
      data: {
        query: query,
        answer: translatedAnswer,
        confidence: insight.confidence,
        relevantDocuments: insight.relevantDocuments,
        medicalContext: insight.medicalContext,
        timeline: insight.timeline,
        language: language
      }
    })
  } catch (error) {
    throw new Error(`Smart search failed: ${error}`)
  }
}

// Handle comprehensive clinical insights
async function handleClinicalInsights(
  clinicalSupport: ClinicalDecisionSupportSystem,
  medicalDocs: MedicalDocument[]
) {
  try {
    // Generate medical timeline
    const ragSystem = new MedicalRAGSystem(process.env.GEMINI_API_KEY || '')
    for (const doc of medicalDocs) {
      await ragSystem.addDocument(doc)
    }
    const timeline = await ragSystem.generateMedicalTimeline(medicalDocs)

    // Load data into clinical support system
    await clinicalSupport.loadPatientData(medicalDocs, timeline)

    // Generate comprehensive insights
    const insights = await clinicalSupport.generateClinicalInsights()

    return NextResponse.json({
      success: true,
      data: {
        insights,
        generatedAt: new Date().toISOString(),
        documentCount: medicalDocs.length
      }
    })
  } catch (error) {
    throw new Error(`Clinical insights generation failed: ${error}`)
  }
}

// Handle document translation
async function handleTranslateDocument(
  translationService: MedicalTranslationService,
  documentId: string,
  targetLanguage: string,
  medicalDocs: MedicalDocument[]
) {
  try {
    const document = medicalDocs.find(doc => doc.id === documentId)
    if (!document) {
      return NextResponse.json({ 
        success: false, 
        error: 'Document not found' 
      }, { status: 404 })
    }

    const translation = await translationService.translateMedicalDocument(
      document.summary,
      targetLanguage,
      {
        documentType: document.type as any,
        criticalTerms: document.tags
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        originalDocument: {
          id: document.id,
          name: document.name,
          summary: document.summary
        },
        translation,
        supportedLanguages: translationService.getSupportedLanguages()
      }
    })
  } catch (error) {
    throw new Error(`Document translation failed: ${error}`)
  }
}

// Handle medical timeline generation
async function handleMedicalTimeline(
  ragSystem: MedicalRAGSystem,
  medicalDocs: MedicalDocument[]
) {
  try {
    const timeline = await ragSystem.generateMedicalTimeline(medicalDocs)
    
    // Group events by type and date
    const groupedTimeline = timeline.reduce((acc, event) => {
      const dateKey = event.date.toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {} as Record<string, typeof timeline>)

    return NextResponse.json({
      success: true,
      data: {
        timeline,
        groupedTimeline,
        totalEvents: timeline.length,
        dateRange: {
          start: timeline[0]?.date,
          end: timeline[timeline.length - 1]?.date
        }
      }
    })
  } catch (error) {
    throw new Error(`Medical timeline generation failed: ${error}`)
  }
}

// Handle drug interaction checking
async function handleDrugInteractions(
  clinicalSupport: ClinicalDecisionSupportSystem,
  medicalDocs: MedicalDocument[]
) {
  try {
    await clinicalSupport.loadPatientData(medicalDocs, [])
    const insights = await clinicalSupport.generateClinicalInsights()

    return NextResponse.json({
      success: true,
      data: {
        currentMedications: insights.currentMedications,
        drugInteractions: insights.drugInteractions,
        clinicalAlerts: insights.clinicalAlerts.filter(alert => alert.type === 'drug_interaction'),
        recommendations: insights.recommendations
      }
    })
  } catch (error) {
    throw new Error(`Drug interaction checking failed: ${error}`)
  }
}

// Handle comprehensive clinical analysis
async function handleComprehensiveAnalysis(
  medications: string[],
  labValues: Array<{parameter: string, value: number, unit: string}>,
  patientId?: string
) {
  try {
    // Drug interaction analysis
    const drugInteractions = MedicalKnowledgeBase.findDrugInteractions(medications || [])
    
    // Lab value analysis
    const labAnalysis = (labValues || []).map(lab => ({
      ...lab,
      evaluation: MedicalKnowledgeBase.evaluateLabValue(lab.parameter, lab.value)
    }))
    
    // Treatment recommendations
    const conditions = ['Type 2 Diabetes', 'Hypertension'] // Mock conditions
    const treatmentAnalysis = MedicalKnowledgeBase.generateTreatmentRecommendations(
      conditions,
      medications || [],
      labValues || []
    )

    return NextResponse.json({
      success: true,
      data: {
        drugInteractions,
        labAnalysis,
        treatmentRecommendations: treatmentAnalysis.recommendations,
        clinicalWarnings: treatmentAnalysis.warnings,
        monitoringRequirements: treatmentAnalysis.monitoring,
        analysisDate: new Date().toISOString()
      }
    })
  } catch (error) {
    throw new Error(`Comprehensive analysis failed: ${error}`)
  }
}

// Handle patient summary generation
async function handlePatientSummary(patientId: string) {
  try {
    if (!patientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Patient ID is required' 
      }, { status: 400 })
    }

    const summary = ClinicalWorkflowService.generateRealTimePatientSummary(patientId)
    const alerts = EMRIntegrationService.getClinicalAlerts(patientId)
    const patient = EMRIntegrationService.getPatientProfile(patientId)

    return NextResponse.json({
      success: true,
      data: {
        patientSummary: summary,
        clinicalAlerts: alerts,
        patientProfile: patient,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    throw new Error(`Patient summary generation failed: ${error}`)
  }
}

// Handle treatment recommendations
async function handleTreatmentRecommendations(patientId: string) {
  try {
    if (!patientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Patient ID is required' 
      }, { status: 400 })
    }

    const patient = EMRIntegrationService.getPatientProfile(patientId)
    if (!patient) {
      return NextResponse.json({ 
        success: false, 
        error: 'Patient not found' 
      }, { status: 404 })
    }

    const recommendations = ClinicalWorkflowService.generateTreatmentRecommendations(patient)

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        patientConditions: patient.conditions,
        currentMedications: patient.medications,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    throw new Error(`Treatment recommendations failed: ${error}`)
  }
}

// Handle workflow tasks
async function handleWorkflowTasks(patientId: string) {
  try {
    const tasks = ClinicalWorkflowService.getWorkflowTasks('Dr. Williams') // Mock provider
    const metrics = ClinicalWorkflowService.getWorkflowMetrics()

    return NextResponse.json({
      success: true,
      data: {
        tasks: patientId ? tasks.filter(task => task.patientId === patientId) : tasks,
        metrics,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    throw new Error(`Workflow tasks retrieval failed: ${error}`)
  }
}

// Handle insurance claims
async function handleInsuranceClaims(patientId: string) {
  try {
    const claims = ClinicalWorkflowService.getInsuranceClaims(patientId)

    return NextResponse.json({
      success: true,
      data: {
        claims,
        totalClaims: claims.length,
        pendingClaims: claims.filter(claim => claim.status === 'pending').length,
        totalValue: claims.reduce((sum, claim) => sum + claim.estimatedReimbursement, 0),
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    throw new Error(`Insurance claims retrieval failed: ${error}`)
  }
}

// Handle differential diagnosis generation
async function handleDifferentialDiagnosis(patientData: any, apiKey: string) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    As a medical AI, generate differential diagnoses for this patient:
    
    Patient: ${patientData.age}yo ${patientData.gender}
    Active Conditions: ${patientData.conditions?.join(', ') || 'None specified'}
    Recent Alerts: ${patientData.recentAlerts?.join('; ') || 'None'}
    Current Medications: ${patientData.medications?.join(', ') || 'None specified'}
    
    Generate 3-4 differential diagnoses with:
    1. Condition name
    2. Probability percentage (0-100)
    3. Supporting evidence
    4. Contraindications or reasons against
    5. Recommended tests
    
    Format as JSON array:
    [
      {
        "condition": "Condition Name",
        "probability": 85,
        "supportingEvidence": ["Evidence 1", "Evidence 2"],
        "contraindications": ["Reason against"],
        "recommendedTests": ["Test 1", "Test 2"]
      }
    ]
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }

      const differentials = JSON.parse(jsonMatch[0])
      
      return NextResponse.json({
        success: true,
        differentials,
        patientId: patientData.id,
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      // Fallback with mock data if AI parsing fails
      const mockDifferentials = [
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
      
      return NextResponse.json({
        success: true,
        differentials: mockDifferentials,
        patientId: patientData.id,
        generatedAt: new Date().toISOString(),
        note: 'Using fallback data due to AI parsing error'
      })
    }
  } catch (error) {
    throw new Error(`Differential diagnosis generation failed: ${error}`)
  }
} 