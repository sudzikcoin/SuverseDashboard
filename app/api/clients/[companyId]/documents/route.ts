import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
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

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
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
    const documents = await prisma.document.findMany({
      where: { companyId: params.companyId },
      orderBy: { createdAt: "desc" },
    })

    const files = documents.map((doc) => ({
      id: doc.id,
      name: doc.filename,
      url: `/api/clients/${params.companyId}/documents/${encodeURIComponent(doc.filename)}`,
      size: doc.sizeBytes,
      mime: doc.mimeType,
      createdAt: doc.createdAt.toISOString(),
      uploadedById: doc.uploadedById,
    }))

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing documents:", error)
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
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
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, PNG, and JPG files are allowed" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      )
    }

    const dirPath = join(process.cwd(), "uploads", params.companyId)
    await mkdir(dirPath, { recursive: true })

    let filename = file.name
    
    if (/[\x00-\x1f\x7f-\x9f]/.test(filename)) {
      return NextResponse.json(
        { error: "Filename contains invalid control characters" },
        { status: 400 }
      )
    }
    
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
    
    const normalizedFilename = normalize(filename)
    const baseFilename = basename(normalizedFilename)
    
    if (baseFilename !== normalizedFilename || baseFilename.includes("..")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      )
    }
    
    filename = baseFilename
    let filePath = join(dirPath, filename)
    let counter = 1

    while (existsSync(filePath)) {
      const parts = filename.split(".")
      const ext = parts.pop()
      const base = parts.join(".")
      filename = `${base}-${counter}.${ext}`
      filePath = join(dirPath, filename)
      counter++
    }

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const document = await prisma.document.create({
      data: {
        companyId: params.companyId,
        filename: filename,
        mimeType: file.type,
        sizeBytes: file.size,
        storagePath: `uploads/${params.companyId}/${filename}`,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      id: document.id,
      name: filename,
      url: `/api/clients/${params.companyId}/documents/${encodeURIComponent(filename)}`,
      size: file.size,
      mime: file.type,
      createdAt: document.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}
