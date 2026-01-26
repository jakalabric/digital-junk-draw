import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be provided')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Link {
  id: string
  url: string
  title: string
  notes: string | null
  source: string | null
  category_id: string | null
  created_at: string
}

export interface LinkWithCategory extends Link {
  category: Category | null
}