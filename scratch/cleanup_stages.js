const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const pipelines = await prisma.pipeline.findMany({
    orderBy: { created_at: 'asc' },
    include: { stages: { orderBy: { ordem: 'asc' } } }
  })
  
  if (pipelines.length <= 1) {
    console.log("Only 1 pipeline found. Nothing to clean.")
    return
  }

  const primaryPipeline = pipelines[0]
  console.log(`Primary Pipeline: ${primaryPipeline.nome} (${primaryPipeline.id})`)
  
  const stageMap = {} // Maps stage index to primary stage ID
  primaryPipeline.stages.forEach((s, idx) => {
    stageMap[idx] = s.id
  })

  // Move deals from other pipelines to the primary pipeline
  for (let i = 1; i < pipelines.length; i++) {
    const duplicate = pipelines[i]
    console.log(`Processing duplicate pipeline: ${duplicate.id}`)
    
    for (let j = 0; j < duplicate.stages.length; j++) {
      const dupStage = duplicate.stages[j]
      const primaryStageId = stageMap[j]
      
      if (primaryStageId) {
        // Move deals
        const result = await prisma.deal.updateMany({
          where: { stage_id: dupStage.id },
          data: { stage_id: primaryStageId }
        })
        console.log(`  Moved ${result.count} deals from stage ${dupStage.nome} to primary stage.`)
      }
    }
    
    // Delete duplicate pipeline (cascades to stages)
    await prisma.pipeline.delete({
      where: { id: duplicate.id }
    })
    console.log(`  Deleted duplicate pipeline ${duplicate.id}`)
  }
  
  // Verify
  const remaining = await prisma.pipeline.count()
  const remainingStages = await prisma.stage.count()
  console.log(`Cleanup complete! Remaining Pipelines: ${remaining}, Remaining Stages: ${remainingStages}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
