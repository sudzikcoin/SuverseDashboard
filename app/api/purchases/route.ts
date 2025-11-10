import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";

const db = prisma;

const CreatePurchaseSchema = z.object({
  companyId: z.string(),
  taxCreditId: z.string(),
  nominalValueUSD: z.number().positive().optional(),
  pricePerDollar: z.number().positive().max(1).optional(),
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

    if (user.role !== "ACCOUNTANT" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only accountants and admins can create purchases" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = CreatePurchaseSchema.parse(body);

    const company = await db.company.findUnique({
      where: { id: validated.companyId },
      include: { accountantLinks: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Company is not active" },
        { status: 400 }
      );
    }

    if (user.role === "ACCOUNTANT") {
      const hasAccess = company.accountantLinks.some(
        (link: { accountantId: string }) => link.accountantId === user.id
      );
      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this company" },
          { status: 403 }
        );
      }
    }

    const taxCredit = await db.creditInventory.findUnique({
      where: { id: validated.taxCreditId },
    });

    if (!taxCredit) {
      return NextResponse.json(
        { error: "Tax credit not found" },
        { status: 404 }
      );
    }

    if (taxCredit.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tax credit is not available" },
        { status: 400 }
      );
    }

    const nominalValueUSD = validated.nominalValueUSD 
      ? new Prisma.Decimal(validated.nominalValueUSD)
      : taxCredit.minBlockUSD;
    const pricePerDollar = validated.pricePerDollar
      ? new Prisma.Decimal(validated.pricePerDollar)
      : taxCredit.pricePerDollar;

    if (nominalValueUSD.greaterThan(taxCredit.availableUSD)) {
      return NextResponse.json(
        { error: "Insufficient credit available" },
        { status: 400 }
      );
    }

    if (nominalValueUSD.lessThan(taxCredit.minBlockUSD)) {
      return NextResponse.json(
        {
          error: `Minimum purchase is ${taxCredit.minBlockUSD.toString()} USD`,
        },
        { status: 400 }
      );
    }

    const totalUSD = nominalValueUSD.mul(pricePerDollar).toDecimalPlaces(2);

    let assignedAccountantId = user.id;
    if (user.role === "ADMIN") {
      const primaryLink = company.accountantLinks.find(
        (link: { accountantId: string }) => link.accountantId
      );
      if (!primaryLink) {
        return NextResponse.json(
          { error: "Company has no linked accountant. ADMIN cannot create purchase without an accountant." },
          { status: 400 }
        );
      }
      assignedAccountantId = primaryLink.accountantId;
    }

    const purchase = await db.purchase.create({
      data: {
        accountantId: assignedAccountantId,
        companyId: validated.companyId,
        taxCreditId: validated.taxCreditId,
        nominalValueUSD,
        pricePerDollar,
        totalUSD,
        status: "PENDING_PAYMENT",
      },
    });

    await writeAudit({
      actorId: user.id,
      actorEmail: user.email!,
      action: "CREATE",
      entity: "PURCHASE",
      entityId: purchase.id,
      companyId: validated.companyId,
      details: {
        taxCreditId: validated.taxCreditId,
        nominalValueUSD,
        pricePerDollar,
        totalUSD,
      },
    });

    return NextResponse.json({ id: purchase.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
