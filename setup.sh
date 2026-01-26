#!/bin/bash

# DigitalJunkDraw Setup Script
# This script helps you set up the project for the first time

echo "🚀 Setting up DigitalJunkDraw..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your Supabase credentials"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your Supabase URL and anon key"
echo "2. Run the SQL migration in supabase-migration.md in your Supabase dashboard"
echo "3. Start the development server: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"