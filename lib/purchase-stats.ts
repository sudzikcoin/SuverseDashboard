import { prisma } from "@/lib/db"
import { COMPLETED_PURCHASE_STATUSES } from "@/lib/purchase-statuses"

export interface PurchaseOrder {
  id: string
  amountUSD: number | null
  totalUSD: number | null
  status: string
  pricePerDollar: number | null
  createdAt: Date
  inventory: {
    id: string
    creditType: string
    taxYear: number
    brokerName: string | null
  }
}

export interface PurchaseStats {
  orders: PurchaseOrder[]
  totalCount: number
  totalValue: number
  completedCount: number
}

export async function getCompanyPurchaseStats(companyId: string): Promise<PurchaseStats> {
  const orders = await prisma.purchaseOrder.findMany({
    where: {
      companyId,
      status: {
        in: [...COMPLETED_PURCHASE_STATUSES],
      },
    },
    include: {
      inventory: {
        select: {
          id: true,
          creditType: true,
          taxYear: true,
          brokerName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalCount = orders.length

  const totalValue = orders.reduce((sum, order) => {
    const value = order.amountUSD ? Number(order.amountUSD) : (order.totalUSD ? Number(order.totalUSD) : 0)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)

  const completedCount = orders.filter(order => 
    COMPLETED_PURCHASE_STATUSES.includes(order.status as any)
  ).length

  return {
    orders: orders as PurchaseOrder[],
    totalCount,
    totalValue,
    completedCount,
  }
}
