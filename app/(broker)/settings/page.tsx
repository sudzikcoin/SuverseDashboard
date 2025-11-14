"use client"

import { useState } from "react"

export default function SettingsPage() {
  const [showToast, setShowToast] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState("USDC")
  const [profile, setProfile] = useState({
    name: "SuVerse Capital LLC",
    email: "admin@suversecapital.com",
    timezone: "America/New_York",
  })

  const [payoutSettings, setPayoutSettings] = useState({
    usdcAddress: "0x1234567890abcdef1234567890abcdef12345678",
    bankName: "Chase Bank",
    accountNumber: "****1234",
    routingNumber: "021000021",
  })

  const [notifications, setNotifications] = useState({
    newOrders: true,
    paymentReceived: true,
    payoutSent: true,
    complianceUpdates: false,
  })

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="p-4 md:p-8">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 glass border-emerald-500/30 rounded-xl p-4 animate-in slide-in-from-top">
          <p className="text-emerald-400 font-medium">✓ Settings saved successfully (mock)</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-su-text mb-2">
          Settings
        </h1>
        <p className="text-su-muted">Manage your broker account preferences</p>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Broker Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Timezone
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Payout Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-su-muted mb-2">
                Preferred Payout Method
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
              >
                <option value="USDC">USDC (Crypto)</option>
                <option value="WIRE">Wire Transfer</option>
                <option value="ACH">ACH</option>
              </select>
            </div>

            {payoutMethod === "USDC" && (
              <div>
                <label className="block text-sm font-medium text-su-muted mb-2">
                  USDC Wallet Address (Base Network)
                </label>
                <input
                  type="text"
                  value={payoutSettings.usdcAddress}
                  onChange={(e) => setPayoutSettings({ ...payoutSettings, usdcAddress: e.target.value })}
                  className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none font-mono text-sm"
                  placeholder="0x..."
                />
                <p className="text-xs text-su-muted mt-2">
                  Ensure this is a valid USDC address on Base network
                </p>
              </div>
            )}

            {(payoutMethod === "WIRE" || payoutMethod === "ACH") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-su-muted mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={payoutSettings.bankName}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, bankName: e.target.value })}
                    className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-su-muted mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={payoutSettings.accountNumber}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-su-muted mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={payoutSettings.routingNumber}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, routingNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-su-base border border-white/10 rounded-xl text-su-text focus:border-su-emerald focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-su-text mb-6">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newOrders}
                onChange={(e) => setNotifications({ ...notifications, newOrders: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
              />
              <div>
                <p className="text-su-text font-medium">New order notifications</p>
                <p className="text-xs text-su-muted">Get notified when a company places an order</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.paymentReceived}
                onChange={(e) => setNotifications({ ...notifications, paymentReceived: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
              />
              <div>
                <p className="text-su-text font-medium">Payment received</p>
                <p className="text-xs text-su-muted">Get notified when payment is confirmed</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.payoutSent}
                onChange={(e) => setNotifications({ ...notifications, payoutSent: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
              />
              <div>
                <p className="text-su-text font-medium">Payout sent</p>
                <p className="text-xs text-su-muted">Get notified when your payout is processed</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.complianceUpdates}
                onChange={(e) => setNotifications({ ...notifications, complianceUpdates: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-su-base text-su-emerald focus:ring-su-emerald"
              />
              <div>
                <p className="text-su-text font-medium">Compliance updates</p>
                <p className="text-xs text-su-muted">Get notified about compliance and verification changes</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-su-emerald hover:bg-su-emerald/90 text-white rounded-xl transition font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
