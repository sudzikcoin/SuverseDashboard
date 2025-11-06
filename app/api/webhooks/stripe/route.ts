import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { generateBrokerPackagePDF } from "@/lib/pdf"
import { sendPaymentConfirmation } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const purchaseOrderId = session.metadata?.purchaseOrderId

      if (!purchaseOrderId) {
        console.error("No purchaseOrderId in session metadata")
        return NextResponse.json({ received: true })
      }

      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: {
          company: true,
          inventory: true,
        },
      })

      if (!purchaseOrder) {
        console.error("Purchase order not found:", purchaseOrderId)
        return NextResponse.json({ received: true })
      }

      const documents = await prisma.document.findMany({
        where: { companyId: purchaseOrder.companyId },
      })

      const pdfBuffer = await generateBrokerPackagePDF({
        poNumber: purchaseOrder.id,
        buyerName: purchaseOrder.company.legalName,
        creditType: purchaseOrder.inventory.creditType,
        taxYear: purchaseOrder.inventory.taxYear,
        amountUSD: Number(purchaseOrder.amountUSD),
        pricePerDollar: Number(purchaseOrder.pricePerDollar),
        totalUSD: Number(purchaseOrder.totalUSD),
        documents: documents.map(d => ({ type: d.type, url: d.url })),
      })

      const brokerPackageUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: "PAID",
          brokerPackageUrl,
        },
      })

      await sendPaymentConfirmation(
        purchaseOrder.company.contactEmail,
        purchaseOrder.id
      )
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}
