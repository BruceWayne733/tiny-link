import Link from 'next/link'
import { db } from '@/server/db'

export const dynamic = 'force-dynamic'

export default async function StatsPage({ params }: { params: { slug: string }}) {
  const slug = params.slug
  const link = await db.link.findUnique({ where: { slug }})
  if (!link) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p>No link for slug: <code>{slug}</code></p>
        <Link className="underline" href="/">Go back</Link>
      </div>
    )
  }

  const clicks = await db.click.findMany({ where: { linkId: link.id }, orderBy: { createdAt: 'desc' }, take: 200 })
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stats</h1>
          <div className="text-sm text-gray-600">
            <span className="font-mono">{base}/{link.slug}</span>
            <span className="mx-2">→</span>
            <a href={link.url} className="underline" target="_blank" rel="noreferrer">{link.url}</a>
          </div>
        </div>
        <Link href="/dashboard" className="border px-3 py-1 rounded">Back to Dashboard</Link>
      </div>

      <div className="bg-white border rounded">
        <div className="border-b px-4 py-2 text-sm text-gray-600">Recent clicks ({clicks.length})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">IP</th>
                <th className="px-4 py-2">Referer</th>
                <th className="px-4 py-2">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{c.ip || '-'}</td>
                  <td className="px-4 py-2 max-w-[24rem] truncate" title={c.referer || ''}>{c.referer || '-'}</td>
                  <td className="px-4 py-2 max-w-[32rem] truncate" title={c.userAgent || ''}>{c.userAgent || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
