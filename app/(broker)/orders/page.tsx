"use client"

import { useState } from "react"
import Link from "next/link"

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const orders = [
    {
      id: "ORD-2025-001",
      date: "2025-01-14",
      company: "Acme Solar Inc.",
      program: "C48E 2025",
      faceValue: 500000,
      pricePerDollar: 0.92,
      status: "PAID",
    },
    {
      id: "ORD-2025-002",
      date: "2025-01-13",
      company: "GreenTech Manufacturing",
      program: "ITC Solar",
      faceValue: 250000,
      pricePerDollar: 0.88,
      status: "PAYMENT_PENDING",
    },
    {
      id: "ORD-2025-003",
      date: "2025-01-12",
      company: "Solar Solutions LLC",
      program: "PTC Wind",
      faceValue: 750000,
      pricePerDollar: 0.90,
      status: "SETTLED",
    },
    {
      id: "ORD-2025-004",
      date: "2025-01-11",
      company: "Clean Energy Corp",
      program: "45Q Carbon",
      faceValue: 1000000,
      pricePerDollar: 0.85,
      status: "RESERVED",
    },
    {
      id: "ORD-2025-005",
      date: "2025-01-10",
      company: "EV Infrastructure Inc.",
      program: "C48E 2025",
      faceValue: 300000,
      pricePerDollar: 0.92,
      status: "CANCELLED",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "SETTLED":
        return "bg-emerald-500/20 text-emerald-400"
      case "PAYMENT_PENDING":
        return "bg-yellow-500/20 text-yellow-400"
      case "RESERVED":
        return "bg-sky-500/20 text-sky-400"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Orders
        </h1>
        <p className="text-su-muted">Track all purchase orders</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="RESERVED">Reserved</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="SETTLED">Settled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-su-muted mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-2 glass hover:bg-white/10 text-su-text rounded-xl transition font-medium">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-su-muted pb-3">Order ID</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Date</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Company</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Program</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Face Value</th>
                <th className="text-right text-sm font-medium text-su-muted pb-3">Price per $1</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="py-4 text-sm text-su-text font-medium">{order.id}</td>
                  <td className="py-4 text-sm text-su-muted">{order.date}</td>
                  <td className="py-4 text-sm text-su-text">{order.company}</td>
                  <td className="py-4 text-sm text-su-text">{order.program}</td>
                  <td className="py-4 text-sm text-su-text text-right font-medium">
                    {formatCurrency(order.faceValue)}
                  </td>
                  <td className="py-4 text-sm text-su-text text-right">${order.pricePerDollar.toFixed(2)}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <Link
                        href={`/broker/orders/${order.id}`}
                        className="px-3 py-1 text-xs glass hover:text-su-emerald rounded-lg transition"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-su-muted">No orders yet. Orders will appear here once companies start buying credits.</p>
          </div>
        )}
      </div>
    </div>
  )
}
