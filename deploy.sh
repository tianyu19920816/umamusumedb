#!/bin/bash

# UmamusumeDB Deployment Script
# Deploys static site to Cloudflare Pages

echo "🚀 Starting UmamusumeDB deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Step 1: Export data to JSON
echo "📊 Exporting database to JSON..."
node scripts/export-to-json.js

# Step 2: Build the static site
echo "🔨 Building static site..."
npm run build

# Step 3: Check build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

# Step 4: Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."

if [ "$1" == "preview" ]; then
    echo "📝 Deploying to preview branch..."
    npx wrangler pages deploy dist \
        --project-name=umamusumedb \
        --branch=preview
else
    echo "🚀 Deploying to production..."
    npx wrangler pages deploy dist \
        --project-name=umamusumedb \
        --branch=main
fi

# Step 5: Success message
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site will be available at:"
    echo "   Production: https://umamusumedb.pages.dev"
    if [ "$1" == "preview" ]; then
        echo "   Preview: https://preview.umamusumedb.pages.dev"
    fi
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi