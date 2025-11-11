import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const count = await prisma.auditLog.count()
    
    return NextResponse.json({ 
      ok: true,
      auditLogCount: count,
      message: "Audit system is operational"
    })
  } catch (error) {
    console.error("Audit health check failed:", error)
    return NextResponse.json(
      { 
        ok: false, 
        error: "Database connection failed" 
      },
      { status: 500 }
    )
  }
}
