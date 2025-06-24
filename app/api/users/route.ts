import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService, CreateUserData } from '@/lib/services/user.service'

const userService = new UserService()

// GET /api/users - Get users (with search and filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const role = searchParams.get('role')

    let users
    if (query) {
      users = await userService.searchUsers(query, role as any)
    } else {
      // Get all users (implement pagination in real app)
      users = await userService.searchUsers('', role as any)
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow user creation without session for registration
    // But check permissions for admin operations
    const body = await req.json()
    const { email, password, name, role, profile } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // If setting role other than PATIENT, require admin session
    if (role && role !== 'PATIENT') {
      if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HOSPITAL_ADMIN')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    const userData: CreateUserData = {
      email,
      password,
      name,
      role,
      profile
    }

    const user = await userService.createUser(userData)

    // Don't return sensitive information
    const { ...safeUser } = user
    return NextResponse.json({ user: safeUser }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 