# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UmamusumeDB is a comprehensive database and tools platform for the game Umamusume: Pretty Derby, optimized for SEO around the "umamusumedb" keyword. The project is configured as a **static site** deployed to Cloudflare Pages.

**Live URL**: https://umamusumedb.com
**Pages URL**: https://umamusumedb.pages.dev
**Image CDN**: https://img.umamusumedb.com (Cloudflare R2 custom domain)

## Tech Stack

- **Frontend**: Astro (Static Site Generator) + React components + Tailwind CSS
- **Data Storage**: Static JSON files served via CDN
- **Image Storage**: Cloudflare R2 (Object storage)
- **Deployment**: Cloudflare Pages (Static hosting)
- **Build Tool**: Vite
- **Language**: TypeScript

## Project Structure

```
umamusumedb/
├── src/
│   ├── pages/          # Astro pages (static generation)
│   ├── components/     # React components
│   ├── layouts/        # Page layouts
│   ├── lib/           # Utilities and data fetching
│   └── styles/        # Global styles
├── public/
│   └── data/          # Static JSON data files
├── scripts/           # Data collection and export scripts
├── database/          # SQLite database (development only)
├── dist/             # Build output (static files)
└── astro.config.mjs   # Astro configuration
```

## Common Commands

```bash
# Development
npm install                    # Install dependencies
node scripts/export-to-json.js # Export database to JSON (required first time)
npm run dev                    # Start development server (http://localhost:4321)

# Build & Deploy
npm run build                  # Build static site
npm run preview                # Preview production build locally
npm run deploy                 # Deploy to Cloudflare Pages

# Data Management
node scripts/collect-characters.js    # Update character data
node scripts/collect-support-cards.js # Update support card data
node scripts/collect-skills.js        # Update skills data
node scripts/create-tier-lists.js     # Create tier list data
node scripts/export-to-json.js        # Export all data to JSON (rebuild JSON files)
node scripts/update-image-urls.js     # Update image URLs to custom domain
```

## Core Architecture (Static Site)

### Data Flow
1. **Build Time**: SQLite database → JSON export → Static files
2. **Runtime**: Static HTML + JSON files served from CDN
3. **Client-Side**: React components fetch and display JSON data
4. **CDN**: All assets cached at Cloudflare edge locations

### Key Features
- **Characters Page**: Browse all Uma Musume with stats and skills
- **Support Cards**: Filter and search support cards
- **Tier Lists**: Community rankings with voting
- **Search**: Client-side search across all data

### Performance Strategy
- Pre-rendered HTML for instant page loads
- JSON data cached at CDN edge
- Client-side filtering and sorting
- Lazy loading for images

## Deployment to Cloudflare Pages

### Environment Variables
```env
R2_ACCESS_KEY_ID=<configured>
R2_SECRET_ACCESS_KEY=<configured>
R2_BUCKET_NAME=umamusume
R2_PUBLIC_URL=https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev
CLOUDFLARE_API_TOKEN=<configured>
CLOUDFLARE_ACCOUNT_ID=<configured>
```

### Image Storage Configuration
- **R2 Bucket**: umamusume
- **Custom Domain**: img.umamusumedb.com (configured in Cloudflare R2 settings)
- **Image URLs**: All images should use `https://img.umamusumedb.com/` prefix
- **Update Script**: `node scripts/update-image-urls.js` (updates database URLs from R2 default to custom domain)

### Manual Deployment
```bash
npm run build
npm run deploy  # Uses wrangler pages deploy
```

### Architecture Decision (January 2025)
**Staying with Cloudflare Pages** - Not migrating to Workers because:
- Pure static site with no server-side requirements
- Pages provides simpler deployment for static content
- Already successfully deployed and working at https://umamusumedb.pages.dev
- No immediate benefits from Workers for this use case

## Why Static Site Architecture?

1. **Performance**: Static files served from CDN edge locations (< 50ms latency)
2. **Cost**: No compute costs, only storage and bandwidth
3. **Reliability**: No server to maintain or scale
4. **SEO**: Pre-rendered HTML for search engines
5. **Simplicity**: Single deployment to Cloudflare Pages
6. **Scalability**: Can handle millions of requests with CDN

## Data Management

### Current Data
- **Characters**: 60 entries with full stats and skills
- **Support Cards**: 25 entries with effects
- **Skills**: 47 unique skills
- **Tier Lists**: 284 entries across multiple categories

### Updating Data
1. Run collection scripts to update SQLite database
2. Export to JSON: `node scripts/export-to-json.js`
3. Build and deploy: `npm run build && npx wrangler pages deploy dist`

## Common Issues and Solutions

### Data Not Loading
- Ensure JSON files exist in `public/data/`
- Run `node scripts/export-to-json.js` before building
- Check browser console for 404 errors

### Build Errors
- Clear cache: `rm -rf dist .astro node_modules`
- Reinstall: `npm install`
- Ensure Node.js version is 18+

### Cloudflare Pages Issues
- Build output must be in `dist` directory
- No server-side features allowed
- All data must be static JSON files

### Image 403 Errors
If images return 403 errors, ensure they use the custom domain:
1. Check R2 custom domain is active in Cloudflare: Settings > Custom Domains > img.umamusumedb.com
2. Update database image URLs: `node scripts/update-image-urls.js`
3. Re-export data: `node scripts/export-to-json.js`
4. Deploy: `npm run deploy`
- **Note**: Always use `https://img.umamusumedb.com/` not the R2 default domain

## Performance Targets

- Page load: < 1 second (static HTML)
- Data fetch: < 100ms (CDN cached JSON)
- Support unlimited users (CDN scales automatically)

## SEO Optimization

- Target keyword: "umamusumedb"
- Static HTML for search engine crawlers
- Structured data for rich snippets
- Multi-language support (EN/JP/ZH)

## Future Enhancements

- Upload actual character/card images to R2
- Implement user voting system for tier lists
- Add more detailed guides and strategy content
- Enhance mobile app experience
- Add sitemap.xml for better SEO