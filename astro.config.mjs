// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://redlineinstallers.com',
  integrations: [
    preact({ compat: false }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => !page.includes('/tools/rack-inspection'),
      serialize: (item) => {
        if (item.url === 'https://redlineinstallers.com/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (item.url.includes('/services/')) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        if (item.url.includes('/industries/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        if (item.url.includes('/projects/')) {
          return { ...item, priority: 0.7, changefreq: 'monthly' };
        }
        if (
          item.url.includes('/about') ||
          item.url.includes('/contact') ||
          item.url.includes('/quote') ||
          item.url.includes('/service-area')
        ) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        return { ...item, priority: 0.5, changefreq: 'yearly' };
      },
    }),
    icon({ iconDir: 'src/icons' }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
