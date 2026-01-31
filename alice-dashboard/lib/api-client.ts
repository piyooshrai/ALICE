/**
 * ALICE Dashboard API Client
 * Calls Next.js API routes which proxy to alice-server
 * Keeps admin credentials secure on the server side
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

class APIClient {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch('/api/dashboard')

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }

    return response.json()
  }

  /**
   * Get all developers
   */
  async getDevelopers(): Promise<Developer[]> {
    const response = await fetch('/api/developers')

    if (!response.ok) {
      throw new Error('Failed to fetch developers')
    }

    return response.json()
  }

  /**
   * Get developer by ID with full analysis history
   */
  async getDeveloper(id: string): Promise<Developer & { analyses: Analysis[] }> {
    const response = await fetch(`/api/developers/${id}`)

    if (!response.ok) {
      throw new Error('Failed to fetch developer')
    }

    return response.json()
  }
}

// Export singleton instance
export const api = new APIClient()
