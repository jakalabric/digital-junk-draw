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
    <div className="min-h-screen pb-20 bg-[var(--background)]">
      {/* Neutral Dark Header */}
      <header className="sticky top-0 z-50 bg-[var(--surface-dark)] border-b border-[#1A202C] shadow-lg">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--primary-accent)]/20 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-[var(--on-surface)]" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--on-surface)]">Add New Link</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)]">
                <LinkIcon size={16} />
              </span>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--primary-accent-60)] rounded-[var(--border-radius)] focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none text-[var(--foreground)] placeholder-[var(--secondary-text)] transition-colors"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] text-sm">#</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--primary-accent-60)] rounded-[var(--border-radius)] focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none text-[var(--foreground)] placeholder-[var(--secondary-text)] transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Category
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] text-sm">⌄</span>
              <select
                id="category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--primary-accent-60)] rounded-[var(--border-radius)] focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none text-[var(--foreground)] appearance-none"
              >
                <option value="" className="text-[var(--secondary-text)]">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-[var(--foreground)]">
                    {cat.name}
                  </option>
              ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-[var(--primary-accent)] text-white py-4 rounded-[var(--border-radius)] hover:bg-[var(--primary-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            {loading && <Loader2 size={18} className="animate-spin text-white" />}
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
