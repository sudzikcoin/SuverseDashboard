import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      amountRaw,
      feeBps,
      feeRaw,
      totalRaw,
      chainId,
      tokenAddress,
      toAddress,
      purchaseOrderId,
      meta,
    } = body

    const log = await prisma.paymentLog.create({
      data: {
        userId: session.user.id,
        companyId: session.user.companyId ?? null,
        purchaseOrderId: purchaseOrderId ?? null,
        chainId: Number(chainId),
        tokenAddress,
        toAddress,
        amountRaw: amountRaw.toString(),
        feeBps: Number(feeBps),
        feeRaw: feeRaw.toString(),
        totalRaw: totalRaw.toString(),
        status: "PENDING",
        meta: meta ?? {},
      },
    })

    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "PAYMENT_INITIATED",
      entity: "PAYMENT",
      entityId: log.id,
      details: {
        chainId,
        tokenAddress,
        amountRaw: amountRaw.toString(),
        feeBps,
        totalRaw: totalRaw.toString(),
      },
      companyId: session.user.companyId ?? undefined,
    })

    return NextResponse.json({ id: log.id })
  } catch (error: any) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment log" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, txHash, status, meta } = await req.json()

    const log = await prisma.paymentLog.update({
      where: { id },
      data: {
        txHash: txHash ?? undefined,
        status,
        meta: meta ?? undefined,
      },
    })

    const actionMap: Record<string, any> = {
      SUBMITTED: "PAYMENT_SUBMITTED",
      CONFIRMED: "PAYMENT_CONFIRMED",
      FAILED: "PAYMENT_FAILED",
    }

    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: actionMap[status] ?? "UPDATE",
      entity: "PAYMENT",
      entityId: id,
      details: {
        status,
        txHash,
        ...meta,
      },
      companyId: session.user.companyId ?? undefined,
    })

    return NextResponse.json({ ok: true, log })
  } catch (error: any) {
    console.error("Payment update error:", error)
    return NextResponse.json(
      { error: "Failed to update payment log" },
      { status: 500 }
    )
  }
}
