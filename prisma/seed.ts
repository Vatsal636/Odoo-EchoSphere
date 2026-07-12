import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


async function main() {
  console.log('Seeding EcoSphere database...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.rewardRedemption.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.challengeParticipation.deleteMany()
  await prisma.employeeParticipation.deleteMany()
  await prisma.departmentScore.deleteMany()
  await prisma.carbonTransaction.deleteMany()
  await prisma.environmentalGoal.deleteMany()
  await prisma.complianceIssue.deleteMany()
  await prisma.policyAcknowledgement.deleteMany()
  await prisma.audit.deleteMany()
  await prisma.eSGPolicy.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.cSRActivity.deleteMany()
  await prisma.category.deleteMany()
  await prisma.emissionFactor.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  // Departments
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', code: 'ENG', status: 'ACTIVE' },
  })
  const marketing = await prisma.department.create({
    data: { name: 'Marketing', code: 'MKT', status: 'ACTIVE' },
  })
  const operations = await prisma.department.create({
    data: { name: 'Operations', code: 'OPS', status: 'ACTIVE' },
  })

  // Users
  const password = await hash('Admin@1234', 12)
  const empPassword = await hash('Employee@123', 12)

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@ecosphere.com', password, role: 'ADMIN', totalXP: 5000, totalPoints: 2500 },
  })

  const engManager = await prisma.user.create({
    data: { name: 'Alice Chen', email: 'alice@ecosphere.com', password, role: 'MANAGER', departmentId: engineering.id, totalXP: 3200, totalPoints: 1800 },
  })
  const mktManager = await prisma.user.create({
    data: { name: 'Bob Martinez', email: 'bob@ecosphere.com', password, role: 'MANAGER', departmentId: marketing.id, totalXP: 2800, totalPoints: 1500 },
  })
  const opsManager = await prisma.user.create({
    data: { name: 'Carol Williams', email: 'carol@ecosphere.com', password, role: 'MANAGER', departmentId: operations.id, totalXP: 3500, totalPoints: 2000 },
  })

  const emp1 = await prisma.user.create({
    data: { name: 'David Kim', email: 'david@ecosphere.com', password: empPassword, role: 'EMPLOYEE', departmentId: engineering.id, totalXP: 1200, totalPoints: 800 },
  })
  const emp2 = await prisma.user.create({
    data: { name: 'Eva Johnson', email: 'eva@ecosphere.com', password: empPassword, role: 'EMPLOYEE', departmentId: engineering.id, totalXP: 900, totalPoints: 600 },
  })
  const emp3 = await prisma.user.create({
    data: { name: 'Frank Lee', email: 'frank@ecosphere.com', password: empPassword, role: 'EMPLOYEE', departmentId: marketing.id, totalXP: 750, totalPoints: 500 },
  })
  const emp4 = await prisma.user.create({
    data: { name: 'Grace Patel', email: 'grace@ecosphere.com', password: empPassword, role: 'EMPLOYEE', departmentId: operations.id, totalXP: 1500, totalPoints: 1000 },
  })
  const emp5 = await prisma.user.create({
    data: { name: 'Henry Zhang', email: 'henry@ecosphere.com', password: empPassword, role: 'EMPLOYEE', departmentId: operations.id, totalXP: 600, totalPoints: 400 },
  })

  // Set department heads
  await prisma.department.update({ where: { id: engineering.id }, data: { headId: engManager.id } })
  await prisma.department.update({ where: { id: marketing.id }, data: { headId: mktManager.id } })
  await prisma.department.update({ where: { id: operations.id }, data: { headId: opsManager.id } })

  // Categories
  const envCategory = await prisma.category.create({
    data: { name: 'Environment', type: 'CSR_ACTIVITY' },
  })
  const eduCategory = await prisma.category.create({
    data: { name: 'Education', type: 'CSR_ACTIVITY' },
  })
  const healthCategory = await prisma.category.create({
    data: { name: 'Health & Wellness', type: 'CSR_ACTIVITY' },
  })
  const challengeCategory = await prisma.category.create({
    data: { name: 'General', type: 'CHALLENGE' },
  })
  const innovationCategory = await prisma.category.create({
    data: { name: 'Innovation', type: 'CHALLENGE' },
  })

  // Emission Factors
  const dieselFactor = await prisma.emissionFactor.create({
    data: { name: 'Diesel Generator', factor: 2.68, unit: 'liter', scope: 'Scope 1', isActive: true },
  })
  const electricityFactor = await prisma.emissionFactor.create({
    data: { name: 'Grid Electricity', factor: 0.5, unit: 'kWh', scope: 'Scope 2', isActive: true },
  })
  const airTravelFactor = await prisma.emissionFactor.create({
    data: { name: 'Air Travel', factor: 0.255, unit: 'km', scope: 'Scope 3', isActive: true },
  })

  // Carbon Transactions (spread over 6 months)
  const now = new Date()
  const transactions = [
    { source: 'Office Electricity', amount: 15000, unit: 'kWh', totalEmissions: 7500, factorId: electricityFactor.id, deptId: engineering.id, date: new Date(now.getFullYear(), now.getMonth() - 5, 15) },
    { source: 'Diesel Backup', amount: 500, unit: 'liter', totalEmissions: 1340, factorId: dieselFactor.id, deptId: engineering.id, date: new Date(now.getFullYear(), now.getMonth() - 5, 20) },
    { source: 'Business Travel', amount: 8000, unit: 'km', totalEmissions: 2040, factorId: airTravelFactor.id, deptId: marketing.id, date: new Date(now.getFullYear(), now.getMonth() - 4, 10) },
    { source: 'Office Electricity', amount: 14200, unit: 'kWh', totalEmissions: 7100, factorId: electricityFactor.id, deptId: marketing.id, date: new Date(now.getFullYear(), now.getMonth() - 4, 15) },
    { source: 'Warehouse Operations', amount: 20000, unit: 'kWh', totalEmissions: 10000, factorId: electricityFactor.id, deptId: operations.id, date: new Date(now.getFullYear(), now.getMonth() - 3, 5) },
    { source: 'Fleet Fuel', amount: 1200, unit: 'liter', totalEmissions: 3216, factorId: dieselFactor.id, deptId: operations.id, date: new Date(now.getFullYear(), now.getMonth() - 3, 12) },
    { source: 'Office Electricity', amount: 14800, unit: 'kWh', totalEmissions: 7400, factorId: electricityFactor.id, deptId: engineering.id, date: new Date(now.getFullYear(), now.getMonth() - 2, 15) },
    { source: 'Client Travel', amount: 6000, unit: 'km', totalEmissions: 1530, factorId: airTravelFactor.id, deptId: marketing.id, date: new Date(now.getFullYear(), now.getMonth() - 1, 8) },
    { source: 'Warehouse Electricity', amount: 19000, unit: 'kWh', totalEmissions: 9500, factorId: electricityFactor.id, deptId: operations.id, date: new Date(now.getFullYear(), now.getMonth() - 1, 20) },
    { source: 'Diesel Generator', amount: 300, unit: 'liter', totalEmissions: 804, factorId: dieselFactor.id, deptId: engineering.id, date: new Date(now.getFullYear(), now.getMonth(), 1) },
  ]

  for (const tx of transactions) {
    await prisma.carbonTransaction.create({
      data: {
        source: tx.source,
        amount: tx.amount,
        unit: tx.unit,
        totalEmissions: tx.totalEmissions,
        date: tx.date,
        emissionFactor: { connect: { id: tx.factorId } },
        department: { connect: { id: tx.deptId } },
        user: { connect: { id: admin.id } },
      },
    })
  }

  // Environmental Goals
  await prisma.environmentalGoal.create({
    data: { title: 'Reduce Engineering Emissions', description: 'Reduce scope 2 emissions by 20%', targetKg: 80000, currentKg: 22300, deadline: new Date(now.getFullYear(), 11, 31), status: 'ON_TRACK', departmentId: engineering.id },
  })
  await prisma.environmentalGoal.create({
    data: { title: 'Operations Net Zero', description: 'Achieve net zero operations', targetKg: 50000, currentKg: 22716, deadline: new Date(now.getFullYear() + 1, 5, 30), status: 'AT_RISK', departmentId: operations.id },
  })

  // CSR Activities
  const treePlanting = await prisma.cSRActivity.create({
    data: {
      title: 'Tree Plantation Drive',
      description: 'Plant 1000 trees across the city. Join us for a weekend of environmental action!',
      points: 50,
      maxParticipants: 50,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 30),
      status: 'ACTIVE',
      createdById: admin.id,
      categoryId: envCategory.id,
    },
  })

  const codingWorkshop = await prisma.cSRActivity.create({
    data: {
      title: 'Code for Good Workshop',
      description: 'Teach programming to underprivileged students. Weekend workshops for 4 weeks.',
      points: 100,
      maxParticipants: 20,
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      status: 'UPCOMING',
      createdById: engManager.id,
      categoryId: eduCategory.id,
    },
  })

  const healthCamp = await prisma.cSRActivity.create({
    data: {
      title: 'Community Health Camp',
      description: 'Free health checkup camp for local community. Volunteers needed for registration and coordination.',
      points: 75,
      maxParticipants: 30,
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      status: 'COMPLETED',
      createdById: mktManager.id,
      categoryId: healthCategory.id,
    },
  })

  // Employee Participations
  const participationsData = [
    { userId: emp1.id, activityId: treePlanting.id, status: 'APPROVED', pointsEarned: 50, completionDate: new Date() },
    { userId: emp2.id, activityId: treePlanting.id, status: 'PENDING', pointsEarned: 0 },
    { userId: emp3.id, activityId: treePlanting.id, status: 'APPROVED', pointsEarned: 50, completionDate: new Date() },
    { userId: emp4.id, activityId: healthCamp.id, status: 'APPROVED', pointsEarned: 75, completionDate: new Date(now.getFullYear(), now.getMonth() - 2, 15) },
    { userId: emp5.id, activityId: healthCamp.id, status: 'REJECTED', pointsEarned: 0, reviewNote: 'Missed the event' },
    { userId: emp1.id, activityId: healthCamp.id, status: 'APPROVED', pointsEarned: 75, completionDate: new Date(now.getFullYear(), now.getMonth() - 2, 10) },
  ]

  for (const p of participationsData) {
    await prisma.employeeParticipation.create({
      data: {
        userId: p.userId,
        activityId: p.activityId,
        status: p.status as any,
        pointsEarned: p.pointsEarned,
        completionDate: p.completionDate ?? null,
        reviewNote: (p as any).reviewNote ?? null,
      },
    })
  }

  // ESG Policies
  const policy1 = await prisma.eSGPolicy.create({
    data: {
      title: 'Environmental Sustainability Policy',
      description: 'This policy outlines our commitment to reducing carbon emissions, managing waste responsibly, and promoting sustainable practices across all operations. All employees must adhere to these guidelines.',
      effectiveDate: new Date(now.getFullYear(), 0, 1),
      status: 'ACTIVE',
      createdById: admin.id,
    },
  })
  const policy2 = await prisma.eSGPolicy.create({
    data: {
      title: 'Diversity & Inclusion Policy',
      description: 'We are committed to fostering a diverse and inclusive workplace. This policy prohibits discrimination and promotes equal opportunities for all employees regardless of background.',
      effectiveDate: new Date(now.getFullYear(), 0, 15),
      status: 'ACTIVE',
      createdById: admin.id,
    },
  })
  await prisma.eSGPolicy.create({
    data: {
      title: 'Data Privacy & Governance Policy',
      description: 'This policy establishes guidelines for data handling, privacy protection, and compliance with regulatory requirements including GDPR and CCPA.',
      effectiveDate: new Date(now.getFullYear(), 6, 1),
      status: 'DRAFT',
      createdById: admin.id,
    },
  })

  // Policy Acknowledgements
  const allUsers = [emp1, emp2, emp3, emp4, emp5, engManager, mktManager, opsManager]
  for (const user of allUsers) {
    await prisma.policyAcknowledgement.create({
      data: { policyId: policy1.id, userId: user.id },
    })
  }
  // 6 out of 8 acknowledged policy 2
  for (const user of [emp1, emp2, emp4, emp5, engManager, mktManager]) {
    await prisma.policyAcknowledgement.create({
      data: { policyId: policy2.id, userId: user.id },
    })
  }

  // Audit
  const audit = await prisma.audit.create({
    data: {
      title: 'Q2 ESG Compliance Audit',
      scope: 'Environmental compliance review across all departments',
      description: 'Annual audit of environmental compliance, emissions reporting, and policy adherence.',
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      status: 'IN_PROGRESS',
      auditor: { connect: { id: admin.id } },
    },
  })

  // Compliance Issues
  await prisma.complianceIssue.create({
    data: {
      title: 'Missing Emissions Data - Q1',
      description: 'Engineering department did not submit Q1 emissions data for scope 3 sources.',
      severity: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      audit: { connect: { id: audit.id } },
      owner: { connect: { id: engManager.id } },
    },
  })
  await prisma.complianceIssue.create({
    data: {
      title: 'Waste Disposal Non-compliance',
      description: 'Operations department found disposing e-waste through non-certified vendors.',
      severity: 'CRITICAL',
      status: 'OVERDUE',
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      audit: { connect: { id: audit.id } },
      owner: { connect: { id: opsManager.id } },
    },
  })
  await prisma.complianceIssue.create({
    data: {
      title: 'Policy Acknowledgement Gap',
      description: 'Marketing team has less than 70% policy acknowledgement rate.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      audit: { connect: { id: audit.id } },
      owner: { connect: { id: mktManager.id } },
      resolution: 'Conducted team meeting and collected all acknowledgements.',
    },
  })

  // Challenges
  const challenge1 = await prisma.challenge.create({
    data: {
      title: '30-Day Sustainability Challenge',
      description: 'Reduce your personal carbon footprint. Track daily eco-friendly actions and earn XP.',
      xpReward: 500,
      difficulty: 'MEDIUM',
      evidenceRequired: true,
      deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      status: 'ACTIVE',
      createdById: admin.id,
      categoryId: challengeCategory.id,
    },
  })
  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Innovation Sprint',
      description: 'Submit an idea for improving ESG metrics. Top ideas get implemented and earn bonus XP.',
      xpReward: 1000,
      difficulty: 'HARD',
      evidenceRequired: true,
      deadline: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      status: 'UNDER_REVIEW',
      createdById: engManager.id,
      categoryId: innovationCategory.id,
    },
  })
  const challenge3 = await prisma.challenge.create({
    data: {
      title: 'Wellness Week Challenge',
      description: 'Complete daily wellness activities: meditation, exercise, and healthy eating logs.',
      xpReward: 300,
      difficulty: 'EASY',
      evidenceRequired: false,
      deadline: new Date(now.getFullYear(), now.getMonth() - 1, 7),
      status: 'COMPLETED',
      createdById: mktManager.id,
      categoryId: challengeCategory.id,
    },
  })

  // Challenge Participations
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge1.id, userId: emp1.id, status: 'JOINED', progress: 30 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge1.id, userId: emp4.id, status: 'SUBMITTED', progress: 100 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge2.id, userId: emp1.id, status: 'SUBMITTED', progress: 100 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge2.id, userId: emp2.id, status: 'SUBMITTED', progress: 100 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge3.id, userId: emp1.id, status: 'APPROVED', xpAwarded: 300 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge3.id, userId: emp3.id, status: 'APPROVED', xpAwarded: 300 },
  })
  await prisma.challengeParticipation.create({
    data: { challengeId: challenge3.id, userId: emp5.id, status: 'APPROVED', xpAwarded: 300 },
  })

  // Badges
  const badge1 = await prisma.badge.create({
    data: { name: 'Eco Warrior', description: 'Earn 1000 XP from environmental activities', iconEmoji: '🌿', unlockType: 'MIN_XP', unlockThreshold: 1000 },
  })
  const badge2 = await prisma.badge.create({
    data: { name: 'Challenge Master', description: 'Complete 5 challenges', iconEmoji: '🏆', unlockType: 'MIN_CHALLENGES_COMPLETED', unlockThreshold: 5 },
  })
  const badge3 = await prisma.badge.create({
    data: { name: 'Community Star', description: 'Participate in 3 CSR activities', iconEmoji: '⭐', unlockType: 'MIN_CSR_ACTIVITIES', unlockThreshold: 3 },
  })

  // User Badges
  await prisma.userBadge.create({ data: { userId: emp1.id, badgeId: badge1.id } })
  await prisma.userBadge.create({ data: { userId: emp1.id, badgeId: badge2.id } })
  await prisma.userBadge.create({ data: { userId: emp4.id, badgeId: badge1.id } })
  await prisma.userBadge.create({ data: { userId: emp4.id, badgeId: badge3.id } })

  // Rewards
  await prisma.reward.create({
    data: { name: 'EcoSphere Merch Pack', description: 'Branded t-shirt, water bottle, and tote bag', pointsRequired: 500, stock: 20, status: 'ACTIVE' },
  })
  await prisma.reward.create({
    data: { name: 'Extra PTO Day', description: 'One additional paid time off day', pointsRequired: 1000, stock: 10, status: 'ACTIVE' },
  })
  await prisma.reward.create({
    data: { name: 'Gift Card - $50', description: 'Amazon gift card worth $50', pointsRequired: 2000, stock: 5, status: 'ACTIVE' },
  })

  // Department Scores
  const scoreStart = new Date(now.getFullYear(), now.getMonth() - 6, 1)
  const scoreEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  for (const dept of [engineering, marketing, operations]) {
    await prisma.departmentScore.create({
      data: {
        departmentId: dept.id,
        environmentalScore: dept.id === engineering.id ? 65 : dept.id === marketing.id ? 72 : 55,
        socialScore: 70,
        governanceScore: 80,
        totalScore: dept.id === engineering.id ? 71 : dept.id === marketing.id ? 74 : 68,
        periodStart: scoreStart,
        periodEnd: scoreEnd,
      },
    })
  }

  console.log('Seeding complete!')
  console.log('Admin login: admin@ecosphere.com / Admin@1234')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
