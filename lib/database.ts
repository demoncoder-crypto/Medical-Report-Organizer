// Database Connection and Utilities
import { PrismaClient } from '@prisma/client'

// Global Prisma instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if database connection is available
const isDatabaseAvailable = () => {
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL)
}

// Create Prisma client with optimized configuration only if database is available
export const prisma = isDatabaseAvailable() 
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL
        }
      }
    }))
  : null

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

// Database connection helper
export async function connectToDatabase() {
  if (!prisma) {
    console.log('⚠️ Database not configured, running in demo mode')
    return false
  }
  
  try {
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL database')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectFromDatabase() {
  if (!prisma) {
    console.log('⚠️ No database connection to disconnect')
    return
  }
  
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Database health check
export async function checkDatabaseHealth() {
  if (!prisma) {
    return { 
      status: 'unavailable', 
      message: 'Database not configured - running in demo mode',
      timestamp: new Date().toISOString() 
    }
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
}

// Utility functions for medical data
export class MedicalDatabase {
  // Helper method to check if database is available
  private static isDatabaseAvailable(): boolean {
    return prisma !== null
  }

  // User management
  static async createUser(data: {
    email: string
    name?: string
    role?: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'ADMIN'
  }) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.user.create({
      data,
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    })
  }

  static async getUserWithProfile(userId: string) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: {
          include: {
            vitals: { orderBy: { createdAt: 'desc' }, take: 10 },
            labResults: { orderBy: { reportedAt: 'desc' }, take: 20 },
            medications: { where: { status: 'ACTIVE' } },
            appointments: { 
              where: { scheduledAt: { gte: new Date() } },
              orderBy: { scheduledAt: 'asc' }
            }
          }
        },
        doctorProfile: true,
        documents: { orderBy: { createdAt: 'desc' } }
      }
    })
  }

  // Document management
  static async createDocument(data: {
    userId: string
    name: string
    type: string
    content: string
    summary?: string
    doctor?: string
    hospital?: string
    date?: Date
    tags?: string[]
  }) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.document.create({
      data: {
        ...data,
        type: data.type as any,
        processed: false
      }
    })
  }

  static async getDocumentsByUser(userId: string, limit = 50) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        shares: true,
        activities: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    })
  }

  static async searchDocuments(userId: string, query: string) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.document.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Medical data
  static async addVitalSigns(patientId: string, data: {
    systolic?: number
    diastolic?: number
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    bmi?: number
    oxygenSat?: number
    measuredBy?: string
    notes?: string
  }) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.vitalSigns.create({
      data: {
        patientId,
        ...data
      }
    })
  }

  static async addLabResult(patientId: string, data: {
    testName: string
    value: string
    unit?: string
    referenceRange?: string
    status?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL'
    orderedBy?: string
    labName?: string
    collectedAt?: Date
  }) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.labResult.create({
      data: {
        patientId,
        status: 'NORMAL',
        ...data
      }
    })
  }

  static async addMedication(patientId: string, data: {
    name: string
    genericName?: string
    dosage: string
    frequency: string
    route?: string
    indication?: string
    prescribedBy?: string
    startDate?: Date
    endDate?: Date
    notes?: string
  }) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.medication.create({
      data: {
        patientId,
        status: 'ACTIVE',
        ...data
      }
    })
  }

  // Clinical decision support
  static async getDrugInteractions(medications: string[]) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.drugInteraction.findMany({
      where: {
        OR: medications.flatMap(med1 => 
          medications.map(med2 => ({
            AND: [
              { drug1: { contains: med1, mode: 'insensitive' } },
              { drug2: { contains: med2, mode: 'insensitive' } }
            ]
          }))
        )
      }
    })
  }

  static async getClinicalGuidelines(condition: string) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.clinicalGuideline.findMany({
      where: {
        condition: { contains: condition, mode: 'insensitive' }
      },
      orderBy: { lastUpdated: 'desc' }
    })
  }

  // Analytics and reporting
  static async getPatientSummaryStats(patientId: string) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    const [
      totalDocuments,
      recentVitals,
      activeConditions,
      activeMedications,
      upcomingAppointments
    ] = await Promise.all([
      prisma!.document.count({ where: { userId: patientId } }),
      prisma!.vitalSigns.count({ 
        where: { 
          patientId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma!.patientProfile.findUnique({
        where: { userId: patientId },
        select: { conditions: true }
      }),
      prisma!.medication.count({
        where: { patientId, status: 'ACTIVE' }
      }),
      prisma!.appointment.count({
        where: {
          patientId,
          scheduledAt: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      })
    ])

    return {
      totalDocuments,
      recentVitals,
      activeConditions: activeConditions?.conditions?.length || 0,
      activeMedications,
      upcomingAppointments
    }
  }

  // Activity logging
  static async logActivity(userId: string, action: string, description: string, documentId?: string, metadata?: any) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available - running in demo mode')
    }
    return await prisma!.activity.create({
      data: {
        userId,
        action: action as any,
        description,
        documentId,
        metadata
      }
    })
  }
}

export default prisma 