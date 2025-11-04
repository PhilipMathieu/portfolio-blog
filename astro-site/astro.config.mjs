// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
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
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          throwOnError: false,
          strict: false,
        },
      ], // KaTeX must run before pretty-code to process math blocks
      [
        rehypePrettyCode,
        {
          theme: 'github-light',
          keepBackground: false,
        },
      ],
    ],
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});