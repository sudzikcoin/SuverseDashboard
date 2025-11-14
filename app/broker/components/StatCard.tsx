interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    positive?: boolean
  }
}

export default function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-6 hover:border-su-emerald/30 transition">
      <p className="text-sm text-su-muted mb-2">{title}</p>
      <p className="text-3xl font-bold text-su-text mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-su-muted">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-sm mt-2 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}
