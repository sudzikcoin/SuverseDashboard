import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { generateBrokerPackagePDF } from "@/lib/pdf"
import { sendPaymentConfirmation } from "@/lib/email"

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('[stripe] STRIPE_SECRET_KEY not configured');
    return null;
  }
  return new Stripe(key, { apiVersion: "2025-10-29.clover" });
}

export async function POST(req: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
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
        documents: documents.map(d => ({ type: d.filename, url: `/api/file-by-id?id=${d.id}` })),
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
