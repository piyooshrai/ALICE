/**
 * ALICE Dashboard Root Layout
 * High-end minimal design - clean, professional interface
 */

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'ALICE Dashboard',
  description: 'Automated Logic Inspection & Code Evaluation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-text-primary antialiased">
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-surface border-b border-border">
            <div className="max-w-7xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                    ALICE
                  </h1>
                  <p className="text-sm text-text-secondary mt-1">
                    Automated Logic Inspection & Code Evaluation
                  </p>
                </div>

                <nav className="flex space-x-8">
                  <a
                    href="/"
                    className="text-sm font-medium text-text-primary hover:text-info transition-colors duration-200"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/developers"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Developers
                  </a>
                  <a
                    href="/projects"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Projects
                  </a>
                  <a
                    href="/analytics"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    Analytics
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-8 py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-surface border-t border-border mt-24">
            <div className="max-w-7xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
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
