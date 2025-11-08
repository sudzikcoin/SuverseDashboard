import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { readFile, unlink } from "fs/promises"
import { join, normalize, basename } from "path"
import { existsSync } from "fs"

async function checkAccess(userId: string, role: string, companyId: string): Promise<boolean> {
  if (role === "ADMIN") return true
  
  if (role === "ACCOUNTANT") {
    const link = await prisma.accountantClient.findFirst({
      where: {
        accountantId: userId,
        companyId: companyId,
      },
    })
    return !!link
  }
  
  if (role === "COMPANY") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    })
    return user?.companyId === companyId
  }
  
  return false
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop()
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  }
  return mimeTypes[ext || ""] || "application/octet-stream"
}

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; name: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasAccess = await checkAccess(session.user.id, session.user.role, params.companyId)
  
  if (!hasAccess) {
    return NextResponse.json(
      {
        error: "ACCESS_DENIED",
        message: "You do not have access to this company.",
      },
      { status: 403 }
    )
  }

  try {
    const filename = decodeURIComponent(params.name)
    
    if (/[\x00-\x1f\x7f-\x9f]/.test(filename)) {
      return NextResponse.json(
        { error: "Filename contains invalid control characters" },
        { status: 400 }
      )
    }
    
    const normalizedFilename = normalize(filename)
    const baseFilename = basename(normalizedFilename)
    
    if (baseFilename !== normalizedFilename || baseFilename.includes("..")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      )
    }
    
    const filePath = join(process.cwd(), "uploads", params.companyId, baseFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const mimeType = getMimeType(filename)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error streaming file:", error)
    return NextResponse.json(
      { error: "Failed to stream file" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string; name: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasAccess = await checkAccess(session.user.id, session.user.role, params.companyId)
  
  if (!hasAccess) {
    return NextResponse.json(
      {
        error: "ACCESS_DENIED",
        message: "You do not have access to this company.",
      },
      { status: 403 }
    )
  }

  try {
    const filename = decodeURIComponent(params.name)
    
    if (/[\x00-\x1f\x7f-\x9f]/.test(filename)) {
      return NextResponse.json(
        { error: "Filename contains invalid control characters" },
        { status: 400 }
      )
    }
    
    const normalizedFilename = normalize(filename)
    const baseFilename = basename(normalizedFilename)
    
    if (baseFilename !== normalizedFilename || baseFilename.includes("..")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      )
    }
    
    const filePath = join(process.cwd(), "uploads", params.companyId, baseFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    await unlink(filePath)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
