/**
 * ALICE Dashboard - Developers Page
 * View all developers with grades and performance tracking
 */

'use client'

import { useEffect, useState } from 'react'
import { api, Developer } from '@/lib/api-client'
import { getGradeColor, getRoleLevelColor, getTrendIndicator, getTrendColor } from '@/lib/utils'

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'grade'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadDevelopers()
  }, [sortBy, sortOrder])

  const loadDevelopers = async () => {
    try {
      setLoading(true)
      let data = await api.getDevelopers()

      // Client-side sorting
      data = data.sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        } else if (sortBy === 'score') {
          return sortOrder === 'asc'
            ? a.current_score - b.current_score
            : b.current_score - a.current_score
        } else { // grade
          return sortOrder === 'asc'
            ? a.current_grade.localeCompare(b.current_grade)
            : b.current_grade.localeCompare(a.current_grade)
        }
      })

      setDevelopers(data)
    } catch (err) {
      setError('Failed to load developers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-text-secondary">Loading developers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Developers
          </h2>
          <p className="text-text-secondary mt-2">
            Performance tracking and grade history for all developers
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <label className="text-sm text-text-secondary">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-info"
          >
            <option value="score">Score</option>
            <option value="name">Name</option>
            <option value="grade">Grade</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-background transition-colors duration-200"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
            Total Developers
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {developers.length}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
            Senior Level
          </div>
          <div className="text-3xl font-bold text-success">
            {developers.filter(d => d.role_level === 'Senior').length}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
            Mid Level
          </div>
          <div className="text-3xl font-bold text-info">
            {developers.filter(d => d.role_level === 'Mid-Level').length}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
            Junior/Entry
          </div>
          <div className="text-3xl font-bold text-text-secondary">
            {developers.filter(d => ['Junior', 'Entry-Level'].includes(d.role_level)).length}
          </div>
        </div>
      </div>

      {/* Developers Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Developer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Role Level
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Analyses
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {developers.map((developer) => (
              <tr
                key={developer.id}
                className="transition-colors duration-200 hover:bg-background"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-text-primary">{developer.name}</div>
                    <div className="text-sm text-text-secondary">{developer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getGradeColor(developer.current_grade || 'D') }}
                  >
                    {developer.current_grade || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-semibold text-text-primary">
                    {developer.current_score || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${getRoleLevelColor(developer.role_level)}20`,
                      color: getRoleLevelColor(developer.role_level),
                    }}
                  >
                    {developer.role_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: getTrendColor(developer.trend) }}
                  >
                    {getTrendIndicator(developer.trend)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-text-secondary">
                    {developer.analysis_count}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`/developers/${developer.id}`}
                    className="text-sm font-medium text-info hover:text-info/80 transition-colors duration-200"
                  >
                    View History
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {developers.length === 0 && (
          <div className="px-6 py-12 text-center text-text-secondary">
            No developers found
          </div>
        )}
      </div>
    </div>
  )
}
