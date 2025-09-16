# UmamusumeDB - Uma Musume Pretty Derby Database

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive database and tools platform for Uma Musume Pretty Derby, built with modern web technologies and powered by open-source data.

🌐 **Live Site**: [https://umamusumedb.com](https://umamusumedb.com)

## Features

- 📊 **Complete Character Database** - Browse all Uma Musume with detailed stats and skills
- 🎴 **Support Card Collection** - Filter and search support cards with effects
- 🏆 **Tier Lists** - Community-driven rankings for characters and cards
- 🌍 **Multi-language Support** - English and Japanese interfaces
- ⚡ **Lightning Fast** - Static site with CDN distribution
- 📱 **Mobile Friendly** - Responsive design for all devices

## Tech Stack

- **Frontend Framework**: [Astro](https://astro.build) (Static Site Generator)
- **UI Components**: React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Development) → Static JSON (Production)
- **Analytics**: Google Analytics

## Data Sources & Credits

This project wouldn't be possible without these amazing open-source projects:

### Primary Data Sources

- **[UmaMusumeAPI](https://github.com/SimpleSandman/UmaMusumeAPI)** - Community REST API based on Uma Musume: Pretty Derby's master.mdb file
  - Provides accurate game data including character stats, support cards, and skills
  - Maintained by SimpleSandman

- **[umamusume-db-translate](https://github.com/FabulousCupcake/umamusume-db-translate)** - Translation database for Uma Musume Pretty Derby
  - Comprehensive translations for game content
  - Browser-based master.mdb manipulation tools
  - Maintained by FabulousCupcake

### Special Thanks

We extend our gratitude to:
- The Uma Musume Pretty Derby community for continuous support
- All contributors to the open-source projects we depend on
- Cygames for creating this amazing game

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite3

### Setup

1. Clone the repository:
```bash
git clone https://github.com/tianyu19920816/umamusumedb.git
cd umamusumedb
```

2. Install dependencies:
```bash
npm install
```

3. Export data to JSON:
```bash
node scripts/export-to-json.js
```

4. Start development server:
```bash
npm run dev
```

## Development

### Project Structure

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
└── dist/             # Build output (static files)
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Data Management
node scripts/export-to-json.js       # Export to JSON files
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Data Accuracy

We strive to maintain accurate game data by:
- Using verified open-source data sources
- Community validation and feedback
- Regular updates from game data

If you find any data discrepancies, please [open an issue](https://github.com/tianyu19920816/umamusumedb/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial fan-made project. Uma Musume Pretty Derby and all related content are property of Cygames. This project is not affiliated with or endorsed by Cygames.

All game data is sourced from publicly available information and open-source projects. We respect intellectual property rights and will promptly address any concerns.

---

Made with ❤️ by the Uma Musume community