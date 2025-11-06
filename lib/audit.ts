import { prisma } from "./db"

export async function createAuditLog(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
    },
  })
}
