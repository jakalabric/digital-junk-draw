'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ExternalLink, Edit2, PlusCircle } from 'lucide-react'
import { getCategories, getLinks } from './actions/links'
import { Category, LinkWithCategory } from '@/lib/supabase'
import Link from 'next/link'
import CategoryModal from './components/CategoryModal'

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
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">DigitalJunkDraw</h1>
              <Link
                href="/add"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Link</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search links by title or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </header>

        {/* Category Bar */}
        <div className="sticky top-[120px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2 items-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : undefined,
                    color: selectedCategory === category.id ? 'white' : undefined
                  }}
                >
                  {category.name}
                </button>
              ))}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all flex items-center gap-1"
              >
                <PlusCircle size={14} />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No links found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new link</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </main>

        {/* Floating Action Button (Mobile) */}
        <Link
          href="/add"
          className="fixed bottom-6 right-6 sm:hidden flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        >
          <Plus size={24} />
        </Link>
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
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-blue-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{link.title}</h3>
          {link.source && (
            <p className="text-sm text-gray-500 mt-1">{link.source}</p>
          )}
          {link.notes && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{link.notes}</p>
          )}
          {link.category && (
            <span
              className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: link.category.color }}
            >
              {link.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ExternalLink size={18} className="text-gray-400" />
          <Link
            href={`/link/${link.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit2 size={18} />
          </Link>
        </div>
      </div>
    </a>
  )
}
