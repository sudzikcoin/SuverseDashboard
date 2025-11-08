import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can link accountants to companies" },
        { status: 403 }
      )
    }

    const { accountantId, companyId } = await req.json()
    
    if (!accountantId || !companyId) {
      return NextResponse.json(
        { error: "accountantId and companyId are required" },
        { status: 400 }
      )
    }

    const accountant = await prisma.user.findUnique({
      where: { id: accountantId }
    })

    if (!accountant || accountant.role !== "ACCOUNTANT") {
      return NextResponse.json(
        { error: "Invalid accountant" },
        { status: 400 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const link = await prisma.accountantClient.upsert({
      where: {
        accountantId_companyId: {
          accountantId,
          companyId
        }
      },
      update: {},
      create: {
        accountantId,
        companyId
      }
    })

    return NextResponse.json({ success: true, link })
  } catch (error: any) {
    console.error("Link creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to link accountant to company" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can unlink accountants from companies" },
        { status: 403 }
      )
    }

    const { accountantId, companyId } = await req.json()
    
    if (!accountantId || !companyId) {
      return NextResponse.json(
        { error: "accountantId and companyId are required" },
        { status: 400 }
      )
    }

    await prisma.accountantClient.delete({
      where: {
        accountantId_companyId: {
          accountantId,
          companyId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unlink error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to unlink accountant from company" },
      { status: 500 }
    )
  }
}
