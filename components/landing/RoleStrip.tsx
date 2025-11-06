"use client"
import Section from "@/components/ui/Section"
import { motion } from "framer-motion"

export default function RoleStrip() {
  const roles = [
    ["Company (Buyer)", "/register", "Create account"],
    ["Accountant", "/register", "Invite clients"],
    ["Admin", "/login", "Sign in"],
  ]
  return (
    <Section>
      <div className="grid gap-6 sm:grid-cols-3">
        {roles.map(([r, href, cta], i) => (
          <motion.a
            key={r}
            href={href}
            className="glass halo rounded-2xl border-white/10 p-6 transition hover:bg-white/10 block"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-white font-semibold text-lg">{r}</h3>
            <p className="mt-2 text-su-muted">Role-based dashboards and permissions.</p>
            <span className="mt-4 inline-block rounded-full bg-su-emerald text-black px-4 py-2 font-medium text-sm glow-emerald">
              {cta}
            </span>
          </motion.a>
        ))}
      </div>
    </Section>
  )
}
