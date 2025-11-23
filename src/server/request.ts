import { NextRequest } from 'next/server'

export function getClientInfo(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''
  return { ip, userAgent, referer }
}
