import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "REJECTED"

interface VerificationBadgeProps {
  status: VerificationStatus
  note?: string | null
  className?: string
}

export default function VerificationBadge({
  status,
  note,
  className = "",
}: VerificationBadgeProps) {
  const config = {
    VERIFIED: {
      label: "Verified",
      icon: CheckCircle2,
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      textClass: "text-emerald-400",
    },
    UNVERIFIED: {
      label: "Unverified",
      icon: Clock,
      bgClass: "bg-yellow-500/10",
      borderClass: "border-yellow-500/30",
      textClass: "text-yellow-400",
    },
    REJECTED: {
      label: "Rejected",
      icon: AlertCircle,
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/30",
      textClass: "text-red-400",
    },
  }

  const { label, icon: Icon, bgClass, borderClass, textClass } = config[status]

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${bgClass} ${borderClass}`}
        title={note || undefined}
      >
        <Icon className={`h-3.5 w-3.5 ${textClass}`} />
        <span className={`text-xs font-medium ${textClass}`}>{label}</span>
      </div>
      {note && (
        <p className="text-xs text-gray-400 italic max-w-xs">{note}</p>
      )}
    </div>
  )
}
