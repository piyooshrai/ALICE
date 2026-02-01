/**
 * ALICE Dashboard Root Layout
 * High-end minimal design - clean, professional interface
 */

import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Header from '@/components/Header'

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
        <Providers>
          <div className="min-h-screen">
            <Header />

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
        </Providers>
      </body>
    </html>
  )
}
