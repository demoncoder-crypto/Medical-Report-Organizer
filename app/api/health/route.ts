// Health Check API - Verify Application Status
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface DbHealth {
  status: string
  timestamp?: string
  message?: string
}

export async function GET() {
  try {
    // Check database connection (if available)
    let dbHealth: DbHealth = { status: 'unknown' }
    
    try {
      if (process.env.POSTGRES_URL) {
        await sql`SELECT 1`
        dbHealth = { status: 'healthy', timestamp: new Date().toISOString() }
      } else {
        dbHealth = { status: 'no_connection', message: 'Database not configured (using fallback)' }
      }
    } catch (dbError) {
      dbHealth = { status: 'error', message: 'Database connection failed (using fallback)' }
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      features: {
        ocr: 'enabled',
        ai_analysis: process.env.GEMINI_API_KEY ? 'enabled' : 'disabled',
        medical_intelligence: 'enabled'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: { status: 'error' }
    }, { status: 500 })
  }
} 