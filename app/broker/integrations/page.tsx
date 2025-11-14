"use client"

import { useState } from "react"
import { Copy, Plus, Trash2 } from "lucide-react"

export default function IntegrationsPage() {
  const [showToast, setShowToast] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEvents, setWebhookEvents] = useState<string[]>([])

  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      createdAt: "2024-12-01",
      lastUsed: "2025-01-14",
      status: "ACTIVE",
    },
    {
      id: "2",
      name: "Development API Key",
      createdAt: "2024-11-15",
      lastUsed: "2025-01-10",
      status: "ACTIVE",
    },
  ]

  const availableEvents = [
    { id: "order.created", label: "Order Created" },
    { id: "order.paid", label: "Order Paid" },
    { id: "order.settled", label: "Order Settled" },
    { id: "order.cancelled", label: "Order Cancelled" },
    { id: "payout.scheduled", label: "Payout Scheduled" },
    { id: "payout.completed", label: "Payout Completed" },
  ]

  const toggleEvent = (eventId: string) => {
    setWebhookEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    )
  }

  const handleCreateKey = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleSaveWebhook = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="p-4 md:p-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 glass border-emerald-500/30 rounded-xl p-4 animate-in slide-in-from-top">
          <p className="text-emerald-400 font-medium">✓ Saved successfully (mock)</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          API & Integrations
        </h1>
        <p className="text-su-muted">Manage API keys and webhook endpoints</p>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-su-text">API Keys</h2>
            <button
              onClick={handleCreateKey}
              className="flex items-center gap-2 px-4 py-2 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium"
            >
              <Plus size={18} />
              Create API Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-su-text font-medium">{key.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-su-muted">
                    <span>Created: {key.createdAt}</span>
                    <span>Last used: {key.lastUsed}</span>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                      {key.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:text-su-emerald transition" title="Copy">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 hover:text-red-400 transition" title="Revoke">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {apiKeys.length === 0 && (
            <div className="text-center py-8">
              <p className="text-su-muted">No API keys yet. Create your first key to get started.</p>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Webhooks</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Endpoint URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/suverse"
                className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Events
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableEvents.map((event) => (
                  <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="w-4 h-4 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
                    />
                    <span className="text-sm text-su-text">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Secret Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="whsec_mock_secret_token_12345678"
                  readOnly
                  className="flex-1 px-4 py-2 bg-su-base/50 border border-white/10 rounded-xl text-su-muted font-mono text-sm cursor-not-allowed"
                />
                <button className="p-2 glass hover:text-su-emerald rounded-xl transition" title="Copy">
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-su-muted mt-2">
                Use this secret to verify webhook signatures
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveWebhook}
                className="px-6 py-3 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium"
              >
                Save Webhook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
