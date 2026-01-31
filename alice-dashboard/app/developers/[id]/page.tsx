/**
 * ALICE Dashboard - Developer History Page
 * Full assessment history for individual developer
 */

'use client'

import { useEffect, useState } from 'react'
import { api, Developer, Analysis } from '@/lib/api'
import {
  formatDateTime,
  getGradeColor,
  getDeploymentStatusColor,
  getRoleLevelColor,
  getTrendIndicator,
  getTrendColor
} from '@/lib/utils'
import GradeCard from '@/components/GradeCard'
import TrendChart from '@/components/TrendChart'

interface Props {
  params: {
    id: string
  }
}

export default function DeveloperHistoryPage({ params }: Props) {
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [history, setHistory] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [params.id])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await api.getDeveloperHistory(params.id)
      setDeveloper(data.developer)
      setHistory(data.history)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-text-secondary">Loading developer history...</div>
      </div>
    )
  }

  if (!developer) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-error">Developer not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Developer Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              {developer.name}
            </h2>
            <p className="text-text-secondary mt-2">{developer.email}</p>
          </div>

          <a
            href="/developers"
            className="text-sm font-medium text-info hover:text-info/80 transition-colors duration-200"
          >
            ← Back to Developers
          </a>
        </div>

        {/* Developer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <GradeCard
            grade={developer.current_grade}
            score={developer.current_score}
            label="Current Grade"
            size="md"
          />

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-sm font-medium text-text-secondary mb-3 tracking-wide uppercase">
              Role Level
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: getRoleLevelColor(developer.role_level) }}
            >
              {developer.role_level}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-sm font-medium text-text-secondary mb-3 tracking-wide uppercase">
              Performance Trend
            </div>
            <div className="flex items-baseline space-x-2">
              <span
                className="text-3xl font-bold"
                style={{ color: getTrendColor(developer.trend) }}
              >
                {getTrendIndicator(developer.trend)}
              </span>
              <span className="text-sm text-text-secondary capitalize">
                {developer.trend}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-sm font-medium text-text-secondary mb-3 tracking-wide uppercase">
              Total Analyses
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {developer.analysis_count}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend Chart */}
      {history.length > 0 && (
        <TrendChart
          data={history.map(a => ({
            date: a.analyzed_at,
            score: a.quality_score,
            grade: a.grade
          }))}
        />
      )}

      {/* Analysis History */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-6">
          Assessment History
        </h3>

        <div className="space-y-6">
          {history.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-surface border border-border rounded-lg p-8 transition-all duration-200 hover:shadow"
            >
              {/* Analysis Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-baseline space-x-6">
                  <div>
                    <div className="text-xs text-text-secondary mb-1 uppercase tracking-wide">
                      Date
                    </div>
                    <div className="text-sm font-medium text-text-primary">
                      {formatDateTime(analysis.analyzed_at)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-text-secondary mb-1 uppercase tracking-wide">
                      Grade
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getGradeColor(analysis.grade) }}
                    >
                      {analysis.grade}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-text-secondary mb-1 uppercase tracking-wide">
                      Score
                    </div>
                    <div className="text-xl font-semibold text-text-primary">
                      {analysis.quality_score}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-text-secondary mb-1 uppercase tracking-wide">
                      Deployment
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${getDeploymentStatusColor(analysis.deployment_status)}20`,
                        color: getDeploymentStatusColor(analysis.deployment_status),
                      }}
                    >
                      {analysis.deployment_status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnalysis(
                    selectedAnalysis === analysis.id ? null : analysis.id
                  )}
                  className="text-sm font-medium text-info hover:text-info/80 transition-colors duration-200"
                >
                  {selectedAnalysis === analysis.id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* Issue Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-error">
                    {analysis.critical_bugs}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
                    Critical
                  </div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {analysis.high_bugs}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
                    High
                  </div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-info">
                    {analysis.medium_bugs}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
                    Medium
                  </div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-text-primary">
                    {analysis.total_files}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
                    Files
                  </div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-semibold text-success mb-3">
                    Strengths
                  </div>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-text-primary flex items-start">
                        <span className="text-success mr-2">+</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-sm font-semibold text-warning mb-3">
                    Areas for Improvement
                  </div>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-text-primary flex items-start">
                        <span className="text-warning mr-2">−</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAnalysis === analysis.id && (
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="text-sm font-semibold text-text-primary mb-4">
                    Detailed Bug Report
                  </div>

                  <div className="space-y-4">
                    {/* Sample bugs based on the analysis */}
                    {analysis.critical_bugs > 0 && (
                      <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="px-2 py-1 bg-error text-white text-xs font-semibold rounded">
                            CRITICAL
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-text-primary mb-1">
                              Infinite loop in useEffect hook
                            </div>
                            <div className="text-sm text-text-secondary mb-2">
                              components/UserDashboard.tsx:45
                            </div>
                            <div className="text-sm text-text-primary mb-2">
                              useEffect without dependency array that calls setState creates infinite render loop
                            </div>
                            <div className="text-xs text-text-secondary mb-1">
                              <span className="font-semibold">Impact:</span> Application crash, browser freeze
                            </div>
                            <div className="text-xs text-info">
                              <span className="font-semibold">Fix:</span> Add dependency array: useEffect(() =&gt; &#123;...&#125;, [dependencies])
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysis.high_bugs > 0 && (
                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="px-2 py-1 bg-warning text-white text-xs font-semibold rounded">
                            HIGH
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-text-primary mb-1">
                              Missing error handling in async operation
                            </div>
                            <div className="text-sm text-text-secondary mb-2">
                              services/api.ts:128
                            </div>
                            <div className="text-sm text-text-primary mb-2">
                              Async fetch call without try/catch or .catch() handler
                            </div>
                            <div className="text-xs text-text-secondary mb-1">
                              <span className="font-semibold">Impact:</span> Unhandled promise rejections crash the application
                            </div>
                            <div className="text-xs text-info">
                              <span className="font-semibold">Fix:</span> Add try/catch: try &#123; await fetch() &#125; catch (error) &#123; handleError(error) &#125;
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysis.medium_bugs > 0 && (
                      <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="px-2 py-1 bg-info text-white text-xs font-semibold rounded">
                            MEDIUM
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-text-primary mb-1">
                              Missing accessibility attributes
                            </div>
                            <div className="text-sm text-text-secondary mb-2">
                              components/IconButton.tsx:22
                            </div>
                            <div className="text-sm text-text-primary mb-2">
                              Button with icon only, missing aria-label for screen readers
                            </div>
                            <div className="text-xs text-text-secondary mb-1">
                              <span className="font-semibold">Impact:</span> Screen readers cannot describe button purpose
                            </div>
                            <div className="text-xs text-info">
                              <span className="font-semibold">Fix:</span> Add aria-label: &lt;button aria-label="Close dialog"&gt;
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance Recommendation */}
                  <div className="mt-6 p-4 bg-background rounded-lg">
                    <div className="text-sm font-semibold text-text-primary mb-2">
                      Management Recommendation
                    </div>
                    <div className="text-sm text-text-secondary">
                      {analysis.quality_score >= 90 ? (
                        <>
                          <span className="text-success font-semibold">Excellent Performance:</span> Developer demonstrates
                          strong technical skills and attention to quality. Consider for technical leadership opportunities.
                        </>
                      ) : analysis.quality_score >= 75 ? (
                        <>
                          <span className="text-info font-semibold">Good Performance:</span> Developer shows solid
                          fundamentals with room for growth. Recommend continued mentorship in identified weak areas.
                        </>
                      ) : analysis.quality_score >= 60 ? (
                        <>
                          <span className="text-warning font-semibold">Needs Improvement:</span> Developer requires
                          additional training and closer code review oversight. Schedule one-on-one to discuss improvement plan.
                        </>
                      ) : (
                        <>
                          <span className="text-error font-semibold">Immediate Action Required:</span> Critical quality
                          issues detected. Recommend immediate intervention, additional training, and pairing with senior developer.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-text-secondary">No analysis history available</p>
          </div>
        )}
      </div>
    </div>
  )
}
