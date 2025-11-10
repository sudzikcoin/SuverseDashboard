import { prisma } from "./db"
import { AuditAction, AuditEntity } from "@prisma/client"

type AuditParams = {
  actorId?: string | null
  actorEmail?: string | null
  action: AuditAction
  entity: AuditEntity
  entityId: string
  details?: Record<string, any>
  companyId?: string | null
}

export async function writeAudit(p: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: p.actorId ?? undefined,
      actorEmail: p.actorEmail ?? undefined,
      action: p.action,
      entity: p.entity,
      entityId: p.entityId,
      details: p.details as any,
      companyId: p.companyId ?? undefined,
    },
  })
}

export async function createAuditLog(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> {
  const actionMap: Record<string, AuditAction> = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    RESET_PASSWORD: "RESET_PASSWORD",
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
  }
  
  const entityMap: Record<string, AuditEntity> = {
    User: "USER",
    Company: "COMPANY",
    PurchaseOrder: "PURCHASE",
    CreditInventory: "CREDIT",
    Document: "DOCUMENT",
    Hold: "SYSTEM",
  }
  
  const mappedAction = actionMap[action] || "CREATE"
  const mappedEntity = entityMap[entity] || "SYSTEM"
  
  await writeAudit({
    actorId,
    action: mappedAction,
    entity: mappedEntity,
    entityId: entityId || "",
    details,
  })
}

export async function logAudit(
  action: string,
  actorId?: string,
  companyId?: string,
  meta?: any
): Promise<void> {
  await createAuditLog(
    actorId || null,
    action,
    "System",
    companyId || "",
    meta
  )
}
