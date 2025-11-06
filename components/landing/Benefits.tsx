"use client"
import Section from "@/components/ui/Section"
import { motion } from "framer-motion"

export default function Benefits() {
  const items = [
    { title: "Transparent Pricing", body: "Live discounts, min blocks, fees, all in one card." },
    { title: "Compliance-First", body: "KYC, W-9/ID, IRS transfer docs checklist in-app." },
    { title: "Fast Closing", body: "72-hour holds, purchase orders, auto PDFs." },
  ]
  return (
    <Section>
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((x, i) => (
          <motion.div
            key={x.title}
            className="glass halo rounded-2xl border-white/10 p-6 transition hover:bg-white/10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
          >
            <h3 className="text-white font-semibold text-lg">{x.title}</h3>
            <p className="mt-2 text-su-muted">{x.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
