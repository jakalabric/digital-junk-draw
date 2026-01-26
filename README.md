# DigitalJunkDraw - Personal Link Saver PWA

A single-user PWA for organizing and saving links with no authentication required. Built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: View all saved links with category filtering and search
- **Categories**: Organize links with color-coded categories
- **Add Links**: Paste a URL and auto-fetch the page title
- **Edit Links**: Update notes and change categories
- **Share Target**: Share links directly from other apps (TikTok, YouTube, etc.)
- **Mobile-First**: Optimized for mobile with PWA support
- **No Authentication**: Single-user app that loads directly into the dashboard

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **PWA**: Web App Manifest, Share Target API

## Project Structure

```
digital-junk-draw/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions for data operations
│   │   │   └── links.ts
│   │   ├── api/
│   │   │   └── share/        # Share target API route
│   │   │       └── route.ts
│   │   ├── add/              # Add link page
│   │   │   └── page.tsx
│   │   ├── link/
│   │   │   └── [id]/         # Link detail/edit page
│   │   │       └── page.tsx
│   │   ├── lib/
│   │   │   └── supabase.ts   # Supabase client and types
│   │   ├── layout.tsx        # Root layout with PWA meta tags
│   │   ├── page.tsx          # Dashboard (home page)
│   │   └── globals.css       # Global styles
│   └── ...
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── icon-192.png          # App icon (192x192)
│   └── icon-512.png          # App icon (512x512)
├── supabase-migration.md     # Database schema documentation
└── ...
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from the dashboard

2. **Run the Database Migration**
   - Copy the SQL from [`supabase-migration.md`](supabase-migration.md)
   - Paste it into the Supabase SQL editor
   - Execute the migration to create tables and policies

3. **Configure Environment Variables**
   - Create a `.env.local` file in the project root
   - Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   - Navigate to `http://localhost:3000`
   - The app will load directly into the dashboard

### 4. PWA Installation (Optional)

1. **Install on Mobile**
   - Open the app in your mobile browser
   - Look for "Add to Home Screen" in browser menu
   - The app will appear as a standalone app

2. **Share Target**
   - From any app that supports sharing (TikTok, YouTube, etc.)
   - Share a link and select "DigitalJunkDraw"
   - The app will open with the link pre-filled

## Database Schema

### Categories Table
```sql
id (UUID, Primary Key)
name (TEXT, Unique)
color (TEXT)
created_at (TIMESTAMPTZ)
```

### Links Table
```sql
id (UUID, Primary Key)
url (TEXT, Not Null)
title (TEXT, Not Null)
notes (TEXT, Nullable)
source (TEXT, Nullable)
category_id (UUID, Foreign Key to categories)
created_at (TIMESTAMPTZ)
```

## Usage

### Adding a Link

1. Click the "+" button (or "Add Link" on desktop)
2. Paste the URL - the title will auto-fetch
3. Add a source (e.g., "reddit.com", "youtube.com")
4. Select a category
5. Add optional notes
6. Click "Add Link"

### Editing a Link

1. Click the edit icon (✏️) on any link card
2. Update the category or notes
3. Click "Save Changes"
4. Or click "Delete Link" to remove it

### Searching & Filtering

- **Search**: Type in the search bar to find links by title or notes
- **Filter**: Click category buttons to filter by category
- **All**: Shows all links regardless of category

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker

## PWA Features

- **Offline Support**: Works offline after first visit
- **Installable**: Can be installed as a standalone app
- **Share Target**: Accepts shared links from other apps
- **Mobile-Optimized**: Touch-friendly UI with safe area support
- **App Icons**: Custom icons for home screen

## API Routes

### POST /api/share
Handles share target requests from other apps.

**Request Format:**
```json
{
  "title": "Link Title",
  "text": "Link description",
  "url": "https://example.com"
}
```

**Response:** Redirects to `/add` with pre-filled data

## Server Actions

### `fetchUrlMetadata(url)`
Fetches page title and source from a URL.

### `getCategories()`
Returns all categories.

### `getLinks(categoryId?, searchQuery?)`
Returns links with optional filtering.

### `getLink(id)`
Returns a single link by ID.

### `addLink(formData)`
Creates a new link.

### `updateLink(id, formData)`
Updates link notes and category.

### `deleteLink(id)`
Deletes a link.

## Customization

### Categories

Edit the default categories in the SQL migration file:

```sql
INSERT INTO categories (name, color) VALUES
    ('All', '#6B7280'),
    ('Recipes', '#EF4444'),
    ('Tech', '#3B82F6'),
    ('Articles', '#10B981'),
    ('Videos', '#8B5CF6'),
    ('Shopping', '#F59E0B');
```

### Colors

Update the theme color in:
- `public/manifest.json` - `theme_color`
- `src/app/layout.tsx` - `themeColor`
- Tailwind classes throughout the app

### Icons

Replace the placeholder icons:
- `public/icon-192.png` (192x192 PNG)
- `public/icon-512.png` (512x512 PNG)

## Troubleshooting

### "Supabase URL and anon key must be provided"
- Ensure `.env.local` file exists with correct variables
- Restart the dev server after adding environment variables

### "Failed to fetch URL metadata"
- Some websites block CORS requests
- The app uses a CORS proxy as a fallback
- Manual title entry is always available

### PWA not installing
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors
- Verify manifest.json is accessible at `/manifest.json`

## Development Notes

- The app uses server actions for all data operations
- No client-side Supabase SDK - all queries go through server actions
- Mobile-first design with responsive breakpoints
- TypeScript for type safety throughout
- Tailwind CSS for utility-first styling

## License

MIT License - feel free to use this as a template for your own projects!

## Support

For issues or questions, check the [Supabase documentation](https://supabase.com/docs) and [Next.js documentation](https://nextjs.org/docs).
