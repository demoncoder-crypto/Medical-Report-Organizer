// Database Seeding Script for Medical Data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create demo patient
  const demoPatient = await prisma.user.upsert({
    where: { email: 'patient@demo.com' },
    update: {},
    create: {
      email: 'patient@demo.com',
      name: 'John Smith',
      role: 'PATIENT',
      patientProfile: {
        create: {
          mrn: 'MRN123456',
          dateOfBirth: new Date('1965-03-15'),
          gender: 'MALE',
          phoneNumber: '+1-555-0123',
          address: '123 Main St, Anytown, ST 12345',
          emergencyContact: 'Jane Smith (spouse) - 555-0124',
          insurance: 'Blue Cross Blue Shield',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
          familyHistory: ['Diabetes (father)', 'Heart disease (mother)']
        }
      }
    },
    include: { patientProfile: true }
  })

  // Create demo doctor
  const demoDoctor = await prisma.user.upsert({
    where: { email: 'doctor@demo.com' },
    update: {},
    create: {
      email: 'doctor@demo.com',
      name: 'Dr. Sarah Williams',
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          licenseNumber: 'MD123456',
          specialty: 'Internal Medicine',
          hospital: 'General Hospital',
          department: 'Internal Medicine'
        }
      }
    },
    include: { doctorProfile: true }
  })

  // Add sample documents
  await prisma.document.create({
    data: {
      userId: demoPatient.id,
      name: 'Blood Test Results - March 2024',
      type: 'LAB_RESULT',
      content: 'HbA1c: 7.2%, LDL: 95 mg/dL, Creatinine: 1.1 mg/dL',
      summary: 'Lab results showing elevated HbA1c',
      doctor: 'Dr. Williams',
      hospital: 'General Hospital',
      date: new Date('2024-03-10'),
      tags: ['diabetes', 'cholesterol'],
      processed: true,
      confidence: 0.95
    }
  })

  // Add drug interactions
  await prisma.drugInteraction.create({
    data: {
      drug1: 'lisinopril',
      drug2: 'potassium supplements',
      severity: 'MODERATE',
      description: 'Risk of hyperkalemia',
      mechanism: 'ACE inhibitors reduce potassium excretion',
      management: 'Monitor serum potassium levels',
      sources: ['AHA Guidelines']
    }
  })

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 