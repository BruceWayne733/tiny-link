import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Tiny Links',
  description: 'Simple URL shortener with stats',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-xl">Tiny Links</Link>
            <nav className="space-x-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">Create</Link>
              <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t bg-white mt-16">
          <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-500">
            Built with Next.js + Prisma + Postgres
          </div>
        </footer>
      </body>
    </html>
  )
}
