/**
 * ALICE Dashboard API Client
 * High-end minimal design - clean, professional data fetching
 */

import axios, { AxiosInstance } from 'axios'

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
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
      headers: {
        'X-Admin-Key': process.env.ADMIN_API_KEY || '',
      },
    })
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.client.get('/api/dashboard/stats')
    return data
  }

  async getDevelopers(sortBy: string = 'name', order: string = 'asc'): Promise<Developer[]> {
    const { data } = await this.client.get('/api/developers', {
      params: { sort: sortBy, order },
    })
    return data.developers
  }

  async getDeveloperHistory(developerId: string): Promise<{
    developer: Developer
    history: Analysis[]
    total_analyses: number
  }> {
    const { data } = await this.client.get(`/api/developers/${developerId}/history`)
    return data
  }

  async getProjectAnalytics(projectId: string, days: number = 30): Promise<ProjectAnalytics> {
    const { data } = await this.client.get(`/api/projects/${projectId}/analytics`, {
      params: { days },
    })
    return data
  }

  async getAnalysisDetails(analysisId: string): Promise<Analysis & { bugs: Bug[], raw_data: any }> {
    const { data } = await this.client.get(`/api/analyses/${analysisId}`)
    return data
  }
}

export const api = new APIClient()
