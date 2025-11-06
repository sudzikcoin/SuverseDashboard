"use client"
import { motion } from "framer-motion"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <motion.section
      className={`mx-auto max-w-6xl px-4 py-16 lg:py-24 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  )
}
