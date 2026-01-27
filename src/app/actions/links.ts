'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
  const title = formData.get('title') || 'Untitled'
  const categoryId = formData.get('category_id') as string
  const description = formData.get('description') || ''

  // Simplify source field to avoid scraping issues
  let source = 'Manual'
  try {
    if (url) {
      const urlObj = new URL(url)
      source = urlObj.hostname.replace('www.', '')
    }
  } catch (e) {
    source = 'Manual'
  }
 
  // Ensure title has a fallback
  const finalTitle = title || url || 'Untitled'
 
  // Default category to a hard-coded fallback ID if none selected
  let finalCategoryId = categoryId
  if (!finalCategoryId) {
    // Hard-code a fallback category ID that definitely exists in the Supabase 'categories' table
    finalCategoryId = '1' // Replace with an actual category ID from your database
  }
 
  try {
    console.log('Saving link:', { url, title: finalTitle, notes: description || null, source, category_id: finalCategoryId })
    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          url,
          title: finalTitle,
          notes: description || null,
          source,
          category_id: finalCategoryId
        }
      ])
      .select()
      .single()
 
    console.log('Database response:', { data, error })
 
    if (error) {
      console.error('Supabase Error:', error)
      throw new Error(JSON.stringify(error))
    }
 
    // Revalidate the home page to refresh the list
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to add link' }
  }
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