import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/server/db'
import { nanoid } from 'nanoid'

const schema = z.object({
  url: z.string().url(),
  slug: z.string().regex(/^[a-zA-Z0-9-_]+$/).min(1).max(64).optional(),
})

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parse = schema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { url } = parse.data
  let { slug } = parse.data
  if (!slug) slug = nanoid(7)

  // Ensure slug uniqueness
  const exists = await db.link.findUnique({ where: { slug } })
  if (exists) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const link = await db.link.create({ data: { url, slug }})

  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin
  return NextResponse.json({ id: link.id, slug: link.slug, shortUrl: `${base}/${link.slug}` })
}

export async function GET() {
  const links = await db.link.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { clicks: true }}}
  })
  return NextResponse.json(links)
}
