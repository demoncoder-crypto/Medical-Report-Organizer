// Advanced Conversational AI for Medical Context
// Implements Perplexity-style semantic search with medical reasoning

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ConversationContext {
  patientId?: string
  previousQuestions: string[]
  documentContext: Array<{
    title: string
    content: string
    relevanceScore: number
  }>
  medicalHistory: Array<{
    condition: string
    medications: string[]
    labValues: Array<{
      parameter: string
      value: number
      date: string
    }>
  }>
  conversationFlow: Array<{
    question: string
    answer: string
    confidence: number
    sources: string[]
    timestamp: string
  }>
}

export interface MedicalReasoningChain {
  query: string
  reasoningSteps: Array<{
    step: number
    reasoning: string
    evidence: string[]
    confidence: number
  }>
  conclusion: string
  overallConfidence: number
  sources: string[]
  followUpQuestions: string[]
}

export interface ConversationalResponse {
  answer: string
  confidence: number
  reasoningChain: MedicalReasoningChain
  sources: Array<{
    title: string
    excerpt: string
    relevance: number
    type: 'document' | 'knowledge_base' | 'clinical_guideline'
  }>
  followUpQuestions: string[]
  relatedTopics: string[]
  clinicalRecommendations?: string[]
  warningsAndCaveats: string[]
}

export class ConversationalMedicalAI {
  private genAI: GoogleGenerativeAI
  private conversationHistory: Map<string, ConversationContext> = new Map()

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async askMedicalQuestion(
    query: string,
    context: ConversationContext,
    sessionId: string = 'default'
  ): Promise<ConversationalResponse> {
    try {
      // Update conversation context
      const existingContext = this.conversationHistory.get(sessionId) || {
        previousQuestions: [],
        documentContext: [],
        medicalHistory: [],
        conversationFlow: []
      }

      existingContext.previousQuestions.push(query)
      this.conversationHistory.set(sessionId, { ...existingContext, ...context })

      // Generate reasoning chain
      const reasoningChain = await this.generateReasoningChain(query, context)

      // Generate main response
      const response = await this.generateConversationalResponse(query, context, reasoningChain)

      // Generate follow-up questions
      const followUpQuestions = await this.generateFollowUpQuestions(query, response, context)

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(response, reasoningChain, context)

      // Add to conversation history
      existingContext.conversationFlow.push({
        question: query,
        answer: response.answer,
        confidence,
        sources: response.sources.map(s => s.title),
        timestamp: new Date().toISOString()
      })

      return {
        answer: response.answer,
        confidence,
        reasoningChain,
        sources: response.sources,
        followUpQuestions,
        relatedTopics: response.relatedTopics,
        clinicalRecommendations: response.clinicalRecommendations,
        warningsAndCaveats: response.warningsAndCaveats
      }
    } catch (error) {
      console.error('Error in conversational AI:', error)
      throw error
    }
  }

  private async generateReasoningChain(
    query: string,
    context: ConversationContext
  ): Promise<MedicalReasoningChain> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    As a medical AI, create a step-by-step reasoning chain for this question:
    "${query}"

    Context:
    - Patient context: ${context.patientId || 'General medical question'}
    - Previous questions: ${context.previousQuestions.slice(-3).join(', ')}
    - Available documents: ${context.documentContext.map(d => d.title).join(', ')}
    - Medical history: ${context.medicalHistory.map(h => h.condition).join(', ')}

    Provide a structured reasoning chain with:
    1. Multiple reasoning steps (3-5 steps)
    2. Evidence for each step
    3. Confidence score for each step (0-100)
    4. Overall conclusion
    5. Sources of information
    6. Follow-up questions to explore

    Format as JSON:
    {
      "query": "${query}",
      "reasoningSteps": [
        {
          "step": 1,
          "reasoning": "First reasoning step",
          "evidence": ["Evidence 1", "Evidence 2"],
          "confidence": 85
        }
      ],
      "conclusion": "Final conclusion",
      "overallConfidence": 80,
      "sources": ["Source 1", "Source 2"],
      "followUpQuestions": ["Question 1", "Question 2"]
    }
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const reasoningChain = JSON.parse(jsonMatch[0]) as MedicalReasoningChain
      return reasoningChain
    } catch (parseError) {
      console.error('Error parsing reasoning chain:', parseError)
      
      // Fallback reasoning chain
      return {
        query,
        reasoningSteps: [
          {
            step: 1,
            reasoning: 'Analyzing the medical question in context',
            evidence: ['Clinical knowledge base', 'Document context'],
            confidence: 70
          }
        ],
        conclusion: 'Medical question requires clinical correlation and professional judgment',
        overallConfidence: 70,
        sources: ['Medical knowledge base'],
        followUpQuestions: ['What additional information would be helpful?']
      }
    }
  }

  private async generateConversationalResponse(
    query: string,
    context: ConversationContext,
    reasoningChain: MedicalReasoningChain
  ): Promise<{
    answer: string
    sources: Array<{
      title: string
      excerpt: string
      relevance: number
      type: 'document' | 'knowledge_base' | 'clinical_guideline'
    }>
    relatedTopics: string[]
    clinicalRecommendations?: string[]
    warningsAndCaveats: string[]
  }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    You are a medical AI assistant providing comprehensive answers to healthcare questions.
    
    Question: "${query}"
    
    Reasoning Chain: ${JSON.stringify(reasoningChain)}
    
    Context:
    - Document context: ${context.documentContext.map(d => `${d.title}: ${d.content.substring(0, 200)}...`).join('\n')}
    - Medical history: ${JSON.stringify(context.medicalHistory)}
    - Previous conversation: ${context.conversationFlow.slice(-2).map(c => `Q: ${c.question} A: ${c.answer}`).join('\n')}

    Provide a comprehensive response that includes:
    1. A clear, detailed answer that addresses the question directly
    2. Clinical context and medical reasoning
    3. Relevant sources and evidence
    4. Related medical topics
    5. Clinical recommendations (if appropriate)
    6. Important warnings and caveats

    Format as JSON:
    {
      "answer": "Comprehensive medical answer with clinical reasoning...",
      "sources": [
        {
          "title": "Source title",
          "excerpt": "Relevant excerpt",
          "relevance": 95,
          "type": "document"
        }
      ],
      "relatedTopics": ["Related topic 1", "Related topic 2"],
      "clinicalRecommendations": ["Recommendation 1", "Recommendation 2"],
      "warningsAndCaveats": ["Important caveat 1", "Warning 2"]
    }

    Important guidelines:
    - Always emphasize that this is for educational purposes only
    - Recommend consulting healthcare professionals for medical decisions
    - Provide evidence-based information
    - Be clear about limitations and uncertainties
    - Include relevant clinical guidelines when applicable
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Error parsing conversational response:', parseError)
      
      // Fallback response
      return {
        answer: 'I can help provide medical information, but please consult with a healthcare professional for personalized medical advice.',
        sources: [
          {
            title: 'Medical Knowledge Base',
            excerpt: 'General medical information',
            relevance: 50,
            type: 'knowledge_base' as const
          }
        ],
        relatedTopics: ['Medical consultation', 'Healthcare guidance'],
        clinicalRecommendations: ['Consult with your healthcare provider'],
        warningsAndCaveats: ['This information is for educational purposes only']
      }
    }
  }

  private async generateFollowUpQuestions(
    originalQuery: string,
    response: any,
    context: ConversationContext
  ): Promise<string[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Based on this medical question and answer, generate 3-5 relevant follow-up questions that would help deepen understanding or gather more specific information.

    Original Question: "${originalQuery}"
    Answer Summary: "${response.answer.substring(0, 300)}..."
    
    Context:
    - Patient has conditions: ${context.medicalHistory.map(h => h.condition).join(', ')}
    - Previous questions: ${context.previousQuestions.slice(-3).join(', ')}

    Generate follow-up questions that are:
    1. Clinically relevant
    2. Specific to the patient's context
    3. Help clarify or expand on the topic
    4. Practical for healthcare decision-making

    Return as a JSON array of strings:
    ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    `

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error generating follow-up questions:', error)
      
      // Fallback questions
      return [
        'What additional tests or evaluations might be helpful?',
        'Are there any lifestyle modifications to consider?',
        'What are the potential risks or complications?',
        'How does this relate to other medical conditions?'
      ]
    }
  }

  private calculateConfidenceScore(
    response: any,
    reasoningChain: MedicalReasoningChain,
    context: ConversationContext
  ): number {
    let confidence = reasoningChain.overallConfidence || 50

    // Boost confidence based on available context
    if (context.documentContext.length > 0) {
      confidence += 10
    }

    if (context.medicalHistory.length > 0) {
      confidence += 10
    }

    // Adjust based on source quality
    const hasHighQualitySources = response.sources?.some((s: any) => 
      s.type === 'clinical_guideline' && s.relevance > 80
    )
    if (hasHighQualitySources) {
      confidence += 15
    }

    // Penalize if too many caveats (indicates uncertainty)
    if (response.warningsAndCaveats?.length > 3) {
      confidence -= 10
    }

    // Ensure confidence is within bounds
    return Math.max(0, Math.min(100, confidence))
  }

  // Get conversation history for a session
  getConversationHistory(sessionId: string): ConversationContext | null {
    return this.conversationHistory.get(sessionId) || null
  }

  // Clear conversation history
  clearConversationHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId)
  }

  // Generate medical insights from conversation patterns
  async generateConversationInsights(sessionId: string): Promise<{
    commonTopics: string[]
    knowledgeGaps: string[]
    recommendedResources: string[]
    clinicalPriorities: string[]
  }> {
    const context = this.conversationHistory.get(sessionId)
    if (!context || context.conversationFlow.length === 0) {
      return {
        commonTopics: [],
        knowledgeGaps: [],
        recommendedResources: [],
        clinicalPriorities: []
      }
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Analyze this conversation history to provide insights:

    Questions asked: ${context.conversationFlow.map(c => c.question).join('; ')}
    Confidence scores: ${context.conversationFlow.map(c => c.confidence).join(', ')}
    Medical conditions: ${context.medicalHistory.map(h => h.condition).join(', ')}

    Provide insights as JSON:
    {
      "commonTopics": ["Topic 1", "Topic 2"],
      "knowledgeGaps": ["Gap 1", "Gap 2"],
      "recommendedResources": ["Resource 1", "Resource 2"],
      "clinicalPriorities": ["Priority 1", "Priority 2"]
    }
    `

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in insights response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error generating conversation insights:', error)
      
      return {
        commonTopics: ['General medical questions'],
        knowledgeGaps: ['Specific clinical details'],
        recommendedResources: ['Medical consultation'],
        clinicalPriorities: ['Patient safety']
      }
    }
  }
} 