import { prisma } from "./db"

type AuditParams = {
  actorId?: string | null
  actorEmail?: string | null
  action: "ARCHIVE_COMPANY" | "UNARCHIVE_COMPANY" | "BLOCK_COMPANY" | "UNBLOCK_COMPANY" | "CREATE" | "UPDATE" | "DELETE" | "RESET_PASSWORD"
  entity: "COMPANY" | "USER" | "PURCHASE" | "CREDIT" | "DOCUMENT" | "SYSTEM"
  entityId: string
  details?: Record<string, any>
  companyId?: string | null
}

export async function writeAudit(p: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: p.actorId ?? undefined,
        actorEmail: p.actorEmail ?? undefined,
        action: p.action as any,
        entity: p.entity as any,
        entityId: p.entityId,
        details: p.details as any,
        companyId: p.companyId ?? undefined,
      },
    })
  } catch (e) {
    console.error("Audit write failed", e)
  }
}

export async function createAuditLog(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
) {
  await writeAudit({
    actorId,
    action: action as any,
    entity: entity as any,
    entityId: entityId ?? "",
    details,
  })
}

export async function logAudit(
  action: string,
  actorId?: string,
  companyId?: string,
  meta?: any
): Promise<void> {
  try {
    await writeAudit({
      actorId: actorId || null,
      action: action as any,
      entity: "SYSTEM",
      entityId: companyId || "",
      details: meta,
      companyId: companyId || null,
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
