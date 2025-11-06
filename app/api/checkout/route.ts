import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createCheckoutSchema } from "@/lib/validations"
import { isStripeEnabled } from "@/lib/isStripeEnabled"
import { createAuditLog } from "@/lib/audit"
import Stripe from "stripe"

const PLATFORM_FEE_PERCENT = parseFloat(
  process.env.STRIPE_PRICE_FEE_PERCENT || "0.02"
)
const PLATFORM_FEE_FLAT = parseFloat(
  process.env.STRIPE_FEE_FLAT_USD || "499"
)

let stripe: Stripe | null = null
if (isStripeEnabled()) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = createCheckoutSchema.parse(body)

    const inventory = await prisma.creditInventory.findUnique({
      where: { id: validated.inventoryId },
    })

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      )
    }

    if (Number(inventory.availableUSD) < validated.amountUSD) {
      return NextResponse.json(
        { error: "Insufficient available credits" },
        { status: 400 }
      )
    }

    const subtotal = validated.amountUSD * Number(inventory.pricePerDollar)
    const fees = Math.max(subtotal * PLATFORM_FEE_PERCENT, PLATFORM_FEE_FLAT)
    const total = subtotal + fees

    if (isStripeEnabled() && stripe) {
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          companyId: session.user.companyId,
          inventoryId: validated.inventoryId,
          amountUSD: validated.amountUSD,
          pricePerDollar: inventory.pricePerDollar,
          subtotalUSD: subtotal,
          feesUSD: fees,
          totalUSD: total,
        },
      })

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${inventory.creditType} ${inventory.taxYear} - $${validated.amountUSD.toLocaleString()} face @ $${inventory.pricePerDollar}`,
              },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL || "http://localhost:5000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:5000"}/checkout/cancel`,
        metadata: {
          purchaseOrderId: purchaseOrder.id,
        },
      })

      await prisma.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { stripeSessionId: stripeSession.id },
      })

      return NextResponse.json({ url: stripeSession.url })
    } else {
      const result = await prisma.$transaction(async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.create({
          data: {
            companyId: session.user.companyId,
            inventoryId: validated.inventoryId,
            amountUSD: validated.amountUSD,
            pricePerDollar: inventory.pricePerDollar,
            subtotalUSD: subtotal,
            feesUSD: fees,
            totalUSD: total,
            status: "PAID_TEST",
            brokerStatus: "PENDING",
          },
        })

        await tx.creditInventory.update({
          where: { id: validated.inventoryId },
          data: {
            availableUSD: {
              decrement: validated.amountUSD,
            },
          },
        })

        await tx.auditLog.create({
          data: {
            actorId: session.user.id || undefined,
            action: "PURCHASE_TEST",
            entity: "PurchaseOrder",
            entityId: purchaseOrder.id,
          },
        })

        return purchaseOrder
      })

      console.log(`[DEMO MODE] Purchase order created: ${result.id} for $${validated.amountUSD}`)

      return NextResponse.json({ 
        ok: true, 
        orderId: result.id,
        message: "Order created in demo mode (no payment required)",
      })
    }
  } catch (error: any) {
    console.error("Checkout error:", error)
    const errorMessage = error.message || "Checkout failed"
    console.error("Error details:", errorMessage)
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 400 }
    )
  }
}
