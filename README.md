[![Deployment](https://img.shields.io/badge/deployment-cloudflare_pages-blue)](https://pages.cloudflare.com)

# Portfolio Blog

A modern portfolio and blog site built with [Astro](https://astro.build/), featuring fast static site generation, Markdown/MDX support, and optimized performance.

$~$

## 🚀 Project Structure

This is a monorepo containing:

```
portfolio-blog/
├── astro-site/          # Main Astro site (current)
│   ├── src/
│   │   ├── components/  # Astro components
│   │   ├── content/     # Blog posts (Markdown/MDX)
│   │   ├── layouts/     # Page layouts
│   │   └── pages/       # Site pages
│   ├── public/          # Static assets
│   └── dist/            # Build output
├── oldsite/             # Previous Next.js site (archived)
├── migrations/          # Content migration tools
└── docs/                # Documentation
```

$~$

## ✨ Features

- ✅ **Fast & Modern**: Built with Astro for optimal performance
- ✅ **100/100 Lighthouse** performance scores
- ✅ **SEO-friendly** with canonical URLs and OpenGraph data
- ✅ **RSS Feed** support
- ✅ **Sitemap** generation
- ✅ **Markdown & MDX** support with syntax highlighting
- ✅ **Mermaid diagrams** support
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling

$~$

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (recommended: use the version specified in `.nvmrc` if available)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PhilipMathieu/portfolio-blog.git
cd portfolio-blog
```

2. Navigate to the Astro site directory:
```bash
cd astro-site
```

3. Install dependencies:
```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

$~$

## 🧞 Commands

All commands are run from the `astro-site/` directory:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |

$~$

## ✍️ Writing Blog Posts

Blog posts are written in Markdown or MDX and stored in `astro-site/src/content/blog/`.

### Frontmatter

Each post requires the following frontmatter:

```md
---
title: My Post Title
description: One-sentence summary for cards and SEO
pubDate: 2025-01-01
updatedDate: 2025-01-02 # optional
draft: true # optional; omit or set false to publish
tags: [astro, notes] # optional
heroImage: /images/cover.jpg # optional; put file under public/images
---

Your content here...
```

### Images

- Put images under `public/images/` and reference them with `/images/...` in Markdown
- Or place images next to your note and reference them relatively

### Drafts

Any post with `draft: true` will be excluded from the blog index and can be previewed locally.

$~$

## 🚀 Deployment

This site is deployed on **Cloudflare Pages** using Git integration.

### Deployment Status

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com)

The site automatically deploys on every push to the main branch.

### Deployment Settings

For Cloudflare Pages, the following build settings are configured:

- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `astro-site`

See [`astro-site/DEPLOYMENT.md`](./astro-site/DEPLOYMENT.md) for detailed deployment instructions.

$~$

## 📚 Documentation

- [Astro Site Deployment Guide](./astro-site/DEPLOYMENT.md) - Detailed Cloudflare Pages setup
- [Cloudflare Pages Quick Reference](./astro-site/CLOUDFLARE-PAGES.md) - Quick deployment settings
- [Migration Guide](./migrations/README.md) - Content migration from Contentful

$~$

## 🏗️ Architecture

### Current Site (astro-site)

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS 4.x
- **Content**: Markdown/MDX files in `src/content/blog/`
- **Build**: Static site generation
- **Deployment**: Cloudflare Pages

### Legacy Site (oldsite)

The previous Next.js site is archived in the `oldsite/` directory. See [NETLIFY-DISABLE.md](./NETLIFY-DISABLE.md) for information about disabling the old Netlify deployment.

$~$

## 🛠️ Development

### Node Version

It is recommended to use the Node version listed in `.nvmrc` (if available). We recommend using [nvm](https://github.com/nvm-sh/nvm) to easily switch between Node versions.

### TypeScript

The project uses TypeScript for type safety. Run type checking with:

```bash
npm run astro check
```

$~$

## 📄 License

MIT License, see [LICENSE](./LICENSE).

$~$

## 🙏 Credits

- Built with [Astro](https://astro.build/)
- Theme inspired by [Bear Blog](https://github.com/HermanMartinus/bearblog/)
- Previously based on Contentful Blog Starter Template
