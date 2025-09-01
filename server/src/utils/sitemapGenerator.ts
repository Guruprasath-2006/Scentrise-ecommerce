// Sitemap Generator for SEO
// This file should be placed in the server/src/utils directory and used to generate sitemaps

import fs from 'fs';
import path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl: string = 'https://scentrise.com') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  addUrl(url: SitemapUrl) {
    this.urls.push({
      ...url,
      loc: this.baseUrl + url.loc,
    });
  }

  addStaticUrls() {
    const staticPages = [
      {
        loc: '/',
        changefreq: 'daily' as const,
        priority: 1.0,
        lastmod: new Date().toISOString().split('T')[0],
      },
      {
        loc: '/catalog',
        changefreq: 'daily' as const,
        priority: 0.9,
        lastmod: new Date().toISOString().split('T')[0],
      },
      {
        loc: '/about',
        changefreq: 'monthly' as const,
        priority: 0.7,
      },
      {
        loc: '/contact',
        changefreq: 'monthly' as const,
        priority: 0.6,
      },
      {
        loc: '/privacy-policy',
        changefreq: 'yearly' as const,
        priority: 0.3,
      },
      {
        loc: '/terms-of-service',
        changefreq: 'yearly' as const,
        priority: 0.3,
      },
      {
        loc: '/shipping-policy',
        changefreq: 'monthly' as const,
        priority: 0.4,
      },
      {
        loc: '/return-policy',
        changefreq: 'monthly' as const,
        priority: 0.4,
      },
      {
        loc: '/faq',
        changefreq: 'weekly' as const,
        priority: 0.5,
      },
    ];

    staticPages.forEach(page => this.addUrl(page));
  }

  async addProductUrls() {
    try {
      // This would typically fetch from your database
      // For now, we'll add example product URLs
      const products = [
        { _id: '1', slug: 'chanel-no-5', updatedAt: new Date('2024-01-15') },
        { _id: '2', slug: 'dior-sauvage', updatedAt: new Date('2024-01-20') },
        { _id: '3', slug: 'tom-ford-black-orchid', updatedAt: new Date('2024-01-25') },
      ];

      products.forEach(product => {
        this.addUrl({
          loc: `/product/${product.slug}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: product.updatedAt.toISOString().split('T')[0],
        });
      });
    } catch (error) {
      console.error('Error adding product URLs to sitemap:', error);
    }
  }

  addCategoryUrls() {
    const categories = [
      'mens-perfume',
      'womens-perfume',
      'unisex-perfume',
      'luxury-perfume',
      'designer-perfume',
      'niche-perfume',
      'eau-de-parfum',
      'eau-de-toilette',
      'cologne',
    ];

    categories.forEach(category => {
      this.addUrl({
        loc: `/catalog?category=${category}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0],
      });
    });
  }

  addBrandUrls() {
    const brands = [
      'chanel',
      'dior',
      'tom-ford',
      'creed',
      'versace',
      'calvin-klein',
      'hugo-boss',
      'armani',
      'ysl',
      'gucci',
    ];

    brands.forEach(brand => {
      this.addUrl({
        loc: `/catalog?brand=${brand}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: new Date().toISOString().split('T')[0],
      });
    });
  }

  generateXML(): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  async saveSitemap(outputPath: string = './public/sitemap.xml') {
    try {
      // Add all URL types
      this.addStaticUrls();
      await this.addProductUrls();
      this.addCategoryUrls();
      this.addBrandUrls();

      const xml = this.generateXML();
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, xml, 'utf-8');
      console.log(`Sitemap generated successfully at ${outputPath}`);
      
      return xml;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /checkout/
Disallow: /profile/
Disallow: /order/

# Allow CSS and JS
Allow: /static/
Allow: /*.css$
Allow: /*.js$

# Crawl delay (optional)
Crawl-delay: 1`;
  }

  async saveRobotsTxt(outputPath: string = './public/robots.txt') {
    try {
      const robotsTxt = this.generateRobotsTxt();
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, robotsTxt, 'utf-8');
      console.log(`Robots.txt generated successfully at ${outputPath}`);
      
      return robotsTxt;
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      throw error;
    }
  }
}

// Usage example:
export const generateSEOFiles = async () => {
  const sitemap = new SitemapGenerator('https://scentrise.com');
  
  try {
    await sitemap.saveSitemap();
    await sitemap.saveRobotsTxt();
    console.log('SEO files generated successfully');
  } catch (error) {
    console.error('Error generating SEO files:', error);
  }
};

// Express route for dynamic sitemap generation
export const sitemapRoute = async (req: any, res: any) => {
  try {
    const sitemap = new SitemapGenerator('https://scentrise.com');
    sitemap.addStaticUrls();
    await sitemap.addProductUrls();
    sitemap.addCategoryUrls();
    sitemap.addBrandUrls();

    const xml = sitemap.generateXML();
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

export default SitemapGenerator;
