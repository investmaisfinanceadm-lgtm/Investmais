const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const fields = Object.keys(prisma.profile.fields || {})
    console.log('Profile fields:', fields)
  } catch (e) {
    console.error('Error getting fields:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
