/**
 * Metric Card Component
 * Minimal card for displaying individual metrics
 */

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  color?: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
}

export default function MetricCard({ label, value, subtext, color, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return ''
    return trend.direction === 'up' ? 'text-success' : trend.direction === 'down' ? 'text-error' : 'text-text-secondary'
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 transition-all duration-200 hover:shadow">
      <div className="text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
        {label}
      </div>

      <div className="flex items-baseline justify-between">
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: color || '#171717' }}
        >
          {value}
        </div>

        {trend && (
          <div className={`text-sm font-medium ${getTrendColor()}`}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {' '}
            {trend.value}
          </div>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-text-secondary mt-2">
          {subtext}
        </div>
      )}
    </div>
  )
}
