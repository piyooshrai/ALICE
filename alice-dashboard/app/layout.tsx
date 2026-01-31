/**
 * ALICE Dashboard Root Layout
 * High-end minimal design - clean, professional interface
 */

import type { Metadata } from 'next'
import './globals.css'

// Fonts will be loaded via CDN in production
// Using system fonts as fallback for offline builds

export const metadata: Metadata = {
  title: 'ALICE Dashboard',
  description: 'Automated Logic Inspection & Code Evaluation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ALICE',
  },
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-background text-text-primary antialiased">
        <div className="min-h-screen">
          {/* Header */}
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

                <nav className="flex flex-wrap gap-3 sm:gap-6 lg:gap-8">
                  <a
                    href="/"
                    className="text-xs sm:text-sm font-medium text-text-primary hover:text-info transition-colors duration-200"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/developers"
                    className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Developers
                  </a>
                  <a
                    href="/projects"
                    className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Projects
                  </a>
                  <a
                    href="/guide"
                    className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Guide
                  </a>
                  <a
                    href="/analytics"
                    className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Analytics
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-surface border-t border-border mt-12 sm:mt-16 lg:mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-text-secondary">
                  ALICE Dashboard v1.0.0
                </p>
                <p className="text-xs text-text-secondary">
                  Confidential - Management Only
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
