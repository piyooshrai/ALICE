/**
 * ALICE Dashboard API Client - Production Version
 * Connects to real ALICE server for live data
 */

export interface Developer {
  id: string
  name: string
  email: string
  current_grade: string
  current_score: number
  role_level: string
  analysis_count: number
  trend: 'improving' | 'declining' | 'stable'
  created_at: string
}

export interface Analysis {
  id: string
  grade: string
  quality_score: number
  role_level: string
  deployment_status: string
  total_files: number
  critical_bugs: number
  high_bugs: number
  medium_bugs: number
  strengths: string[]
  weaknesses: string[]
  analyzed_at: string
  bug_details?: Bug[]
}

export interface Bug {
  severity: string
  category: string
  file_path: string
  line_number: number
  description: string
  impact?: string
  fix_suggestion?: string
}

export interface DashboardStats {
  total_analyses: number
  total_developers: number
  average_score: number
  deployment_blocked: number
  grade_distribution: Record<string, number>
  recent_analyses: Analysis[]
}

export interface ProjectAnalytics {
  project: {
    id: string
    name: string
  }
  period_days: number
  total_analyses: number
  average_score: number
  critical_bugs_total: number
  grade_distribution: Record<string, number>
  timeline: Array<{
    date: string
    score: number
    grade: string
    critical_bugs: number
  }>
}

class APIClient {
  private baseURL: string
  private adminKey: string

  constructor() {
    // Read from environment or use default
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:5000'
    this.adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || process.env.ADMIN_API_KEY || ''
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': this.adminKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.fetch<DashboardStats>('/api/dashboard/stats')
  }

  async getDevelopers(sortBy: string = 'score', order: string = 'desc'): Promise<Developer[]> {
    const response = await this.fetch<{ developers: Developer[] }>(
      `/api/developers?sort=${sortBy}&order=${order}`
    )
    return response.developers
  }

  async getDeveloperHistory(developerId: string): Promise<{
    developer: Developer
    history: Analysis[]
    total_analyses: number
  }> {
    return this.fetch(`/api/developers/${developerId}/history`)
  }

  async getProjectAnalytics(projectId: string, days: number = 30): Promise<ProjectAnalytics> {
    return this.fetch(`/api/projects/${projectId}/analytics?days=${days}`)
  }

  async getAnalysisDetails(analysisId: string): Promise<Analysis & { bugs: Bug[], raw_data: any }> {
    return this.fetch(`/api/analyses/${analysisId}`)
  }
}

export const api = new APIClient()
