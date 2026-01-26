# Supabase Database Schema Migration

## Overview
This document contains the SQL migration for the DigitalJunkDraw PWA database schema.

## Tables

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Links Table
```sql
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    source TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Policies
```sql
-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies (single user app - allow all operations)
CREATE POLICY "Allow all operations on categories" ON categories
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on links" ON links
    FOR ALL USING (true);
```

## Indexes for Performance
```sql
CREATE INDEX idx_links_category_id ON links(category_id);
CREATE INDEX idx_links_created_at ON links(created_at);
CREATE INDEX idx_categories_name ON categories(name);
```

## Default Categories
```sql
INSERT INTO categories (name, color) VALUES
    ('All', '#6B7280'),
    ('Recipes', '#EF4444'),
    ('Tech', '#3B82F6'),
    ('Articles', '#10B981'),
    ('Videos', '#8B5CF6'),
    ('Shopping', '#F59E0B');
```

## Setup Instructions

1. **Create Supabase Project**
   - Go to supabase.com and create a new project
   - Get your project URL and anon key from the dashboard

2. **Run Migration**
   - Copy the SQL above into the Supabase SQL editor
   - Execute the migration to create tables and policies

3. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your `.env.local` file