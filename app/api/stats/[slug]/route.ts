import { NextResponse } from 'next/server'
import { db } from '@/server/db'

export async function GET(_: Request, { params }: { params: { slug: string }}) {
  const slug = params.slug
  const link = await db.link.findUnique({ where: { slug }})
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const clicks = await db.click.findMany({
    where: { linkId: link.id },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  })

  return NextResponse.json({
    slug: link.slug,
    url: link.url,
    createdAt: link.createdAt,
    total: clicks.length,
    recent: clicks.slice(0, 20),
  })
}
