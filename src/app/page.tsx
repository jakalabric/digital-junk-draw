'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ExternalLink, Edit2, PlusCircle } from 'lucide-react'
import { getCategories, getLinks } from './actions/links'
import { Category, LinkWithCategory } from '@/lib/supabase'
import Link from 'next/link'
import CategoryModal from './components/CategoryModal'

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

  return (
    <>
      <div className="min-h-screen pb-20">
        {/* Terminal Header */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-green-500/20">
          <div className="px-4 py-2">
            {/* Terminal Title with Blinking Cursor */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-green-500 tracking-wider">
                  SYSTEM_LOG // JUNK_DRAW<span className="blink text-green-500">_</span>
                </h1>
              </div>
              <Link
                href="/add"
                className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">ADD</span>
              </Link>
            </div>

            {/* Terminal Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">$</span>
              <input
                type="text"
                placeholder="search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-black/50 border border-green-500/20 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-green-500 placeholder-green-500/50 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Category Tabs - Terminal Style */}
        <div className="sticky top-[120px] z-30 bg-black/95 backdrop-blur-sm border-b border-green-500/20">
          <div className="px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-1 items-center">
              {/* All Category */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs font-medium transition-all border border-green-500/20 rounded-sm ${
                  selectedCategory === 'all'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-black/30 text-green-400 hover:bg-green-500/5'
                }`}
              >
                [ ALL ]
              </button>
              
              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 text-xs font-medium transition-all border border-green-500/20 rounded-sm ${
                    selectedCategory === category.id
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-black/30 text-green-400 hover:bg-green-500/5'
                  }`}
                >
                  [ {category.name} ]
                </button>
              ))}
              
              {/* Add Category Button */}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all border border-green-500/20 rounded-sm flex items-center gap-1"
              >
                <PlusCircle size={12} />
                [ ADD ]
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <p className="text-green-400">NO LINKS FOUND</p>
              <p className="text-green-500/50 text-sm mt-1">TRY ADJUSTING FILTERS OR ADD NEW LINK</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-green-500/20">
          <div className="flex justify-around items-center h-14 px-4">
            {/* List Tab */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center text-green-500 hover:text-green-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1">LIST</span>
            </Link>

            {/* Add Tab */}
            <Link
              href="/add"
              className="flex flex-col items-center justify-center text-green-500 hover:text-green-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs mt-1">ADD</span>
            </Link>

            {/* Search Tab */}
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder="search..."]') as HTMLInputElement | null;
                if (searchInput) {
                  searchInput.focus();
                }
              }}
              className="flex flex-col items-center justify-center text-green-500 hover:text-green-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs mt-1">SEARCH</span>
            </button>
          </div>
        </nav>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={loadData}
      />
    </>
  )
}

function LinkCard({ link }: { link: LinkWithCategory }) {
  // Ensure URL has a protocol prefix
  const getFullUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  const fullUrl = getFullUrl(link.url)

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-black/20 border-b border-green-500/20 py-4 px-2 hover:bg-green-500/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-green-500 truncate text-sm">{link.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {link.source && (
              <p className="text-xs text-green-400">{link.source}</p>
            )}
            <p className="text-xs text-green-500/50">
              {new Date(link.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {link.notes && (
            <p className="text-xs text-green-400 mt-1 line-clamp-2">{link.notes}</p>
          )}
          {link.category && (
            <span
              className="inline-block mt-1 px-2 py-0.5 text-xs rounded-sm text-green-500 border border-green-500/20"
            >
              {link.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ExternalLink size={16} className="text-green-400" />
          <Link
            href={`/link/${link.id}`}
            className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit2 size={16} />
          </Link>
        </div>
      </div>
    </a>
  )
}
