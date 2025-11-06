"use client"
import Section from "@/components/ui/Section"
import { motion } from "framer-motion"

export default function HowItWorks() {
  const steps = [
    ["Browse credits", "Filter by type, vintage, state, price."],
    ["Reserve or buy", "Place a 72-hour hold or pay now via Stripe."],
    ["Close", "Broker package + closing certificate in your inbox."],
  ]
  return (
    <Section>
      <h2 className="text-white text-3xl font-semibold mb-8">How it works</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map(([t, b], i) => (
          <motion.div
            key={t}
            className="glass halo rounded-2xl border-white/10 p-6 transition hover:bg-white/10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-su-emerald text-black font-bold text-lg glow-emerald">
              {i+1}
            </span>
            <h3 className="mt-4 text-white font-semibold">{t}</h3>
            <p className="mt-2 text-su-muted">{b}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
