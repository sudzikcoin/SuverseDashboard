import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { buildSummary } from "@/lib/analytics/summary"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const to = toParam ? new Date(toParam) : new Date()

    const summary = await buildSummary(from, to)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[audit/summary] Error:', error)
    return NextResponse.json(
      { error: 'Failed to build summary' },
      { status: 500 }
    )
  }
}
