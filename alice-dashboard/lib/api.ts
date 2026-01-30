/**
 * ALICE Dashboard API Client - Mock Data Version
 * For local development and demonstration
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

// Mock data for demonstration
const mockDevelopers: Developer[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    current_grade: 'A+',
    current_score: 96,
    role_level: 'Senior',
    analysis_count: 24,
    trend: 'improving',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus.j@company.com',
    current_grade: 'A',
    current_score: 92,
    role_level: 'Senior',
    analysis_count: 18,
    trend: 'stable',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@company.com',
    current_grade: 'B+',
    current_score: 82,
    role_level: 'Mid-Level',
    analysis_count: 15,
    trend: 'improving',
    created_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.w@company.com',
    current_grade: 'B',
    current_score: 78,
    role_level: 'Mid-Level',
    analysis_count: 12,
    trend: 'stable',
    created_at: '2024-02-10T10:00:00Z'
  },
  {
    id: '5',
    name: 'Aisha Patel',
    email: 'aisha.p@company.com',
    current_grade: 'C+',
    current_score: 68,
    role_level: 'Junior',
    analysis_count: 8,
    trend: 'improving',
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david.k@company.com',
    current_grade: 'D',
    current_score: 52,
    role_level: 'Entry-Level',
    analysis_count: 5,
    trend: 'declining',
    created_at: '2024-03-01T10:00:00Z'
  }
]

const mockAnalyses: Analysis[] = [
  {
    id: 'a1',
    grade: 'A+',
    quality_score: 96,
    role_level: 'Senior',
    deployment_status: 'APPROVED',
    total_files: 45,
    critical_bugs: 0,
    high_bugs: 0,
    medium_bugs: 2,
    strengths: ['Excellent TypeScript usage', 'Strong security practices', 'Great accessibility'],
    weaknesses: ['Minor performance optimizations possible'],
    analyzed_at: '2024-03-15T14:30:00Z'
  },
  {
    id: 'a2',
    grade: 'A',
    quality_score: 92,
    role_level: 'Senior',
    deployment_status: 'APPROVED',
    total_files: 38,
    critical_bugs: 0,
    high_bugs: 1,
    medium_bugs: 3,
    strengths: ['Proper error handling', 'Clean architecture', 'Good documentation'],
    weaknesses: ['Some accessibility improvements needed'],
    analyzed_at: '2024-03-15T13:15:00Z'
  },
  {
    id: 'a3',
    grade: 'B+',
    quality_score: 82,
    role_level: 'Mid-Level',
    deployment_status: 'APPROVED',
    total_files: 28,
    critical_bugs: 0,
    high_bugs: 2,
    medium_bugs: 5,
    strengths: ['Good code organization', 'Decent test coverage'],
    weaknesses: ['Missing error handling in async', 'Performance issues'],
    analyzed_at: '2024-03-15T11:45:00Z'
  },
  {
    id: 'a4',
    grade: 'D',
    quality_score: 52,
    role_level: 'Entry-Level',
    deployment_status: 'BLOCKED',
    total_files: 15,
    critical_bugs: 3,
    high_bugs: 5,
    medium_bugs: 8,
    strengths: ['Code submitted for review'],
    weaknesses: ['Critical security issues', 'No error handling', 'High complexity'],
    analyzed_at: '2024-03-15T10:20:00Z'
  }
]

const mockStats: DashboardStats = {
  total_analyses: 86,
  total_developers: 6,
  average_score: 79,
  deployment_blocked: 4,
  grade_distribution: {
    'A+': 8,
    'A': 12,
    'A-': 15,
    'B+': 18,
    'B': 14,
    'B-': 10,
    'C+': 5,
    'C': 3,
    'C-': 1,
    'D': 0
  },
  recent_analyses: mockAnalyses
}

class APIClient {
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockStats
  }

  async getDevelopers(sortBy: string = 'score', order: string = 'desc'): Promise<Developer[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    let sorted = [...mockDevelopers]

    if (sortBy === 'score') {
      sorted.sort((a, b) => order === 'desc' ? b.current_score - a.current_score : a.current_score - b.current_score)
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => order === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))
    }

    return sorted
  }

  async getDeveloperHistory(developerId: string): Promise<{
    developer: Developer
    history: Analysis[]
    total_analyses: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const developer = mockDevelopers.find(d => d.id === developerId)
    if (!developer) throw new Error('Developer not found')

    return {
      developer,
      history: mockAnalyses.slice(0, 3),
      total_analyses: developer.analysis_count
    }
  }

  async getProjectAnalytics(projectId: string, days: number = 30): Promise<ProjectAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      project: { id: projectId, name: 'Demo Project' },
      period_days: days,
      total_analyses: 20,
      average_score: 82,
      critical_bugs_total: 3,
      grade_distribution: mockStats.grade_distribution,
      timeline: [
        { date: '2024-03-01', score: 75, grade: 'B', critical_bugs: 2 },
        { date: '2024-03-08', score: 82, grade: 'B+', critical_bugs: 1 },
        { date: '2024-03-15', score: 88, grade: 'A-', critical_bugs: 0 }
      ]
    }
  }

  async getAnalysisDetails(analysisId: string): Promise<Analysis & { bugs: Bug[], raw_data: any }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const analysis = mockAnalyses.find(a => a.id === analysisId)
    if (!analysis) throw new Error('Analysis not found')

    return {
      ...analysis,
      bugs: [],
      raw_data: {}
    }
  }
}

export const api = new APIClient()
