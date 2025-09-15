# UmamusumeDB - Umamusume Pretty Derby Database

A comprehensive database and tools platform for Umamusume Pretty Derby, built with Astro and Cloudflare Workers.

## 🌟 Features

- **Character Database**: Browse all Uma Musume characters with detailed stats
- **Support Card Database**: Complete collection of support cards with effects
- **Tier Lists**: Community-voted rankings for characters and support cards
- **Responsive Design**: Mobile-friendly interface with Umamusume-themed styling
- **Fast Performance**: Edge-deployed on Cloudflare Workers

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Export database to JSON (required first time)
node scripts/export-to-json.js

# Build the project
npm run build

# Start development server with Wrangler
npx wrangler pages dev ./dist --port 3000 --compatibility-flags nodejs_compat
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=umamusumedb
```

## 📊 Data Management

The project uses a local SQLite database during development that gets exported to static JSON files for deployment:

```bash
# Update character data
node scripts/collect-characters.js

# Update support card data
node scripts/collect-support-cards.js

# Update skill data
node scripts/collect-skills.js

# Create tier list data
node scripts/create-tier-lists.js

# Export all data to JSON
node scripts/export-to-json.js
```

## 🛠 Tech Stack

- **Frontend**: Astro, React, Tailwind CSS
- **Backend**: Hono (Edge-first framework)
- **Database**: SQLite (dev) → JSON (production)
- **Deployment**: Cloudflare Pages + Workers
- **Storage**: Cloudflare R2 (for images)
- **Cache**: Cloudflare KV

## 📁 Project Structure

```
umamusumedb/
├── src/
│   ├── pages/          # Astro pages
│   ├── components/     # React components
│   ├── api/           # Hono API routes
│   └── lib/           # Utilities
├── database/          # Database schema and seeds
├── scripts/           # Data collection scripts
├── public/
│   └── data/         # Static JSON data
└── dist/             # Build output
```

## 🎨 Design

The site features a Umamusume-themed design with:
- Pink/Purple gradient color scheme
- Horseshoe logo
- Glass morphism effects
- Animated elements
- Responsive grid layouts

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This is a fan-made project and is not affiliated with Cygames or the official Umamusume Pretty Derby game.