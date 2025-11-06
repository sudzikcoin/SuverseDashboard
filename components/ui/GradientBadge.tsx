interface GradientBadgeProps {
  children: React.ReactNode
  variant?: "success" | "warning" | "info"
}

export default function GradientBadge({ children, variant = "success" }: GradientBadgeProps) {
  const variantClasses = {
    success: "bg-gradient-to-r from-emerald-500 to-emerald-400 text-black",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black",
    info: "bg-gradient-to-r from-sky-500 to-sky-400 text-black"
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} glow-emerald`}>
      {children}
    </span>
  )
}
