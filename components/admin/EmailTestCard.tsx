"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function EmailTestCard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string; id?: string } | null>(null);

  const handleTest = async () => {
    if (!email) {
      setResult({ ok: false, error: "Email required" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name: "Test User" }),
      });

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ ok: false, error: e?.message || "Failed to send test email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-su-card border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Email Test</h2>
      <p className="text-su-muted mb-4">Send a test welcome email to verify Resend integration</p>
      
      <div className="flex gap-3 mb-4">
        <input
          type="email"
          placeholder="recipient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-su-muted focus:outline-none focus:border-su-emerald"
        />
        <Button
          onClick={handleTest}
          disabled={loading || !email}
          className="bg-su-emerald hover:bg-su-emerald/90"
        >
          {loading ? "Sending..." : "Send Test"}
        </Button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.ok
              ? "bg-su-emerald/10 border border-su-emerald/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          {result.ok ? (
            <div>
              <p className="text-su-emerald font-medium">✓ Email sent successfully!</p>
              {result.id && <p className="text-sm text-su-muted mt-1">ID: {result.id}</p>}
            </div>
          ) : (
            <div>
              <p className="text-red-400 font-medium">✗ Failed to send email</p>
              {result.error && <p className="text-sm text-red-300 mt-1">{result.error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
