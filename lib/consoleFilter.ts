"use client";

if (typeof window !== "undefined") {
  const origError = console.error;
  console.error = (...args: any[]) => {
    const t = (args?.[0]?.toString?.() || "").toLowerCase();
    if (
      t.includes("connection interrupted while trying to subscribe") ||
      t.includes("walletconnect is not configured") ||
      t.includes("http status code: 403") ||
      t.includes("chunkerror") ||
      t.includes("chunk") ||
      t.includes("hydration")
    ) return;
    origError(...args);
  };
}

export {};
