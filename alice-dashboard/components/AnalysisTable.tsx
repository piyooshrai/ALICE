/**
 * Analysis Table Component
 * Clean, minimal table for displaying analysis history
 */

import { formatDateTime, getGradeColor, getDeploymentStatusColor } from '@/lib/utils'

interface Analysis {
  id: string
  grade: string
  quality_score: number
  deployment_status: string
  critical_bugs: number
  high_bugs: number
  analyzed_at: string
}

interface AnalysisTableProps {
  analyses: Analysis[]
  onRowClick?: (analysis: Analysis) => void
}

export default function AnalysisTable({ analyses, onRowClick }: AnalysisTableProps) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Critical
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                High
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {analyses.map((analysis) => (
              <tr
                key={analysis.id}
                onClick={() => onRowClick?.(analysis)}
                className={`transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-background' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {formatDateTime(analysis.analyzed_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="text-lg font-bold"
                    style={{ color: getGradeColor(analysis.grade) }}
                  >
                    {analysis.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {analysis.quality_score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${getDeploymentStatusColor(analysis.deployment_status)}20`,
                      color: getDeploymentStatusColor(analysis.deployment_status),
                    }}
                  >
                    {analysis.deployment_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={analysis.critical_bugs > 0 ? 'text-error font-semibold' : 'text-text-secondary'}>
                    {analysis.critical_bugs}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={analysis.high_bugs > 0 ? 'text-warning font-semibold' : 'text-text-secondary'}>
                    {analysis.high_bugs}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analyses.length === 0 && (
        <div className="px-6 py-12 text-center text-text-secondary">
          No analyses found
        </div>
      )}
    </div>
  )
}
