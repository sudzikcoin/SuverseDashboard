import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateBrokerStatusSchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/audit"
import { sendClosingCertificate } from "@/lib/email"
import { generateClosingCertificatePDF } from "@/lib/pdf"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateBrokerStatusSchema.parse(body)

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        inventory: true,
      },
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      )
    }

    let closingCertificateUrl = purchaseOrder.closingCertificateUrl

    if (validated.status === "APPROVED") {
      const pdfBuffer = await generateClosingCertificatePDF({
        poNumber: purchaseOrder.id,
        buyerName: purchaseOrder.company.legalName,
        creditType: purchaseOrder.inventory.creditType,
        taxYear: purchaseOrder.inventory.taxYear,
        amountUSD: Number(purchaseOrder.amountUSD),
        pricePerDollar: Number(purchaseOrder.pricePerDollar),
        totalUSD: Number(purchaseOrder.totalUSD),
        approvedDate: new Date(),
      })

      closingCertificateUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

      await sendClosingCertificate(
        purchaseOrder.company.contactEmail,
        purchaseOrder.id,
        pdfBuffer
      )
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        brokerStatus: validated.status,
        closingCertificateUrl,
      },
    })

    await createAuditLog(
      session.user.id,
      "UPDATE_BROKER_STATUS",
      "PurchaseOrder",
      updated.id
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Broker status update error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update broker status" },
      { status: 500 }
    )
  }
}
