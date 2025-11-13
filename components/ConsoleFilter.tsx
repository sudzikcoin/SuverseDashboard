"use client";

import { useEffect } from "react";

export default function ConsoleFilter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const origError = console.error;
    const origWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const msg = (args?.[0]?.toString?.() || "").toLowerCase();
      if (
        msg.includes("connection interrupted") ||
        msg.includes("http status code: 403") ||
        msg.includes("reown config") ||
        msg.includes("failed to fetch remote project") ||
        msg.includes("chunkerror") ||
        msg.includes("hydration")
      ) return;
      origError(...args);
    };

    console.warn = (...args: any[]) => {
      const msg = (args?.[0]?.toString?.() || "").toLowerCase();
      if (
        msg.includes("walletconnect") ||
        msg.includes("connection interrupted")
      ) return;
      origWarn(...args);
    };

    return () => {
      console.error = origError;
      console.warn = origWarn;
    };
  }, []);

  return null;
}
