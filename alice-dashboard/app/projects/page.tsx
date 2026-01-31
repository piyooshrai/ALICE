'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  api_key: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [fetchingProjects, setFetchingProjects] = useState(true)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<string>('')

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true)
      const response = await fetch('/api/projects')

      if (!response.ok) {
        console.error('Failed to fetch projects:', response.status)
        return
      }

      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setFetchingProjects(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔵 ALICE Dashboard - Build timestamp:', new Date().toISOString())
    console.log('🔵 Creating project:', projectName)
    console.log('🔵 API endpoint:', '/api/projects')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
        }),
      })

      console.log('🔵 Response status:', response.status)
      console.log('🔵 Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('🔵 Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create project')
      }

      console.log('🔵 Project created successfully:', data)

      // Add to projects list
      setProjects([
        {
          id: data.project_id,
          name: data.name,
          api_key: data.api_key,
          created_at: new Date().toISOString(),
        },
        ...projects,
      ])

      setProjectName('')
    } catch (err) {
      console.error('🔴 Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete project')
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('🔴 Error deleting project:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const sendTestEmails = async () => {
    setSendingTestEmail(true)
    setTestEmailResult('')

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test emails')
      }

      if (data.success) {
        setTestEmailResult(`✅ Test emails sent to ${data.recipient}! Check your inbox for:\n1. Technical Report\n2. Management Assessment`)
      } else {
        setTestEmailResult(`⚠️ Partial success:\n- Technical Report: ${data.technical_report}\n- Management Assessment: ${data.management_assessment}`)
      }
    } catch (err) {
      console.error('🔴 Error sending test emails:', err)
      setTestEmailResult(`❌ Error: ${err instanceof Error ? err.message : 'Failed to send test emails'}`)
    } finally {
      setSendingTestEmail(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Project Management
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2">
          Create projects and manage API keys for your development teams
        </p>
      </div>

      {/* Create Project Form */}
      <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-xl font-semibold mb-4">Create New Project</h3>

        <form onSubmit={createProject} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm text-text-secondary mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Frontend Team, Mobile App, Backend Services"
              className="w-full bg-black border border-zinc-700 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900 rounded px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Test Email Section */}
      <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-xl font-semibold mb-2">Test Email Delivery</h3>
        <p className="text-sm text-text-secondary mb-4">
          Send sample analysis emails to piyoosh.rai@the-algo.com to verify AWS SES configuration
        </p>

        <button
          onClick={sendTestEmails}
          disabled={sendingTestEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendingTestEmail ? 'Sending...' : 'Send Test Emails'}
        </button>

        {testEmailResult && (
          <div className={`mt-4 rounded px-4 py-3 text-sm whitespace-pre-line ${
            testEmailResult.startsWith('✅')
              ? 'bg-green-900/20 border border-green-900 text-green-400'
              : testEmailResult.startsWith('⚠️')
              ? 'bg-yellow-900/20 border border-yellow-900 text-yellow-400'
              : 'bg-red-900/20 border border-red-900 text-red-400'
          }`}>
            {testEmailResult}
          </div>
        )}
      </div>

      {/* Projects List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Active Projects</h3>

        {fetchingProjects ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-text-secondary">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-text-secondary">No projects yet. Create your first project above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">{project.name}</h4>
                    <p className="text-sm text-text-secondary">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteProject(project.id, project.name)}
                    className="bg-red-900/20 hover:bg-red-900/30 text-red-400 px-3 py-1.5 rounded text-sm transition-colors"
                    title="Delete project"
                  >
                    Delete
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">API Key</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={project.api_key}
                      readOnly
                      className="flex-1 bg-black border border-zinc-700 rounded px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm text-white overflow-x-auto"
                    />
                    <button
                      onClick={() => copyToClipboard(project.api_key)}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition-colors whitespace-nowrap"
                    >
                      {copiedKey === project.api_key ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Share this key with all developers on this project
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="text-sm text-text-secondary space-y-2">
          <li>• Create a project for each team or codebase you want to analyze</li>
          <li>• Share the API key with all developers on that project</li>
          <li>• Developers use the SDK with this key to analyze their code</li>
          <li>• ALICE tracks each developer individually by their name and email</li>
        </ul>
      </div>
    </div>
  )
}
