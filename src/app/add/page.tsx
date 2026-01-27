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
      if (result.success) {
        router.push('/')
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link')
      setLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen pb-20">
      {/* Terminal Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-green-500/20">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-green-500/10 rounded transition-colors"
          >
            <ArrowLeft size={20} className="text-green-500" />
          </button>
          <h1 className="text-lg font-semibold text-green-500">ADD NEW LINK</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input - Command Prompt Style */}
          <div>
            <label className="block text-xs font-medium text-green-400 mb-1">
              INPUT_URL <span className="text-green-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">$</span>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="w-full pl-8 pr-4 py-3 bg-black/30 border-b border-green-500/20 focus:border-green-500 outline-none text-green-500 placeholder-green-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Title Input - Command Prompt Style */}
          <div>
            <label className="block text-xs font-medium text-green-400 mb-1">
              INPUT_TITLE <span className="text-green-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">$</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full pl-8 pr-4 py-3 bg-black/30 border-b border-green-500/20 focus:border-green-500 outline-none text-green-500 placeholder-green-500/50 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Category Select - Terminal Style */}
          <div>
            <label className="block text-xs font-medium text-green-400 mb-1">
              SELECT_CATEGORY
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">$</span>
              <select
                id="category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-black/30 border-b border-green-500/20 focus:border-green-500 outline-none text-green-500 appearance-none"
              >
                <option value="" className="bg-black text-green-500">SELECT_CATEGORY</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-black text-green-500">
                    {cat.name}
                  </option>
              ))}
              </select>
            </div>
          </div>

          {/* Error Message - Terminal Style */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded border border-red-500/20">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Submit Button - Terminal Style */}
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-green-500/10 text-green-500 py-4 rounded border border-green-500/20 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading && <Loader2 size={18} className="animate-spin text-green-500" />}
            {loading ? 'EXECUTING...' : 'EXECUTE'}
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
