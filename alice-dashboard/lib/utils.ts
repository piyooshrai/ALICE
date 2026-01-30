/**
 * ALICE Dashboard Utilities
 * Helper functions for formatting and data manipulation
 */

/**
 * Get color for grade
 */
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#059669' // emerald
  if (grade.startsWith('B')) return '#0284C7' // sky blue
  if (grade.startsWith('C')) return '#D97706' // amber
  return '#DC2626' // red
}

/**
 * Get deployment status color
 */
export function getDeploymentStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return '#059669' // success
    case 'CAUTION':
      return '#D97706' // warning
    case 'BLOCKED':
      return '#DC2626' // error
    default:
      return '#737373' // secondary
  }
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return '#DC2626' // error
    case 'HIGH':
      return '#D97706' // warning
    case 'MEDIUM':
      return '#0284C7' // info
    case 'LOW':
      return '#737373' // secondary
    default:
      return '#737373'
  }
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format datetime
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return '↑'
    case 'declining':
      return '↓'
    case 'stable':
      return '→'
    default:
      return '→'
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return '#059669' // success
    case 'declining':
      return '#DC2626' // error
    case 'stable':
      return '#737373' // secondary
    default:
      return '#737373'
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get role level color
 */
export function getRoleLevelColor(roleLevel: string): string {
  switch (roleLevel) {
    case 'Senior':
      return '#059669' // success
    case 'Mid-Level':
      return '#0284C7' // info
    case 'Junior':
      return '#D97706' // warning
    case 'Entry-Level':
      return '#737373' // secondary
    default:
      return '#737373'
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
