# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog at philipmathieu.com. Monorepo with the active site in `astro-site/` (Astro 5.x, static output, Cloudflare Pages).

## Commands

All commands run from `astro-site/`:

```bash
cd astro-site
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to dist/
npm run preview   # Preview production build
npx astro check   # TypeScript type checking
```

**Pre-commit hooks** (Husky): runs `yarn type-check && yarn lint-staged` on commit and push.

## Architecture

- **Framework**: Astro 5.x with static output, deployed via Cloudflare Pages adapter
- **Styling**: Tailwind CSS 4.x (via `@tailwindcss/vite` plugin, not PostCSS)
- **Content**: Markdown/MDX files in `src/content/blog/`, validated by Zod schema in `src/content.config.ts`
- **Routing**: File-based via `src/pages/`. Blog posts use dynamic route `blog/[...slug].astro`

### Key directories (under `astro-site/src/`)

- `content/blog/` - Blog posts (.md/.mdx) with required frontmatter: `title`, `description`, `pubDate`
- `content/pages/` - Standalone content like the NLP Glossary
- `layouts/BlogPost.astro` - Single layout wrapping all posts and pages
- `utils/` - Gradient generation, glossary parsing, markdown rendering (unified/rehype pipeline)
- `styles/global.css` - Tailwind theme tokens and prose styling

### Markdown pipeline

Posts go through: remark-math → remark-gfm → rehype → rehype-katex → rehype-pretty-code (github-light theme). Configuration is in `astro.config.mjs`. A separate unified pipeline in `utils/markdownRenderer.ts` handles glossary term rendering.

### Content features

- **Math**: LaTeX via remark-math + rehype-katex (MathML output)
- **Code blocks**: rehype-pretty-code with copy buttons (`CopyButtonInit.astro`)
- **Diagrams**: Mermaid.js rendered client-side (`MermaidInit.astro`)
- **Hero images**: Optional; posts without one get a deterministic gradient (`utils/gradient.ts`)
- **Drafts**: `draft: true` in frontmatter excludes from blog index

### Design tokens

Custom color palette and typography defined in `styles/global.css`:
- Fonts: Inter (body), Newsreader (headings)
- Accent: `--color-primary-500: #CE112D`
- Links: `--color-link-500: #1D9ACC`

## Demo workflows for PR review

When a PR adds a visual or behavioural change that needs to be **seen** in review, build a walkthrough with [showboat](https://github.com/simonw/showboat). Capture screenshots, post the rendered markdown as a PR comment (not as a committed `.md`). See [`docs/agent-tools/showboat.md`](docs/agent-tools/showboat.md) — covers installation, the `--single-process` chromium flag needed to run headless inside Claude Code's macOS sandbox, the route-interception script for screenshotting static builds, and the conventions for hosting images via `screenshots/pr-<n>/` + `raw.githubusercontent.com`.
