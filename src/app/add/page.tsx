'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Link as LinkIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { addLink, fetchUrlMetadata, getCategories } from '../actions/links'
import { Category } from '@/lib/supabase'

function AddLinkForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [source, setSource] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load categories and check for pre-filled data from share target
  useEffect(() => {
    const loadData = async () => {
      const cats = await getCategories()
      setCategories(cats)
      
      // Fail-safe method: Use URLSearchParams to grab the 'url' parameter
      const params = new URLSearchParams(window.location.search)
      const sharedUrl = params.get('url')
      
      if (sharedUrl) {
        // Decode the URL parameter before setting the state
        const decodedUrl = decodeURIComponent(sharedUrl)
        setUrl(decodedUrl)
      }
    }
    loadData()
  }, [])

  // Auto-fetch metadata when URL is set from search params
  useEffect(() => {
    const fetchMetadata = async () => {
      if (url && url.startsWith('http')) {
        setFetching(true)
        setError('')
        try {
          const metadata = await fetchUrlMetadata(url)
          if (metadata.title && !title) {
            setTitle(metadata.title)
          }
          if (metadata.source && !source) {
            setSource(metadata.source)
          }
        } catch (err) {
          console.error('Error fetching metadata:', err)
        } finally {
          setFetching(false)
        }
      }
    }
    
    fetchMetadata()
  }, [url])

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    
    // Auto-fetch metadata when URL is pasted
    if (newUrl && newUrl.startsWith('http')) {
      setFetching(true)
      setError('')
      try {
        const metadata = await fetchUrlMetadata(newUrl)
        if (metadata.title && !title) {
          setTitle(metadata.title)
        }
        if (metadata.source && !source) {
          setSource(metadata.source)
        }
      } catch (err) {
        console.error('Error fetching metadata:', err)
      } finally {
        setFetching(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!url || !title) {
        setError('URL and Title are required')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('url', url)
      formData.append('title', title)
      formData.append('notes', notes)
      formData.append('source', source)
      formData.append('category_id', categoryId)

      await addLink(formData)
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Added!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Add New Link</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {fetching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Source Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., reddit.com, youtube.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this link..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Adding...' : 'Add Link'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default function AddLinkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}>
      <AddLinkForm />
    </Suspense>
  )
}
