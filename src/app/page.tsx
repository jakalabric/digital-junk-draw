'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ExternalLink, Edit2, PlusCircle, Trash2 } from 'lucide-react'
import { getCategories, getLinks, deleteLink } from './actions/links'
import { Category, LinkWithCategory } from '@/lib/supabase'
import Link from 'next/link'
import CategoryModal from './components/CategoryModal'
import { motion, AnimatePresence } from 'framer-motion'

// Force dynamic rendering and disable caching for fresh data on every load
export const dynamic = 'force-dynamic'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [links, setLinks] = useState<LinkWithCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, linksData] = await Promise.all([
        getCategories(),
        getLinks(selectedCategory === 'all' ? null : selectedCategory, searchQuery)
      ])
      setCategories(cats)
      setLinks(linksData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLinks = links.filter(link => {
    if (selectedCategory === 'all') return true
    return link.category_id === selectedCategory
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id)
      setLinks(prev => prev.filter(link => link.id !== id))
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  return (
    <>
      <div className="min-h-screen pb-20 bg-[var(--background)]">
        {/* Neutral Dark Header */}
        <header className="sticky top-0 z-50 bg-[var(--surface-dark)] border-b border-[#1A202C] shadow-lg">
          <div className="px-4 py-3">
            {/* Title with subtle accent */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[var(--on-surface)] tracking-tight">
                  Digital Junk Drawer
                </h1>
                <span className="text-xs text-[var(--muted-text)] bg-[var(--primary-accent)]/20 px-2 py-0.5 rounded-full">
                  v1.0
                </span>
              </div>
              <Link
                href="/add"
                className="flex items-center gap-1 bg-[#2D3748] text-white px-4 py-2 rounded-[var(--border-radius)] hover:bg-[#1A202C] transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Link</span>
              </Link>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)] text-sm">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-dark)] border border-[#2D3748] rounded-[var(--border-radius)] focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none text-[var(--on-surface)] placeholder-[var(--muted-text)] text-sm shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Category Tabs - Warm Minimalist */}
        <div className="sticky top-[72px] z-40 bg-[var(--surface-dark)] border-b border-[#1A202C] shadow-sm">
          <div className="px-4 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2 items-center">
              {/* All Category */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-sm font-medium transition-all border rounded-[var(--border-radius)] ${
                  selectedCategory === 'all'
                    ? 'bg-[#2D3748] text-white border-[#2D3748]'
                    : 'bg-white text-[var(--foreground)] border-[#2D3748] hover:bg-[#2D3748]/10'
                }`}
              >
                All
              </button>
              
              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="px-4 py-2 text-sm font-medium transition-all border rounded-[var(--border-radius)] bg-white"
                  style={{
                    color: selectedCategory === category.id ? 'white' : category.color,
                    backgroundColor: selectedCategory === category.id ? category.color : 'white',
                    borderColor: selectedCategory === category.id ? category.color : `${category.color}60`,
                    borderWidth: '1px',
                  }}
                >
                  {category.name}
                </button>
              ))}
              
              {/* Add Category Button */}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-white text-[var(--primary-accent)] border border-[var(--primary-accent-60)] hover:bg-[var(--primary-accent)]/10 transition-all rounded-[var(--border-radius)] flex items-center gap-2"
              >
                <PlusCircle size={14} />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 pt-6 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-accent)]"></div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="mx-auto h-16 w-16 text-[var(--secondary-text)] mb-4" />
              <p className="text-[var(--foreground)] font-medium text-lg">No links found</p>
              <p className="text-[var(--secondary-text)] text-sm mt-1">Try adjusting filters or add a new link</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filteredLinks.map((link) => (
                  <LinkCard key={link.id} link={link} onDelete={handleDelete} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-dark)] border-t border-[#1A202C] shadow-lg backdrop-blur-md">
          <div className="flex justify-around items-center h-16 px-4">
            {/* List Tab */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center text-[var(--on-surface)] hover:text-[var(--primary-accent)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1 font-medium">List</span>
            </Link>

            {/* Add Tab */}
            <Link
              href="/add"
              className="flex flex-col items-center justify-center text-[var(--primary-accent)] hover:text-[var(--primary-accent)]/90 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--primary-accent)] flex items-center justify-center shadow-lg -mt-4">
                <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium text-[var(--on-surface)]">Add</span>
            </Link>

            {/* Search Tab */}
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder="Search links..."]') as HTMLInputElement | null;
                if (searchInput) {
                  searchInput.focus();
                }
              }}
              className="flex flex-col items-center justify-center text-[var(--on-surface)] hover:text-[var(--primary-accent)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs mt-1 font-medium">Search</span>
            </button>
          </div>
        </nav>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={loadData}
        categories={categories}
      />
    </>
  )
}

function LinkCard({ link, onDelete }: { link: LinkWithCategory; onDelete: (id: string) => void }) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const cardWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 400) : 350
  const threshold = cardWidth * 0.5

  // Ensure URL has a protocol prefix
  const getFullUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const fullUrl = getFullUrl(link.url)
  const categoryColor = link.category?.color || 'var(--primary-accent)'

  const handleDragEnd = () => {
    if (Math.abs(dragX) > threshold) {
      setIsDeleted(true)
      setTimeout(() => onDelete(link.id), 300)
    } else {
      setDragX(0)
    }
    setIsDragging(false)
  }

  const handleDrag = (event: any, info: any) => {
    const newX = info.offset.x
    if (newX < 0) {
      setDragX(newX)
    }
  }

  if (isDeleted) {
    return null
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-[var(--border-radius)]"
      style={{ borderColor: categoryColor, borderWidth: '1px' }}
      layout
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Delete background tucked inside border */}
      <div 
        className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 z-0" 
        style={{ borderRadius: 'var(--border-radius)' }}
      >
        <div className="flex items-center gap-2 text-white">
          <Trash2 size={20} />
          <span className="font-medium">Delete</span>
        </div>
      </div>

      {/* Card Content Layer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -cardWidth, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        transition={isDragging ? { type: 'tween' } : { type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          x: dragX,
          cursor: 'grab',
          position: 'relative',
          zIndex: 10,
        }}
        whileTap={{ cursor: 'grabbing' }}
        layout
      >
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-[var(--border-radius)] p-4 hover:shadow-md transition-all duration-200 shadow-sm"
          style={{
            borderColor: categoryColor,
            borderWidth: '1px',
          }}
          onClick={(e) => {
            if (Math.abs(dragX) > 10) {
              e.preventDefault()
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-base" style={{ color: categoryColor }}>
                {link.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {link.source && (
                  <p className="text-xs text-[var(--secondary-text)] bg-[var(--primary-accent)]/10 px-2 py-0.5 rounded-full">
                    {link.source}
                  </p>
                )}
                <p className="text-xs text-[var(--secondary-text)]">
                  {new Date(link.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {link.notes && (
                <p className="text-sm text-[var(--secondary-text)] mt-2 line-clamp-2">{link.notes}</p>
              )}
              {link.category && (
                <span
                  className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full border"
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}10`,
                    borderColor: `${categoryColor}60`,
                  }}
                >
                  {link.category.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink size={18} style={{ color: categoryColor }} />
              <Link
                href={`/link/${link.id}`}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  color: categoryColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = categoryColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = categoryColor;
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Edit2 size={18} />
              </Link>
            </div>
          </div>
        </a>
      </motion.div>
    </motion.div>
  )
}
