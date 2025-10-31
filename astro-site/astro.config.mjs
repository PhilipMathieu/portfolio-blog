// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
// Mermaid handled client-side; no rehype plugin needed

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://example.com',
  integrations: [
    mdx({}),
    sitemap(),
  ],
  markdown: {},

  vite: {
    plugins: [tailwindcss()],
  },
});