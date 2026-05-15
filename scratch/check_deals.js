const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const pipelines = await prisma.pipeline.findMany({
    orderBy: { created_at: 'asc' },
    include: { stages: true, _count: { select: { stages: true } } }
  })
  
  for (const p of pipelines) {
    const deals = await prisma.deal.count({
      where: { stage: { pipeline_id: p.id } }
    })
    console.log(`Pipeline: ${p.nome} | ID: ${p.id} | Stages: ${p._count.stages} | Deals: ${deals}`)
    for (const s of p.stages) {
      console.log(`  - Stage: ${s.nome} (ID: ${s.id})`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
