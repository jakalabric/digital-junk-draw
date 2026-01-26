'use server'

import { supabase } from '@/lib/supabase'

// Fetch URL metadata from a webpage
export async function fetchUrlMetadata(url: string) {
  try {
    // Use a CORS proxy or your own backend to fetch the page
    // For demo purposes, we'll use a simple approach
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    // Parse HTML to extract title
    const html = data.contents
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : url
    
    // Extract source from URL
    const source = new URL(url).hostname.replace('www.', '')
    
    return {
      title,
      source,
      success: true
    }
  } catch (error) {
    console.error('Error fetching URL metadata:', error)
    return {
      title: url,
      source: new URL(url).hostname.replace('www.', ''),
      success: false
    }
  }
}

// Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

// Create a new category
export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const color = formData.get('color') as string

  if (!name || !color) {
    throw new Error('Name and color are required')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name,
        color
      }
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get all links with optional filters
export async function getLinks(categoryId?: string | null, searchQuery?: string) {
  let query = supabase
    .from('links')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Get a single link by ID
export async function getLink(id: string) {
  const { data, error } = await supabase
    .from('links')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Add a new link
export async function addLink(formData: FormData) {
  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const notes = formData.get('notes') as string
  const source = formData.get('source') as string
  const categoryId = formData.get('category_id') as string

  const { data, error } = await supabase
    .from('links')
    .insert([
      {
        url,
        title,
        notes: notes || null,
        source: source || null,
        category_id: categoryId || null
      }
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Update a link
export async function updateLink(id: string, formData: FormData) {
  const notes = formData.get('notes') as string
  const categoryId = formData.get('category_id') as string

  const { data, error } = await supabase
    .from('links')
    .update({
      notes: notes || null,
      category_id: categoryId || null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Delete a link
export async function deleteLink(id: string) {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}