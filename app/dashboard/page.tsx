import Link from 'next/link'
import { db } from '@/server/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const links = await db.link.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { clicks: true } }
    }
  })

  async function deleteLink(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    if (!id) return
    await db.click.deleteMany({ where: { linkId: id }})
    await db.link.delete({ where: { id }})
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4">
        {links.map(l => (
          <div key={l.id} className="bg-white border rounded p-4 flex items-center justify-between">
            <div className="space-y-1">
              <Link className="font-mono underline" href={`/${l.slug}`}>{process.env.NEXT_PUBLIC_BASE_URL || ''}/{l.slug}</Link>
              <div className="text-sm text-gray-600 truncate max-w-xl">{l.url}</div>
              <div className="text-xs text-gray-500">Clicks: {l._count.clicks} · Created {l.createdAt.toLocaleString?.() || new Date(l.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/stats/${l.slug}`} className="border px-3 py-1 rounded hover:bg-gray-50">View stats</Link>
              <form action={deleteLink}>
                <input type="hidden" name="id" value={l.id} />
                <button className="text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1 rounded">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
