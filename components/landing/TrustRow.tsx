"use client"
import Section from "@/components/ui/Section"
import { motion } from "framer-motion"

export default function TrustRow() {
  const items = ["SOC-style Logs", "Audit Trail", "Email Receipts", "PDF Certificates"]
  return (
    <Section className="py-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {items.map((x, i) => (
          <motion.span
            key={x}
            className="rounded-full glass border-white/10 text-su-muted px-4 py-2 text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            {x}
          </motion.span>
        ))}
      </div>
    </Section>
  )
}
