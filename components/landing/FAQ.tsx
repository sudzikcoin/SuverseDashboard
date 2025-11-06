"use client"
import Section from "@/components/ui/Section"
import { motion } from "framer-motion"

export default function FAQ() {
  const items = [
    ["Can I test without Stripe?", "Yes — test mode creates demo orders without charge."],
    ["Which credits are supported?", "ITC, PTC, 45Q, 48C, 48E (demo set)."],
    ["How do holds work?", "A 72-hour reserved quantity reduces available inventory."],
    ["Do you support accountants?", "Yes, invite clients and manage purchases."],
    ["Can I export data?", "CSV export for inventory and purchases."],
  ]
  return (
    <Section>
      <h2 className="text-white text-3xl font-semibold mb-8">FAQ</h2>
      <div className="space-y-4 max-w-3xl mx-auto">
        {items.map(([q, a], i) => (
          <motion.details
            key={q}
            className="glass halo rounded-2xl border-white/10 p-5 transition hover:bg-white/10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
          >
            <summary className="cursor-pointer text-white font-medium">{q}</summary>
            <p className="mt-2 text-su-muted">{a}</p>
          </motion.details>
        ))}
      </div>
    </Section>
  )
}
