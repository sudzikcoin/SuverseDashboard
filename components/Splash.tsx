"use client"

import React, { useEffect, useState } from "react"

export default function Splash() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Skip if reduced motion or already seen
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches || sessionStorage.getItem("suv_splash_seen") === "true") {
      setDone(true)
      return
    }
    const total = 2000 // ms (animation + flash)
    const timer = setTimeout(() => {
      sessionStorage.setItem("suv_splash_seen", "true")
      setDone(true)
    }, total)
    return () => clearTimeout(timer)
  }, [])

  if (done) return null

  return (
    <div
      role="status"
      aria-label="Loading SuVerse"
      className="fixed inset-0 z-[9999] bg-[#0B1220] flex items-center justify-center overflow-hidden"
    >
      <svg
        className="w-[70vw] max-w-[720px] h-auto"
        viewBox="0 0 1200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="suv-group">
          <rect className="shape left d0" x="-120" y="20" width="120" height="120" rx="20" />
          <circle className="shape left d1" cx="-60" cy="160" r="40" />
          <polygon className="shape left d2" points="-120,0 -20,0 -70,80" />

          <rect className="shape right d0" x="1200" y="40" width="100" height="100" rx="16" />
          <circle className="shape right d1" cx="1260" cy="160" r="34" />
          <polygon className="shape right d2" points="1200,10 1300,10 1250,90" />
        </g>

        <g className="letters">
          <text x="70"  y="135" className="letter">S</text>
          <text x="200" y="135" className="letter">u</text>
          <text x="325" y="135" className="letter">V</text>
          <text x="460" y="135" className="letter">e</text>
          <text x="580" y="135" className="letter">r</text>
          <text x="660" y="135" className="letter">s</text>
          <text x="760" y="135" className="letter">e</text>
        </g>
      </svg>

      <div className="flash" aria-hidden="true" />
    </div>
  )
}
