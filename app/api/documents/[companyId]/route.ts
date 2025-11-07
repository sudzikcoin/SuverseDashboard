import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function GET(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId: params.companyId,
        },
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this company" },
          { status: 403 }
        )
      }
    }

    const documents = await prisma.document.findMany({
      where: { companyId: params.companyId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId: params.companyId,
        },
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this company" },
          { status: 403 }
        )
      }
    }

    const formData = await req.formData()
    const files = formData.getAll("file") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), "uploads", params.companyId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedDocuments = []

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only PDF, PNG, and JPG are allowed.` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max size is 10MB.` },
          { status: 400 }
        )
      }

      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filename = `${timestamp}-${safeName}`
      const filepath = join(uploadDir, filename)
      const storagePath = `/uploads/${params.companyId}/${filename}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      const document = await prisma.document.create({
        data: {
          companyId: params.companyId,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storagePath,
          uploadedById: session.user.id,
        },
      })

      uploadedDocuments.push(document)
    }

    return NextResponse.json({ documents: uploadedDocuments })
  } catch (error) {
    console.error("Error uploading documents:", error)
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId: params.companyId,
        },
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this company" },
          { status: 403 }
        )
      }
    }

    const { searchParams } = new URL(req.url)
    const docId = searchParams.get("id")

    if (!docId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      )
    }

    const document = await prisma.document.findFirst({
      where: {
        id: docId,
        companyId: params.companyId,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or does not belong to this company" },
        { status: 404 }
      )
    }

    const filepath = join(process.cwd(), document.storagePath.replace(/^\//, ""))
    
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    await prisma.document.delete({
      where: { id: docId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
