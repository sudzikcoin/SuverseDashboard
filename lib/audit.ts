import { prisma } from "./db"
import { AuditAction, AuditEntity, Prisma } from "@prisma/client"
import { getRequestContext } from "./reqctx"

type AuditParams = {
  actorId?: string | null
  actorEmail?: string | null
  action: AuditAction
  entity: AuditEntity
  entityId: string
  details?: Record<string, any>
  companyId?: string | null
  txHash?: string | null
  amountUSD?: number | Prisma.Decimal | null
  skipRequestContext?: boolean
}

export async function writeAudit(p: AuditParams): Promise<void> {
  let ip: string | undefined;
  let userAgent: string | undefined;
  
  if (!p.skipRequestContext) {
    try {
      const ctx = await getRequestContext();
      ip = ctx.ip;
      userAgent = ctx.userAgent;
    } catch (error) {
      console.error("[audit] Failed to get request context:", error);
    }
  }
  
  await prisma.auditLog.create({
    data: {
      actorId: p.actorId ?? undefined,
      actorEmail: p.actorEmail ?? undefined,
      action: p.action,
      entity: p.entity,
      entityId: p.entityId,
      details: p.details as any,
      companyId: p.companyId ?? undefined,
      ip,
      userAgent,
      txHash: p.txHash ?? undefined,
      amountUSD: p.amountUSD != null ? new Prisma.Decimal(p.amountUSD.toString()) : undefined,
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
