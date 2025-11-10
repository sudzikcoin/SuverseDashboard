import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin"
import { writeAudit } from "@/lib/audit"
import * as XLSX from "xlsx"
import { z } from "zod"

const Row = z.object({
  brokerRef: z.string().optional(),
  source: z.string().optional(),
  creditType: z.string().min(2),
  taxYear: z.coerce.number().int().min(2000).max(2100),
  state: z.string().optional(),
  jurisdiction: z.string().optional(),
  faceValueUSD: z.coerce.number().positive(),
  availableUSD: z.coerce.number().nonnegative(),
  minBlockUSD: z.coerce.number().positive(),
  pricePerDollar: z.coerce.number().min(0.5).max(1.0),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  brokerName: z.string().optional(),
  notes: z.string().optional(),
})
const Rows = z.array(Row).min(1)

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession()

    const form = await req.formData()
    const file = form.get("file") as File | null
    const declaredSource = (form.get("source") as string | null) ?? undefined
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ab = await file.arrayBuffer()
    const wb = XLSX.read(new Uint8Array(ab), { type: "array" })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" })

    const norm = (r: any, k: string) =>
      r[k] ?? r[k.toLowerCase()] ?? r[k.toUpperCase()]
    
    const rows = raw.map((r: any) => ({
      brokerRef:
        norm(r, "brokerRef") ||
        norm(r, "BrokerRef") ||
        norm(r, "REF") ||
        undefined,
      source: declaredSource || norm(r, "source") || norm(r, "Source") || undefined,
      creditType:
        String(
          norm(r, "creditType") ||
            norm(r, "code") ||
            norm(r, "Credit") ||
            norm(r, "Type") ||
            ""
        ).trim(),
      taxYear: norm(r, "taxYear") || norm(r, "year") || norm(r, "Year"),
      state: norm(r, "state") || norm(r, "State") || undefined,
      jurisdiction: norm(r, "jurisdiction") || norm(r, "Jurisdiction") || undefined,
      faceValueUSD:
        norm(r, "faceValueUSD") ||
        norm(r, "faceValue") ||
        norm(r, "FaceValue") ||
        norm(r, "Face"),
      availableUSD:
        norm(r, "availableUSD") || norm(r, "available") || norm(r, "Available"),
      minBlockUSD:
        norm(r, "minBlockUSD") ||
        norm(r, "minBlock") ||
        norm(r, "MinBlock") ||
        norm(r, "Min"),
      pricePerDollar:
        norm(r, "pricePerDollar") || norm(r, "price") || norm(r, "Price"),
      discountPct: norm(r, "discountPct") || norm(r, "Discount") || undefined,
      status: (norm(r, "status") || "ACTIVE") as string,
      brokerName: norm(r, "brokerName") || norm(r, "BrokerName") || undefined,
      notes: norm(r, "notes") || norm(r, "Notes") || undefined,
    }))

    const parsed = Rows.safeParse(rows)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    let created = 0
    let updated = 0
    
    await prisma.$transaction(async (tx) => {
      for (const r of parsed.data) {
        if (r.brokerRef) {
          const exists = await tx.creditInventory.findUnique({
            where: { brokerRef: r.brokerRef },
          })
          
          if (exists) {
            await tx.creditInventory.update({
              where: { brokerRef: r.brokerRef },
              data: {
                creditType: r.creditType,
                taxYear: r.taxYear,
                stateRestriction: r.state ?? null,
                jurisdiction: r.jurisdiction ?? null,
                faceValueUSD: r.faceValueUSD,
                availableUSD: r.availableUSD,
                minBlockUSD: r.minBlockUSD,
                pricePerDollar: r.pricePerDollar,
                status: r.status,
                brokerName: r.brokerName ?? null,
                notes: r.notes ?? null,
                source: r.source,
                importedAt: new Date(),
              },
            })
            updated++
          } else {
            await tx.creditInventory.create({
              data: {
                brokerRef: r.brokerRef,
                source: r.source,
                creditType: r.creditType,
                taxYear: r.taxYear,
                stateRestriction: r.state ?? null,
                jurisdiction: r.jurisdiction ?? null,
                faceValueUSD: r.faceValueUSD,
                availableUSD: r.availableUSD,
                minBlockUSD: r.minBlockUSD,
                pricePerDollar: r.pricePerDollar,
                status: r.status,
                brokerName: r.brokerName ?? null,
                notes: r.notes ?? null,
                importedAt: new Date(),
              },
            })
            created++
          }
        } else {
          const exists = await tx.creditInventory.findFirst({
            where: {
              creditType: r.creditType,
              taxYear: r.taxYear,
              pricePerDollar: r.pricePerDollar,
              minBlockUSD: r.minBlockUSD,
            },
          })
          
          if (exists) {
            await tx.creditInventory.update({
              where: { id: exists.id },
              data: {
                stateRestriction: r.state ?? null,
                jurisdiction: r.jurisdiction ?? null,
                faceValueUSD: r.faceValueUSD,
                availableUSD: r.availableUSD,
                status: r.status,
                brokerName: r.brokerName ?? null,
                notes: r.notes ?? null,
                source: r.source,
                importedAt: new Date(),
              },
            })
            updated++
          } else {
            await tx.creditInventory.create({
              data: {
                creditType: r.creditType,
                taxYear: r.taxYear,
                stateRestriction: r.state ?? null,
                jurisdiction: r.jurisdiction ?? null,
                faceValueUSD: r.faceValueUSD,
                availableUSD: r.availableUSD,
                minBlockUSD: r.minBlockUSD,
                pricePerDollar: r.pricePerDollar,
                status: r.status,
                brokerName: r.brokerName ?? null,
                notes: r.notes ?? null,
                source: r.source,
                importedAt: new Date(),
              },
            })
            created++
          }
        }
      }
    })

    await writeAudit({
      actorId: (session.user as any).id,
      actorEmail: (session.user as any).email ?? null,
      action: "CREATE",
      entity: "CREDIT",
      entityId: `bulk_import_${created + updated}`,
      details: {
        source: declaredSource,
        created,
        updated,
        filename: file.name,
      },
    })

    return NextResponse.json({ ok: true, counts: { created, updated } })
  } catch (error: any) {
    console.error("Credit upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload credits" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
