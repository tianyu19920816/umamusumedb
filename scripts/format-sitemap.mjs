import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Format XML with proper indentation
function formatXML(xml) {
  let formatted = '';
  let indent = 0;

  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent--; // Closing tag
    formatted += '  '.repeat(indent) + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent++; // Opening tag
  });

  return formatted.substring(1, formatted.length - 2);
}

// Read and format sitemap files
const distDir = path.join(__dirname, '../dist');

try {
  // Format sitemap-index.xml
  const indexPath = path.join(distDir, 'sitemap-index.xml');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const formatted = formatXML(indexContent);
    fs.writeFileSync(indexPath, formatted, 'utf-8');
    console.log('✓ Formatted sitemap-index.xml');
  }

  // Format sitemap-0.xml
  const sitemap0Path = path.join(distDir, 'sitemap-0.xml');
  if (fs.existsSync(sitemap0Path)) {
    const sitemap0Content = fs.readFileSync(sitemap0Path, 'utf-8');
    const formatted = formatXML(sitemap0Content);
    fs.writeFileSync(sitemap0Path, formatted, 'utf-8');
    console.log('✓ Formatted sitemap-0.xml');
  }

  console.log('✨ Sitemap formatting complete!');
} catch (error) {
  console.error('Error formatting sitemaps:', error);
  process.exit(1);
}