'use client'

import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Don't show header on login page
  if (pathname === '/login') {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              ALICE
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 hidden sm:block">
              Automated Logic Inspection & Code Evaluation
            </p>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex flex-wrap gap-3 sm:gap-6 lg:gap-8">
              <a
                href="/"
                className={`text-xs sm:text-sm font-medium ${
                  pathname === '/' ? 'text-text-primary' : 'text-text-secondary'
                } hover:text-text-primary transition-colors duration-200`}
              >
                Dashboard
              </a>
              <a
                href="/developers"
                className={`text-xs sm:text-sm font-medium ${
                  pathname === '/developers' ? 'text-text-primary' : 'text-text-secondary'
                } hover:text-text-primary transition-colors duration-200`}
              >
                Developers
              </a>
              <a
                href="/projects"
                className={`text-xs sm:text-sm font-medium ${
                  pathname === '/projects' ? 'text-text-primary' : 'text-text-secondary'
                } hover:text-text-primary transition-colors duration-200`}
              >
                Projects
              </a>
              <a
                href="/guide"
                className={`text-xs sm:text-sm font-medium ${
                  pathname === '/guide' ? 'text-text-primary' : 'text-text-secondary'
                } hover:text-text-primary transition-colors duration-200`}
              >
                Guide
              </a>
              <a
                href="/analytics"
                className={`text-xs sm:text-sm font-medium ${
                  pathname === '/analytics' ? 'text-text-primary' : 'text-text-secondary'
                } hover:text-text-primary transition-colors duration-200`}
              >
                Analytics
              </a>
            </nav>

            {session && (
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
