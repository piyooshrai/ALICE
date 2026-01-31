'use client'

import { useState } from 'react'

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

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const data = await response.json()
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

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">
          Project Management
        </h2>
        <p className="text-text-secondary mt-2">
          Create projects and manage API keys for your development teams
        </p>
      </div>

      {/* Create Project Form */}
      <div className="bg-surface border border-border rounded-lg p-6">
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

      {/* Projects List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Active Projects</h3>

        {projects.length === 0 ? (
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
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={project.api_key}
                      readOnly
                      className="flex-1 bg-black border border-zinc-700 rounded px-4 py-2 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(project.api_key)}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition-colors"
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
