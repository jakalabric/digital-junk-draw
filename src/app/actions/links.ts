'use server'

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
  const title = formData.get('title') as string
  const categoryId = formData.get('category_id') as string

  // Extract source from URL domain (or use 'Manual' as fallback)
  let source = 'Manual'
  try {
    const urlObj = new URL(url)
    source = urlObj.hostname.replace('www.', '')
  } catch (e) {
    source = 'Manual'
  }

  // Use URL as title if title is blank
  const finalTitle = title || url

  // Hard-code image as null
  const image = null

  // Default category to 'Junk' or first available category if none selected
  let finalCategoryId = categoryId
  if (!finalCategoryId) {
    // Try to find 'Junk' category first
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .or('name.eq.Junk,name.eq.junk')
      .limit(1)
      .single()
    
    if (!catError && categories) {
      finalCategoryId = categories.id
    } else {
      // If 'Junk' category doesn't exist, get the first available category
      const { data: firstCategory, error: firstCatError } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
        .single()
      
      if (!firstCatError && firstCategory) {
        finalCategoryId = firstCategory.id
      }
    }
  }

  const { data, error } = await supabase
    .from('links')
    .insert([
      {
        url,
        title: finalTitle,
        notes: null, // No notes field in simplified UI
        source,
        image, // Hard-coded to null
        category_id: finalCategoryId
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