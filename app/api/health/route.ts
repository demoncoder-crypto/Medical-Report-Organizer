// Health Check API - Verify Database Connection
import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database'

export async function GET() {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseHealth()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
      version: '1.0.0'
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