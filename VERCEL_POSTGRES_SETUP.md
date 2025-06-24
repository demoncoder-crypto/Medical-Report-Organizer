# Vercel Postgres Setup Guide

## 🚀 Quick Deployment to Vercel with Database

Follow these steps to deploy MediVault Pro to Vercel with a fully configured Postgres database.

### Step 1: Deploy to Vercel

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy the project
vercel --prod
```

### Step 2: Add Vercel Postgres Database

1. **Go to your Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (medivault-pro or similar)
3. **Go to the "Storage" tab**
4. **Click "Create Database"**
5. **Select "Postgres"**
6. **Choose your region** (closest to your users)
7. **Click "Create"**

### Step 3: Environment Variables (Auto-configured)

Vercel will automatically add these environment variables when you create the database:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 4: Add Your API Keys

In your Vercel project settings, add:

```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Step 5: Redeploy

```bash
vercel --prod
```

## 🎯 Database Schema

The app will automatically create this table on first run:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  doctor TEXT,
  hospital TEXT,
  summary TEXT,
  tags TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Local Development with Database

To test with the database locally:

1. **Copy environment variables** from Vercel dashboard
2. **Create `.env.local`**:
```bash
POSTGRES_URL="your_vercel_postgres_url"
GEMINI_API_KEY="your_api_key"
```

3. **Run locally**:
```bash
npm run dev
```

## ✅ Features That Work After Deployment

- ✅ **Document Upload & Storage** - Saved to Postgres
- ✅ **AI Document Analysis** - Using Google Gemini
- ✅ **OCR Text Extraction** - Client-side with Tesseract.js
- ✅ **Medical Intelligence** - RAG search, clinical insights
- ✅ **Document Search** - Full-text search across all documents
- ✅ **Real-time Analytics** - Document statistics and trends
- ✅ **Persistent Storage** - All data saved to database

## 🚨 Important Notes

1. **Database Auto-Creation**: Tables are created automatically on first API call
2. **Fallback System**: If database fails, app falls back to demo data
3. **Cost**: Vercel Postgres has a free tier, then usage-based pricing
4. **Performance**: Uses connection pooling for optimal performance

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

### Local Development Issues
```bash
# Ensure environment variables are set
cat .env.local

# Restart development server
npm run dev
```

## 📊 Database Monitoring

Monitor your database usage in:
- **Vercel Dashboard** → **Storage** → **Postgres** → **Usage**
- Set up alerts for usage limits
- Monitor query performance

## 🎉 You're All Set!

Your MediVault Pro application is now running with:
- ✅ **Production database** (Vercel Postgres)
- ✅ **AI-powered document analysis**
- ✅ **OCR text extraction**
- ✅ **Full medical intelligence suite**
- ✅ **Scalable cloud infrastructure**

Visit your deployed app and start uploading medical documents! 