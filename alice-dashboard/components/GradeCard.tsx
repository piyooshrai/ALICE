/**
 * Grade Card Component
 * Clean, minimal display of grade information
 */

import { getGradeColor } from '@/lib/utils'

interface GradeCardProps {
  grade: string
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function GradeCard({ grade, score, label, size = 'md' }: GradeCardProps) {
  const gradeColor = getGradeColor(grade)

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={`bg-surface border border-border rounded-lg ${containerSizeClasses[size]} transition-all duration-200 hover:shadow-lg`}>
      {label && (
        <div className="text-sm font-medium text-text-secondary mb-3 tracking-wide uppercase">
          {label}
        </div>
      )}

      <div className="flex items-baseline space-x-4">
        <div
          className={`${sizeClasses[size]} font-bold tracking-tight`}
          style={{ color: gradeColor }}
        >
          {grade}
        </div>

        <div className="text-text-secondary">
          <div className="text-2xl font-semibold">{score}</div>
          <div className="text-xs">out of 100</div>
        </div>
      </div>
    </div>
  )
}
