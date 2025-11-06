"use client"
import { useScroll, useTransform, motion } from "framer-motion"
import Button from "@/components/ui/Button"

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [-10, 30])
  
  return (
    <section className="relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(52,211,153,0.25),transparent)]"
        style={{ y }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
        <span className="inline-flex items-center gap-2 rounded-full glass border-white/10 px-3 py-1 text-su-emerald text-xs mb-6">
          Broker-Verified · Role-Based · Stripe Ready
        </span>
        <h1 className="mt-6 text-5xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-200 bg-clip-text text-transparent">
          SuVerse
        </h1>
        <p className="mt-2 text-3xl text-su-text">Tax Credit Dashboard</p>
        <p className="mt-6 text-su-muted max-w-3xl mx-auto text-lg">
          Discover, reserve, and purchase transferable tax credits (ITC, PTC, 45Q, 48C, 48E) with transparent pricing and a broker-verified closing flow.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" href="/register">Sign Up</Button>
          <Button variant="glass" href="/login">Enter Dashboard</Button>
        </div>
        <div className="mt-4">
          <a href="/marketplace" className="text-su-muted hover:text-su-emerald transition text-sm">
            See Inventory →
          </a>
        </div>
      </div>
    </section>
  )
}
