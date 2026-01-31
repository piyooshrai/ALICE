'use client'

export default function DeveloperGuidePage() {
  return (
    <div className="space-y-12 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">
          Developer Guide
        </h2>
        <p className="text-text-secondary mt-2">
          How to use ALICE to analyze your code
        </p>
      </div>

      {/* Installation */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Installation</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary mb-2">Install ALICE SDK globally:</p>
            <pre className="bg-black border border-zinc-700 rounded p-4 text-sm font-mono overflow-x-auto text-white">
npm install -g @the-algo/alice
            </pre>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">First-Time Setup</h3>
        <div className="space-y-4">
          <p className="text-text-secondary">
            Run this once in your project directory to configure ALICE:
          </p>
          <pre className="bg-black border border-zinc-700 rounded p-4 text-sm font-mono overflow-x-auto text-white">
alice init
          </pre>
          <p className="text-text-secondary text-sm">
            You will be prompted for:
          </p>
          <ul className="text-sm text-text-secondary space-y-2 ml-4">
            <li>• <span className="font-semibold">API Key</span> - Get this from your team lead or project manager</li>
            <li>• <span className="font-semibold">Your Name</span> - Your full name</li>
            <li>• <span className="font-semibold">Your Email</span> - Where you receive technical reports</li>
          </ul>
        </div>
      </section>

      {/* Frontend */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Frontend Code</h3>
        <div className="space-y-4">
          <p className="text-text-secondary">
            For React, Vue, Angular, or any frontend JavaScript/TypeScript project:
          </p>
          <pre className="bg-black border border-zinc-700 rounded p-4 text-sm font-mono overflow-x-auto text-white">
alice analyze --type frontend
          </pre>
          <div className="text-sm text-text-secondary space-y-2">
            <p className="font-semibold">ALICE analyzes:</p>
            <ul className="ml-4 space-y-1">
              <li>• Component structure and patterns</li>
              <li>• State management quality</li>
              <li>• Performance issues (re-renders, memory leaks)</li>
              <li>• Accessibility (a11y) compliance</li>
              <li>• Security vulnerabilities (XSS, injection)</li>
              <li>• Code organization and modularity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Backend */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Backend Code</h3>
        <div className="space-y-4">
          <p className="text-text-secondary">
            For Node.js, Python, Java, Go, or any backend service:
          </p>
          <pre className="bg-black border border-zinc-700 rounded p-4 text-sm font-mono overflow-x-auto text-white">
alice analyze --type backend
          </pre>
          <div className="text-sm text-text-secondary space-y-2">
            <p className="font-semibold">ALICE analyzes:</p>
            <ul className="ml-4 space-y-1">
              <li>• API design and REST/GraphQL patterns</li>
              <li>• Database queries and optimization</li>
              <li>• Authentication and authorization</li>
              <li>• Security vulnerabilities (SQL injection, command injection)</li>
              <li>• Error handling and logging</li>
              <li>• Code maintainability and architecture</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Mobile Code</h3>
        <div className="space-y-4">
          <p className="text-text-secondary">
            For React Native, Flutter, Swift, or Kotlin projects:
          </p>
          <pre className="bg-black border border-zinc-700 rounded p-4 text-sm font-mono overflow-x-auto text-white">
alice analyze --type mobile
          </pre>
          <div className="text-sm text-text-secondary space-y-2">
            <p className="font-semibold">ALICE analyzes:</p>
            <ul className="ml-4 space-y-1">
              <li>• Mobile-specific patterns and best practices</li>
              <li>• Performance (battery, memory, network)</li>
              <li>• UI/UX and platform guidelines</li>
              <li>• Security (data storage, API calls)</li>
              <li>• Offline functionality and data sync</li>
              <li>• Code organization and scalability</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Happens */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">What Happens After Analysis</h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">1. ALICE analyzes your code</h4>
              <p className="text-sm text-text-secondary">
                Examines code quality, security, performance, and best practices
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">2. You receive a technical report via email</h4>
              <p className="text-sm text-text-secondary">
                Detailed bug findings, security issues, and specific fixes. No grades or scores.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">3. Management receives a full assessment</h4>
              <p className="text-sm text-text-secondary">
                Includes quality score, grade, role level, and performance recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">How Scoring Works</h3>
        <div className="space-y-4">
          <p className="text-text-secondary">
            ALICE uses an excellence-based scoring system:
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-semibold min-w-[60px] text-center">
                90-100
              </div>
              <div>
                <p className="font-semibold">A (Exceptional)</p>
                <p className="text-text-secondary">Production-ready, excellent architecture, minimal issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-semibold min-w-[60px] text-center">
                80-89
              </div>
              <div>
                <p className="font-semibold">B (Strong)</p>
                <p className="text-text-secondary">Solid quality, minor improvements needed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded font-semibold min-w-[60px] text-center">
                70-79
              </div>
              <div>
                <p className="font-semibold">C (Competent)</p>
                <p className="text-text-secondary">Functional but needs refinement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-semibold min-w-[60px] text-center">
                60-69
              </div>
              <div>
                <p className="font-semibold">D (Developing)</p>
                <p className="text-text-secondary">Significant issues, requires substantial work</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded font-semibold min-w-[60px] text-center">
                50-59
              </div>
              <div>
                <p className="font-semibold">F (Unacceptable)</p>
                <p className="text-text-secondary">Critical issues, not production-ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
        <ul className="text-sm text-text-secondary space-y-2">
          <li>• <span className="font-semibold">Run before commits:</span> Catch issues early</li>
          <li>• <span className="font-semibold">Fix critical bugs first:</span> Security and breaking issues take priority</li>
          <li>• <span className="font-semibold">Review technical reports:</span> Learn from detailed feedback</li>
          <li>• <span className="font-semibold">Track your progress:</span> Your performance history is visible to management</li>
          <li>• <span className="font-semibold">Ask questions:</span> If unclear about a finding, discuss with your team</li>
        </ul>
      </section>

      {/* Help */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
        <div className="text-sm text-text-secondary space-y-2">
          <p>Contact your team lead or project manager for:</p>
          <ul className="ml-4 space-y-1">
            <li>• Getting your API key</li>
            <li>• Questions about findings</li>
            <li>• Technical support</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
