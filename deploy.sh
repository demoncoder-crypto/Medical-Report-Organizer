#!/bin/bash

echo "🚀 Deploying MediVault Pro to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add a Postgres database in the Storage tab"
echo "3. Add your GEMINI_API_KEY environment variable"
echo "4. Your app will be ready to use!"
echo ""
echo "📖 See VERCEL_POSTGRES_SETUP.md for detailed instructions" 