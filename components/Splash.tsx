"use client"

import React, { useEffect, useState } from "react"

export default function Splash() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches || sessionStorage.getItem("suv_splash_seen") === "true") {
      setDone(true)
      return
    }
    const total = 1600
    const timer = setTimeout(() => {
      sessionStorage.setItem("suv_splash_seen", "true")
      setDone(true)
    }, total)
    return () => clearTimeout(timer)
  }, [])

  if (done) return null

  const letters = [
    { char: "S", side: "left", delay: 0 },
    { char: "u", side: "right", delay: 200 },
    { char: "V", side: "left", delay: 400 },
    { char: "e", side: "right", delay: 600 },
    { char: "r", side: "left", delay: 800 },
    { char: "s", side: "right", delay: 1000 },
    { char: "e", side: "left", delay: 1200 },
  ]

  return (
    <div
      role="status"
      aria-label="Loading SuVerse"
      className="fixed inset-0 z-[9999] bg-[#0B1220] flex items-center justify-center overflow-hidden"
    >
      <div className="suverse-word flex items-center justify-center tracking-wider">
        {letters.map((letter, i) => (
          <span
            key={i}
            className={`suverse-letter suverse-${letter.side}`}
            style={{ animationDelay: `${letter.delay}ms` }}
          >
            {letter.char}
          </span>
        ))}
      </div>

      <div className="splash-flash" aria-hidden="true" />
    </div>
  )
}
