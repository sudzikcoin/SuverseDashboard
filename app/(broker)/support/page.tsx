"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

export default function SupportPage() {
  const [showToast, setShowToast] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    category: "GENERAL",
    subject: "",
    description: "",
  })

  const tickets = [
    {
      id: "TICK-2025-001",
      subject: "Question about payout schedule",
      status: "ANSWERED",
      priority: "MEDIUM",
      lastUpdated: "2025-01-10",
    },
    {
      id: "TICK-2024-125",
      subject: "Need help with credit pool verification",
      status: "CLOSED",
      priority: "HIGH",
      lastUpdated: "2024-12-28",
    },
    {
      id: "TICK-2024-118",
      subject: "API integration assistance",
      status: "OPEN",
      priority: "LOW",
      lastUpdated: "2024-12-15",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ANSWERED":
      case "CLOSED":
        return "bg-emerald-500/20 text-emerald-400"
      case "OPEN":
        return "bg-yellow-500/20 text-yellow-400"
      case "PENDING":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-400"
      case "MEDIUM":
        return "text-yellow-400"
      case "LOW":
        return "text-su-muted"
      default:
        return "text-su-muted"
    }
  }

  const handleSubmitTicket = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setTicketForm({ category: "GENERAL", subject: "", description: "" })
    }, 2000)
  }

  return (
    <div className="p-4 md:p-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 glass border-emerald-500/30 rounded-xl p-4 animate-in slide-in-from-top">
          <p className="text-emerald-400 font-medium">✓ Ticket created successfully (mock)</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Support
        </h1>
        <p className="text-su-muted">Get help from our team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-su-text mb-6">Create Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-su-muted mb-2">
                  Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
                >
                  <option value="GENERAL">General Question</option>
                  <option value="TECHNICAL">Technical Issue</option>
                  <option value="BILLING">Billing & Payouts</option>
                  <option value="COMPLIANCE">Compliance & Verification</option>
                  <option value="API">API Integration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-su-muted mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-su-muted mb-2">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  rows={6}
                  placeholder="Provide detailed information about your issue..."
                  className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-su-muted mb-2">
                  Attachments (optional)
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-su-emerald/30 transition cursor-pointer">
                  <Upload className="mx-auto mb-2 text-su-muted" size={24} />
                  <p className="text-sm text-su-muted">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-su-muted mt-1">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitTicket}
                  className="px-8 py-3 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-su-text mb-4">Quick Links</h2>
            <div className="space-y-3">
              <a href="#" className="block p-3 glass rounded-xl hover:bg-white/10 transition">
                <p className="text-su-text font-medium text-sm">Documentation</p>
                <p className="text-xs text-su-muted mt-1">API docs and guides</p>
              </a>
              <a href="#" className="block p-3 glass rounded-xl hover:bg-white/10 transition">
                <p className="text-su-text font-medium text-sm">FAQ</p>
                <p className="text-xs text-su-muted mt-1">Common questions</p>
              </a>
              <a href="#" className="block p-3 glass rounded-xl hover:bg-white/10 transition">
                <p className="text-su-text font-medium text-sm">Contact Sales</p>
                <p className="text-xs text-su-muted mt-1">Get in touch with our team</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-su-text mb-6">My Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-su-muted pb-3">Ticket ID</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Subject</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Status</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Priority</th>
                <th className="text-left text-sm font-medium text-su-muted pb-3">Last Updated</th>
                <th className="text-center text-sm font-medium text-su-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="py-4 text-sm text-su-text font-medium">{ticket.id}</td>
                  <td className="py-4 text-sm text-su-text">{ticket.subject}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-su-muted">{ticket.lastUpdated}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <button className="px-3 py-1 text-xs glass hover:text-su-emerald rounded-lg transition">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-su-muted">No tickets yet. Create your first ticket to get support.</p>
          </div>
        )}
      </div>
    </div>
  )
}
