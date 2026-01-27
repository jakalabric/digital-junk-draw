'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Link as LinkIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { addLink, getCategories } from '../actions/links'
import { Category } from '@/lib/supabase'

function AddLinkForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load categories and check for pre-filled data from share target
  useEffect(() => {
    const loadData = async () => {
      const cats = await getCategories()
      setCategories(cats)
      
      // Immediate URL parameter check - no delay needed
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const sharedUrl = params.get('url')
        
        if (sharedUrl) {
          // Decode the URL parameter before setting the state
          const decodedUrl = decodeURIComponent(sharedUrl)
          setUrl(decodedUrl)
          // Set URL as temporary title immediately if no title exists
          if (!title) {
            setTitle(decodedUrl)
          }
        }
      }
    }
    loadData()
  }, [])
  
  // Auto-focus on category dropdown when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const timeoutId = setTimeout(() => {
        const categorySelect = document.getElementById('category-select')
        if (categorySelect) {
          categorySelect.focus()
        }
      }, 100) // Small delay to ensure DOM is ready
      
      return () => clearTimeout(timeoutId)
    }
  }, [categories])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (!url) {
        setError('URL is required')
        setLoading(false)
        return
      }
  
      const formData = new FormData()
      formData.append('url', url)
      formData.append('title', title)
      formData.append('category_id', categoryId)
 
      const result = await addLink(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
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
      {/* Temporary URL Search Params Display */}
      <div className="bg-gray-100 p-2 text-xs text-gray-700">
        {typeof window !== 'undefined' ? window.location.search : 'Loading...'}
      </div>
      
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category-select"
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
            disabled={loading || !url}
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
