import bcrypt from 'bcryptjs'

// User interfaces
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  dateOfBirth?: Date
  gender?: Gender
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  bloodType?: string
  allergies: string[]
  medications: string[]
  medicalHistory?: string
  emergencyContact?: string
  insuranceInfo?: any
  licenseNumber?: string
  specialization?: string
  hospital?: string
  department?: string
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  ADMIN = 'ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export interface CreateUserData {
  email: string
  password?: string
  name?: string
  role?: UserRole
  profile?: Partial<UserProfile>
}

export interface UpdateUserData {
  name?: string
  image?: string
  profile?: Partial<UserProfile>
}

export class UserService {
  // User Registration
  async createUser(data: CreateUserData): Promise<User> {
    try {
      // Validate email uniqueness
      const existingUser = await this.findUserByEmail(data.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password if provided
      let hashedPassword: string | undefined
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12)
      }

      // Create user
      const user: User = {
        id: this.generateId(),
        email: data.email,
        name: data.name,
        role: data.role || UserRole.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to database (would use Prisma in real implementation)
      await this.saveUserToDatabase(user, hashedPassword)

      // Create user profile if provided
      if (data.profile) {
        await this.createUserProfile(user.id, data.profile)
      }

      // Log activity
      await this.logActivity(user.id, 'USER_REGISTRATION')

      return user

    } catch (error) {
      console.error('User creation failed:', error)
      throw error
    }
  }

  // User Authentication
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findUserByEmail(email)
      if (!user) {
        return null
      }

      // Get stored password hash
      const storedPasswordHash = await this.getUserPasswordHash(user.id)
      if (!storedPasswordHash) {
        return null
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, storedPasswordHash)
      if (!isPasswordValid) {
        return null
      }

      // Log successful login
      await this.logActivity(user.id, 'USER_LOGIN')

      return user

    } catch (error) {
      console.error('User authentication failed:', error)
      return null
    }
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Implementation would fetch from database
      return await this.fetchUserProfileFromDatabase(userId)
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updatedProfile = await this.updateUserProfileInDatabase(userId, data)
      
      // Log activity
      await this.logActivity(userId, 'PROFILE_UPDATED')

      return updatedProfile

    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const profile: UserProfile = {
        id: this.generateId(),
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        bloodType: data.bloodType,
        allergies: data.allergies || [],
        medications: data.medications || [],
        medicalHistory: data.medicalHistory,
        emergencyContact: data.emergencyContact,
        insuranceInfo: data.insuranceInfo,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
        hospital: data.hospital,
        department: data.department,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await this.saveUserProfileToDatabase(profile)
      return profile

    } catch (error) {
      console.error('Failed to create user profile:', error)
      throw error
    }
  }

  // Doctor-Patient Relationships
  async createDoctorPatientRelationship(doctorId: string, patientId: string): Promise<void> {
    try {
      // Validate users exist and have correct roles
      const doctor = await this.findUserById(doctorId)
      const patient = await this.findUserById(patientId)

      if (!doctor || !patient) {
        throw new Error('User not found')
      }

      if (doctor.role !== UserRole.DOCTOR) {
        throw new Error('User is not a doctor')
      }

      if (patient.role !== UserRole.PATIENT) {
        throw new Error('User is not a patient')
      }

      // Create relationship
      await this.saveDoctorPatientRelationship(doctorId, patientId)

      // Log activities
      await this.logActivity(doctorId, 'DOCTOR_RELATIONSHIP_CREATED')
      await this.logActivity(patientId, 'DOCTOR_RELATIONSHIP_CREATED')

    } catch (error) {
      console.error('Failed to create doctor-patient relationship:', error)
      throw error
    }
  }

  async getDoctorPatients(doctorId: string): Promise<User[]> {
    try {
      return await this.fetchDoctorPatientsFromDatabase(doctorId)
    } catch (error) {
      console.error('Failed to get doctor patients:', error)
      return []
    }
  }

  async getPatientDoctors(patientId: string): Promise<User[]> {
    try {
      return await this.fetchPatientDoctorsFromDatabase(patientId)
    } catch (error) {
      console.error('Failed to get patient doctors:', error)
      return []
    }
  }

  // User Search
  async searchUsers(query: string, role?: UserRole): Promise<User[]> {
    try {
      return await this.searchUsersInDatabase(query, role)
    } catch (error) {
      console.error('User search failed:', error)
      return []
    }
  }

  // Password Management
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Verify current password
      const user = await this.findUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const storedPasswordHash = await this.getUserPasswordHash(userId)
      if (!storedPasswordHash) {
        throw new Error('No password set for user')
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedPasswordHash)
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      // Update password
      await this.updateUserPasswordInDatabase(userId, newPasswordHash)

      // Log activity
      await this.logActivity(userId, 'PASSWORD_CHANGED')

    } catch (error) {
      console.error('Password change failed:', error)
      throw error
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.findUserByEmail(email)
      if (!user) {
        // Don't reveal if email exists for security
        return
      }

      // Generate reset token
      const resetToken = this.generateResetToken()
      
      // Save reset token to database
      await this.savePasswordResetToken(user.id, resetToken)

      // Send reset email (would use nodemailer)
      await this.sendPasswordResetEmail(user.email, resetToken)

    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  // Database Operations (would be implemented with Prisma)
  private async findUserByEmail(email: string): Promise<User | null> {
    // Implementation would query database
    return null
  }

  private async findUserById(id: string): Promise<User | null> {
    // Implementation would query database
    return null
  }

  private async saveUserToDatabase(user: User, passwordHash?: string): Promise<void> {
    // Implementation would save to database
    console.log('Saving user to database:', user.email)
  }

  private async getUserPasswordHash(userId: string): Promise<string | null> {
    // Implementation would fetch password hash from database
    return null
  }

  private async fetchUserProfileFromDatabase(userId: string): Promise<UserProfile | null> {
    // Implementation would fetch from database
    return null
  }

  private async updateUserProfileInDatabase(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    // Implementation would update database
    throw new Error('Not implemented')
  }

  private async saveUserProfileToDatabase(profile: UserProfile): Promise<void> {
    // Implementation would save to database
    console.log('Saving user profile to database:', profile.userId)
  }

  private async saveDoctorPatientRelationship(doctorId: string, patientId: string): Promise<void> {
    // Implementation would save relationship to database
    console.log('Creating doctor-patient relationship:', doctorId, patientId)
  }

  private async fetchDoctorPatientsFromDatabase(doctorId: string): Promise<User[]> {
    // Implementation would fetch from database
    return []
  }

  private async fetchPatientDoctorsFromDatabase(patientId: string): Promise<User[]> {
    // Implementation would fetch from database
    return []
  }

  private async searchUsersInDatabase(query: string, role?: UserRole): Promise<User[]> {
    // Implementation would search database
    return []
  }

  private async updateUserPasswordInDatabase(userId: string, passwordHash: string): Promise<void> {
    // Implementation would update database
    console.log('Updating password for user:', userId)
  }

  private async savePasswordResetToken(userId: string, token: string): Promise<void> {
    // Implementation would save token to database
    console.log('Saving password reset token for user:', userId)
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Implementation would send email using nodemailer
    console.log('Sending password reset email to:', email)
  }

  private async logActivity(userId: string, action: string): Promise<void> {
    // Implementation would log activity to database
    console.log(`Activity logged: ${action} by user ${userId}`)
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36)
  }
} 