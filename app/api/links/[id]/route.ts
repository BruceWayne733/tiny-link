import { NextResponse } from 'next/server'
import { db } from '@/server/db'

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const id = params.id
  await db.click.deleteMany({ where: { linkId: id }})
  await db.link.delete({ where: { id }})
  return NextResponse.json({ ok: true })
}
