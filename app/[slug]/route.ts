import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { getClientInfo } from '@/server/request'

export async function GET(req: NextRequest, { params }: { params: { slug: string }}) {
  const slug = params.slug
  const link = await db.link.findUnique({ where: { slug } })
  if (!link) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    const info = getClientInfo(req)
    await db.click.create({
      data: {
        linkId: link.id,
        ip: info.ip,
        userAgent: info.userAgent,
        referer: info.referer,
      }
    })
  } catch (e) {
    // Swallow logging errors so redirect is not blocked
    console.warn('Failed to record click', e)
  }

  return NextResponse.redirect(link.url)
}
