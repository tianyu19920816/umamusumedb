import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    // Ensure assets are properly handled
    assets: 'assets',
    // Output directory for Cloudflare Pages
    outDir: './dist'
  }
});