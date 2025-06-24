import { GoogleGenerativeAI } from '@google/generative-ai'

interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  medicalTerms: string[]
}

interface MedicalTranslationContext {
  documentType: 'prescription' | 'lab_report' | 'bill' | 'test_report' | 'other'
  medicalSpecialty?: string
  criticalTerms: string[]
}

class MedicalTranslationService {
  private genAI: GoogleGenerativeAI
  private supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 
    'hi', 'ar', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi'
  ]

  // Medical term dictionaries for accuracy
  private medicalTerms = {
    en: {
      'blood pressure': 'blood pressure',
      'cholesterol': 'cholesterol',
      'diabetes': 'diabetes',
      'prescription': 'prescription',
      'diagnosis': 'diagnosis',
      'medication': 'medication',
      'dosage': 'dosage',
      'symptoms': 'symptoms',
      'treatment': 'treatment',
      'hospital': 'hospital',
      'doctor': 'doctor',
      'patient': 'patient'
    },
    es: {
      'blood pressure': 'presión arterial',
      'cholesterol': 'colesterol',
      'diabetes': 'diabetes',
      'prescription': 'receta médica',
      'diagnosis': 'diagnóstico',
      'medication': 'medicación',
      'dosage': 'dosis',
      'symptoms': 'síntomas',
      'treatment': 'tratamiento',
      'hospital': 'hospital',
      'doctor': 'médico',
      'patient': 'paciente'
    },
    hi: {
      'blood pressure': 'रक्तचाप',
      'cholesterol': 'कोलेस्ट्रॉल',
      'diabetes': 'मधुमेह',
      'prescription': 'नुस्खा',
      'diagnosis': 'निदान',
      'medication': 'दवा',
      'dosage': 'खुराक',
      'symptoms': 'लक्षण',
      'treatment': 'इलाज',
      'hospital': 'अस्पताल',
      'doctor': 'डॉक्टर',
      'patient': 'मरीज़'
    }
  }

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  // Detect language of medical document
  async detectLanguage(text: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `
        Detect the language of this medical document text. 
        Return only the ISO 639-1 language code (e.g., 'en', 'es', 'hi', 'fr').
        
        Text: "${text.substring(0, 500)}"
        
        Language code:
      `
      
      const result = await model.generateContent(prompt)
      const detectedLang = result.response.text().trim().toLowerCase()
      
      return this.supportedLanguages.includes(detectedLang) ? detectedLang : 'en'
    } catch (error) {
      console.error('Language detection failed:', error)
      return 'en' // Default to English
    }
  }

  // Translate medical document with context awareness
  async translateMedicalDocument(
    text: string, 
    targetLanguage: string = 'en',
    context?: MedicalTranslationContext
  ): Promise<TranslationResult> {
    try {
      const sourceLanguage = await this.detectLanguage(text)
      
      if (sourceLanguage === targetLanguage) {
        return {
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          confidence: 1.0,
          medicalTerms: []
        }
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      
      const contextPrompt = context ? `
        Document Type: ${context.documentType}
        Medical Specialty: ${context.medicalSpecialty || 'General'}
        Critical Terms to Preserve: ${context.criticalTerms.join(', ')}
      ` : ''

      const prompt = `
        You are a medical translator specializing in healthcare documents.
        Translate the following medical document from ${sourceLanguage} to ${targetLanguage}.
        
        ${contextPrompt}
        
        CRITICAL REQUIREMENTS:
        1. Maintain medical accuracy - preserve exact medical terminology
        2. Keep dosages, measurements, and numbers exactly as written
        3. Preserve doctor names, hospital names, and dates
        4. Maintain document structure and formatting
        5. Use appropriate medical terminology in the target language
        6. If unsure about a medical term, keep the original and add [original: term]
        
        Original Text:
        "${text}"
        
        Provide:
        1. The complete translation
        2. List any medical terms that were preserved in original language
        3. Confidence level (0-1)
        
        Format your response as:
        TRANSLATION:
        [translated text here]
        
        PRESERVED_TERMS:
        [comma-separated list]
        
        CONFIDENCE:
        [0-1 score]
      `
      
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      
      // Parse the response
      const translationMatch = response.match(/TRANSLATION:\s*([\s\S]*?)(?=PRESERVED_TERMS:|$)/)
      const termsMatch = response.match(/PRESERVED_TERMS:\s*(.*?)(?=CONFIDENCE:|$)/)
      const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/)
      
      const translatedText = translationMatch ? translationMatch[1].trim() : text
      const medicalTerms = termsMatch ? termsMatch[1].split(',').map(t => t.trim()).filter(t => t) : []
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8
      
      return {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence,
        medicalTerms
      }
    } catch (error) {
      console.error('Translation failed:', error)
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage: 'unknown',
        targetLanguage,
        confidence: 0,
        medicalTerms: []
      }
    }
  }

  // Translate medical queries for search
  async translateMedicalQuery(query: string, targetLanguage: string = 'en'): Promise<string> {
    try {
      const result = await this.translateMedicalDocument(query, targetLanguage, {
        documentType: 'other',
        criticalTerms: ['blood pressure', 'cholesterol', 'diabetes', 'medication', 'symptoms']
      })
      return result.translatedText
    } catch (error) {
      console.error('Query translation failed:', error)
      return query
    }
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return [...this.supportedLanguages]
  }

  // Voice-to-text for non-English speakers (placeholder for future implementation)
  async speechToText(audioBlob: Blob, language: string = 'en'): Promise<string> {
    // This would integrate with Web Speech API or Google Speech-to-Text
    // For now, return placeholder
    return "Voice-to-text functionality coming soon..."
  }

  // Text-to-speech for translated content
  async textToSpeech(text: string, language: string = 'en'): Promise<string> {
    // This would integrate with Web Speech API or Google Text-to-Speech
    // For now, return placeholder
    return "Text-to-speech functionality coming soon..."
  }

  // Validate medical translation accuracy
  async validateTranslation(original: string, translated: string, sourceLanguage: string, targetLanguage: string): Promise<number> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `
        Evaluate the accuracy of this medical translation on a scale of 0-1.
        Focus on medical terminology accuracy, preservation of critical information, and overall meaning.
        
        Original (${sourceLanguage}): "${original}"
        Translation (${targetLanguage}): "${translated}"
        
        Return only a number between 0 and 1 representing accuracy.
      `
      
      const result = await model.generateContent(prompt)
      const score = parseFloat(result.response.text().trim())
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
    } catch (error) {
      console.error('Translation validation failed:', error)
      return 0.5
    }
  }
}

export { MedicalTranslationService, type TranslationResult, type MedicalTranslationContext } 