"use client";

import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    const msg = (error?.message || "").toLowerCase();
    if (msg.includes("aes/gcm") || msg.includes("ghash tag") || msg.includes("status code: 403")) {
      fetch("/api/auth/repair", { method: "POST" }).finally(() => {
        try { 
          localStorage.clear(); 
          sessionStorage.clear(); 
        } catch {}
        location.replace("/");
      });
    }
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0B1220", color: "#fff", padding: 24 }}>
        <h2>Recovering session…</h2>
      </body>
    </html>
  );
}
