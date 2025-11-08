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

export async function logAudit(
  action: string,
  actorId?: string,
  companyId?: string,
  meta?: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorId: actorId || null,
        companyId: companyId || null,
        meta: meta || null,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
