import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { verifySignature } from "@/lib/sign"
import { logAudit } from "@/lib/audit"
import { createReadStream, existsSync } from "fs"
import { stat } from "fs/promises"

export const runtime = "nodejs"

async function hasCompanyAccess(userId: string, role: string, companyId: string): Promise<boolean> {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')
    const token = searchParams.get('token')

    let document
    let accessMode: 'authenticated' | 'signed' = 'authenticated'
    let actorId: string | undefined

    if (token) {
      const payload = verifySignature(token)
      if (!payload || !payload.docId) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 })
      }

      document = await prisma.document.findUnique({
        where: { 
          id: payload.docId,
        },
      })

      if (!document || document.deletedAt || document.companyId !== payload.companyId) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      accessMode = 'signed'
      
      await logAudit('doc_open', undefined, document.companyId, { 
        via: 'signed',
        docId: document.id,
        filename: document.filename,
      })
    } else if (docId) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { role, id: userId } = session.user as { role: string; id: string }
      actorId = userId

      document = await prisma.document.findUnique({
        where: { 
          id: docId,
        },
      })

      if (!document || document.deletedAt) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      const hasAccess = await hasCompanyAccess(userId, role, document.companyId)
      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      await logAudit('doc_open', userId, document.companyId, { 
        via: 'authenticated',
        docId: document.id,
        filename: document.filename,
      })
    } else {
      return NextResponse.json({ error: "Missing id or token parameter" }, { status: 400 })
    }

    if (!existsSync(document.storagePath)) {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
    }

    const fileStat = await stat(document.storagePath)
    const stream = createReadStream(document.storagePath)

    const readable = new ReadableStream({
      async start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk))
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', (error) => {
          console.error('Stream error:', error)
          controller.error(error)
        })
      },
      cancel() {
        stream.destroy()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Length': fileStat.size.toString(),
        'Content-Disposition': `inline; filename="${document.filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error("Error streaming file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
