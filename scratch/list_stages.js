const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const boards = await prisma.pipeline.findMany({
    include: {
      stages: true
    }
  })
  
  console.log("BOARDS AND STAGES:")
  for (const b of boards) {
    console.log(`- Board: ${b.nome} (ID: ${b.id}) - Default: ${b.is_default}`)
    for (const s of b.stages) {
      console.log(`   * Stage: ${s.nome} (ID: ${s.id})`)
    }
  }

  const allStages = await prisma.stage.findMany()
  console.log(`\nTotal Stages in DB: ${allStages.length}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
