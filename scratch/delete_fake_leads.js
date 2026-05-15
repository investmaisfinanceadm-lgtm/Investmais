const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.contato.deleteMany({
    where: {
      nome: {
        startsWith: 'Lead Fantasia'
      }
    }
  })
  console.log(`Deleted ${result.count} fake leads from database. Deals associated with them should be cascaded or we might need to delete deals manually.`)
  
  const orphanDeals = await prisma.deal.deleteMany({
    where: {
      titulo: {
        startsWith: 'Oportunidade - Empresa'
      }
    }
  })
  console.log(`Deleted ${orphanDeals.count} fake deals.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
