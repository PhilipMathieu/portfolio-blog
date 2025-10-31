# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ✍️ Writing posts from Obsidian

Export or copy your Markdown/MDX files from Obsidian into `src/content/blog/`.

Frontmatter required by this project:

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

Images:
- Put images under `public/images/` and reference them with `/images/...` in Markdown.
- Or place images next to your note and reference them relatively. For portability, `/images/...` is recommended.

Drafts:
- Any note with `draft: true` will be excluded from the blog index and can be previewed locally.

Local dev:
- `npm run dev` → open `http://localhost:4321`

Build:
- `npm run build` → outputs to `dist/`

## 👀 Want to learn more?

Check out [Astro documentation](https://docs.astro.build) or jump into the [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
