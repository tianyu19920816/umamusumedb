import type { APIRoute } from 'astro';
import { characters, supportCards } from '@/lib/static-content';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://umamusumedb.com';
  
  // Static pages
  const staticPages = [
    '',
    '/characters',
    '/cards', 
    '/tier-list',
    '/tools',
    '/tools/factor-calculator',
    '/tools/training-calculator',
    '/tools/support-deck',
    '/tools/training-goals',
    '/tools/skill-builder',
    '/ja',
    '/ja/characters'
  ];

  // Dynamic character pages (both EN and JA)
  const characterPages = characters.flatMap(char => [
    `/characters/${char.id}`,
    `/ja/characters/${char.id}`
  ]);

  // Dynamic support card pages
  const cardPages = supportCards.map(card => `/cards/${card.id}`);

  // Combine all pages
  const allPages = [...staticPages, ...characterPages, ...cardPages];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages.map(page => {
    const url = `${siteUrl}${page}`;
    const priority = getPriority(page);
    const changefreq = getChangeFreq(page);
    const lastmod = new Date().toISOString().split('T')[0];
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

function getPriority(page: string): string {
  if (page === '') return '1.0';
  if (page === '/characters' || page === '/cards' || page === '/tier-list') return '0.9';
  if (page === '/tools' || page.includes('/tools/')) return '0.9';
  if (page === '/ja' || page === '/ja/characters') return '0.8';
  if (page.includes('/characters/') || page.includes('/cards/')) return '0.7';
  return '0.5';
}

function getChangeFreq(page: string): string {
  if (page === '' || page === '/tier-list') return 'daily';
  if (page === '/characters' || page === '/cards') return 'weekly';
  if (page.includes('/ja')) return 'weekly';
  return 'monthly';
}