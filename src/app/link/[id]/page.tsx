'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, Trash2, Save } from 'lucide-react'
import { getLink, updateLink, deleteLink, getCategories } from '../../actions/links'
import { Category, LinkWithCategory } from '@/lib/supabase'

export default function LinkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [link, setLink] = useState<LinkWithCategory | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [linkData, cats] = await Promise.all([
          getLink(id),
          getCategories()
        ])
        setLink(linkData)
        setNotes(linkData.notes || '')
        setCategoryId(linkData.category_id || '')
        setCategories(cats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load link')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('notes', notes)
      formData.append('category_id', categoryId)

      await updateLink(id, formData)
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return
    }

    setError('')
    setDeleting(true)

    try {
      await deleteLink(id)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-gray-600">The link you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Save className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[#E2E8F0] shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--primary-accent)]/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-[var(--foreground)]" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">Edit Link</h1>
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-[var(--primary-accent)]/20 rounded-lg transition-colors text-[var(--primary-accent)]"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Link Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-2">{link.title}</h2>
          {link.source && (
            <p className="text-sm text-gray-600 mb-2">{link.source}</p>
          )}
          <p className="text-sm text-blue-600 break-all">{link.url}</p>
          {link.created_at && (
            <p className="text-xs text-gray-400 mt-2">
              Added: {new Date(link.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">No category</option>
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
              placeholder="Add notes about this link..."
              rows={6}
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {deleting && <Loader2 size={18} className="animate-spin" />}
              {!deleting && <Trash2 size={18} />}
              {deleting ? 'Deleting...' : 'Delete Link'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}