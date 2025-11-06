"use client"
import { motion } from "framer-motion"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "danger"
  children: React.ReactNode
  href?: string
}

export default function Button({ variant = "primary", children, href, className = "", ...props }: ButtonProps) {
  const baseClasses = "rounded-2xl font-semibold py-3 px-6 transition"
  
  const variantClasses = {
    primary: "bg-su-emerald hover:bg-su-emerald-700 text-black glow-emerald",
    glass: "glass border-white/20 text-white hover:bg-white/10",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  }
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClasses}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    )
  }
  
  return (
    <motion.button
      className={combinedClasses}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
