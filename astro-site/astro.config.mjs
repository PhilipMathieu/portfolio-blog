// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
// Mermaid handled client-side; no rehype plugin needed
// Iframe handling is done client-side in BlogPost.astro

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://philipmathieu.com',
  integrations: [
    mdx({}),
    sitemap(),
  ],
  markdown: {},

  vite: {
    plugins: [tailwindcss()],
  },
});