import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";

const db = prisma;

const CreatePaymentSchema = z.object({
  purchaseId: z.string(),
  txHash: z.string(),
  amountUSD: z.number().positive(),
  feeUSD: z.number().nonnegative(),
  network: z.string().default("base"),
  token: z.string().default("USDC"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = CreatePaymentSchema.parse(body);

    const purchase = await db.purchase.findUnique({
      where: { id: validated.purchaseId },
      include: { company: { include: { accountantLinks: true } } },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Purchase is not pending payment" },
        { status: 400 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "ACCOUNTANT") {
      return NextResponse.json(
        { error: "Only admins and accountants can submit payments" },
        { status: 403 }
      );
    }

    if (user.role === "ACCOUNTANT") {
      const hasAccess = purchase.company.accountantLinks.some(
        (link: { accountantId: string }) => link.accountantId === user.id
      );
      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this company's purchases" },
          { status: 403 }
        );
      }
    }

    const purchaseTotalUSD = purchase.totalUSD;
    const submittedTotal = new Prisma.Decimal(validated.amountUSD).plus(validated.feeUSD);
    const tolerance = new Prisma.Decimal("0.01");
    const diff = purchaseTotalUSD.minus(submittedTotal).abs();
    
    if (diff.greaterThan(tolerance)) {
      return NextResponse.json(
        {
          error: "Payment amount mismatch",
          expected: purchaseTotalUSD.toNumber(),
          submitted: submittedTotal.toNumber(),
        },
        { status: 400 }
      );
    }

    const payment = await db.payment.upsert({
      where: { purchaseId: validated.purchaseId },
      create: {
        purchaseId: validated.purchaseId,
        txHash: validated.txHash,
        amountUSD: new Prisma.Decimal(validated.amountUSD),
        feeUSD: new Prisma.Decimal(validated.feeUSD),
        network: validated.network,
        token: validated.token,
        status: "SUBMITTED",
      },
      update: {
        txHash: validated.txHash,
        amountUSD: new Prisma.Decimal(validated.amountUSD),
        feeUSD: new Prisma.Decimal(validated.feeUSD),
        status: "SUBMITTED",
      },
    });

    await db.purchase.update({
      where: { id: validated.purchaseId },
      data: { status: "PAID" },
    });

    await writeAudit({
      actorId: user.id,
      actorEmail: user.email!,
      action: "PAYMENT_SUBMITTED",
      entity: "PAYMENT",
      entityId: payment.id,
      companyId: purchase.companyId,
      details: {
        purchaseId: validated.purchaseId,
        txHash: validated.txHash,
        amountUSD: validated.amountUSD,
        feeUSD: validated.feeUSD,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
