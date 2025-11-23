"use client"
import { useState } from 'react'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, slug: slug || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create link')
      setResult(data.shortUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Shorten a URL</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Destination URL</label>
            <input type="url" required placeholder="https://example.com/page" value={url} onChange={e => setUrl(e.target.value)} className="w-full"/>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Custom slug (optional)</label>
            <input placeholder="e.g. my-page" value={slug} onChange={e => setSlug(e.target.value)} className="w-full"/>
          </div>
          <button disabled={loading} className="primary">{loading ? 'Creating...' : 'Create short link'}</button>
        </form>
        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-800">Short URL created:</div>
            <a className="font-mono text-green-900 underline" href={result} target="_blank" rel="noreferrer">{result}</a>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">{error}</div>
        )}
      </section>
    </div>
  )
}
