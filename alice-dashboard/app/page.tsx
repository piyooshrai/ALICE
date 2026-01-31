/**
 * ALICE Dashboard - Main Page
 * Overview of all analyses, grades, and system metrics
 */

'use client'

import { useEffect, useState } from 'react'
import { api, DashboardStats } from '@/lib/api-client'
import MetricCard from '@/components/MetricCard'
import AnalysisTable from '@/components/AnalysisTable'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await api.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError('Failed to load dashboard statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-text-secondary">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-error">{error || 'Failed to load data'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">
          Dashboard Overview
        </h2>
        <p className="text-text-secondary mt-2">
          System-wide code quality metrics and analysis results
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Analyses"
          value={stats.total_analyses}
          subtext="All time"
        />

        <MetricCard
          label="Average Score"
          value={Math.round(stats.average_score)}
          subtext="Across all analyses"
          color={stats.average_score >= 75 ? '#059669' : stats.average_score >= 60 ? '#D97706' : '#DC2626'}
        />

        <MetricCard
          label="Active Developers"
          value={stats.total_developers}
          subtext="Tracked in system"
        />

        <MetricCard
          label="Deployment Blocked"
          value={stats.deployment_blocked}
          subtext="Critical issues found"
          color="#DC2626"
        />
      </div>

      {/* Grade Distribution */}
      <div className="bg-surface border border-border rounded-lg p-8">
        <h3 className="text-sm font-medium text-text-secondary mb-6 tracking-wide uppercase">
          Grade Distribution
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['A+', 'A', 'A-', 'B+', 'B'].map(grade => (
            <div key={grade} className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">
                {stats.grade_distribution[grade] || 0}
              </div>
              <div className="text-sm text-text-secondary">Grade {grade}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['B-', 'C+', 'C', 'C-', 'D'].map(grade => (
              <div key={grade} className="text-center">
                <div className="text-3xl font-bold text-text-primary mb-1">
                  {stats.grade_distribution[grade] || 0}
                </div>
                <div className="text-sm text-text-secondary">Grade {grade}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-text-primary">
            Recent Analyses
          </h3>
          <a
            href="/analytics"
            className="text-sm font-medium text-info hover:text-info/80 transition-colors duration-200"
          >
            View all
          </a>
        </div>

        <AnalysisTable
          analyses={stats.recent_analyses.map(a => ({
            id: a.id,
            grade: a.grade,
            quality_score: a.quality_score,
            deployment_status: a.deployment_status,
            critical_bugs: 0, // Will be populated from full data
            high_bugs: 0,
            analyzed_at: a.analyzed_at,
          }))}
          onRowClick={(analysis) => {
            window.location.href = `/analyses/${analysis.id}`
          }}
        />
      </div>
    </div>
  )
}
