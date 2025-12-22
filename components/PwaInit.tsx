"use client"

import { useEffect } from "react"

export default function PwaInit() {
  useEffect(() => {
    // Only register service worker in browser and production-like environments
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after page load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered:", registration.scope)
          })
          .catch((error) => {
            console.log("[PWA] Service Worker registration failed:", error)
          })
      })
    }
  }, [])

  return null
}
