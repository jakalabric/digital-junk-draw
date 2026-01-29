'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Edit2, Trash2 } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '../actions/links'
import { Category } from '@/lib/supabase'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: () => void
  categories: Category[]
}

export default function CategoryModal({ isOpen, onClose, onCategoryCreated, categories }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#40E0D0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const predefinedColors = [
    '#40E0D0', // Turquoise
    '#1E40AF', // Dark Blue
    '#F87171', // Light Red
    '#8B5CF6', // Amethyst
    '#FB7185', // Soft Rose
    '#D97706', // Muted Gold
    '#10B981', // Green
    '#F59E0B', // Amber
  ]

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setColor(editingCategory.color)
    } else {
      setName('')
      setColor('#40E0D0')
    }
  }, [editingCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('color', color)

      if (editingCategory) {
        formData.append('id', editingCategory.id)
        await updateCategory(formData)
      } else {
        await createCategory(formData)
      }
      
      setName('')
      setColor('#40E0D0')
      setEditingCategory(null)
      onCategoryCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategory(categoryToDelete.id)
      onCategoryCreated()
      setShowDeleteConfirm(false)
      setCategoryToDelete(null)
      if (editingCategory?.id === categoryToDelete.id) {
        setEditingCategory(null)
        setName('')
        setColor('#40E0D0')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setName('')
    setColor('#40E0D0')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-[var(--border-radius)] shadow-xl w-full max-w-md border border-[var(--primary-accent-60)]">
          <div className="flex items-center justify-between p-6 border-b border-[var(--primary-accent-60)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--primary-accent)]/10 rounded-lg transition-colors text-[var(--secondary-text)]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work, Personal, Reading"
                required
                className="w-full px-4 py-3 border border-[var(--primary-accent-60)] rounded-[var(--border-radius)] focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none text-[var(--foreground)] placeholder-[var(--secondary-text)]"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {predefinedColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      color === c ? 'ring-2 ring-offset-2 ring-[var(--primary-accent)]' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-[var(--primary-accent-60)]"
                />
                <span className="text-sm text-[var(--secondary-text)]">Custom color</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-[var(--border-radius)] font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[var(--primary-accent)] text-white py-3 rounded-[var(--border-radius)] font-medium hover:bg-[var(--primary-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="border-t border-[var(--primary-accent-60)] p-6">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Existing Categories</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-gray-600 hover:text-[var(--primary-accent)] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-[var(--secondary-text)] text-center py-4">
                  No categories yet. Create your first one!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[var(--border-radius)] shadow-xl w-full max-w-sm border border-[var(--primary-accent-60)] p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Delete Category
            </h3>
            <p className="text-sm text-[var(--secondary-text)] mb-6">
              Are you sure you want to delete "{categoryToDelete.name}"? Links in this category will be moved to "Uncategorized".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setCategoryToDelete(null)
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--border-radius)] font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-[var(--border-radius)] font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
