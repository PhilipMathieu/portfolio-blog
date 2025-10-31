# Contentful to Astro Migration

This directory contains scripts to migrate blog content from Contentful to Astro MDX format.

## Prerequisites

1. **Contentful CLI installed and authenticated**
   ```bash
   npm install -g contentful-cli
   contentful login
   ```

2. **Node.js dependencies**
   ```bash
   cd migrations
   npm install
   ```

## Environment Variables

Set these environment variables or pass them as arguments:

- `CONTENTFUL_SPACE_ID` - Your Contentful space ID
- `CONTENTFUL_MANAGEMENT_TOKEN` - Content Management API token (optional if you've run `contentful login`)

**Note**: If you've authenticated with `contentful login`, you don't need to provide a management token - the CLI will use your stored credentials automatically.

You can find your space ID and generate a management token in the [Contentful web app](https://app.contentful.com).

## Migration Steps

### Step 1: Export Content from Contentful

This will export your content model and all content entries, and download all assets.

```bash
# If logged in with 'contentful login', just provide space ID:
./export-content.sh <SPACE_ID>

# Or provide both space ID and token:
./export-content.sh <SPACE_ID> <CMA_TOKEN>
```

Or using environment variables:

```bash
export CONTENTFUL_SPACE_ID=your-space-id
# Optional if logged in:
# export CONTENTFUL_MANAGEMENT_TOKEN=your-token
./export-content.sh
```

This creates:
- `exports/content-model.json` - Your content model structure
- `exports/content-export.json` - All content entries
- `exports/assets/` - All downloaded assets

### Step 2: Convert to Astro MDX

This converts the exported Contentful content to Astro MDX format.

```bash
npm run convert
```

Or with custom paths:

```bash
tsx convert-to-astro.ts \
  exports/content-export.json \
  ../astro-site/src/content/blog \
  exports/assets
```

This will:
1. Read the exported content
2. Convert Rich Text to Markdown
3. Process embedded entries (images, videos, iframes)
4. Generate MDX files with proper frontmatter
5. Copy assets to `astro-site/public/assets/`

### Step 3: Validate and Build

```bash
cd ../astro-site
npm run build
```

Check for any errors and verify all content is correctly migrated.

## Generated MDX Format

Each blog post is converted to MDX with this structure:

```markdown
---
title: 'Post Title'
description: 'Post description'
pubDate: 'Jan 01 2024'
heroImage: '../../assets/image.jpg'
tags: ["tag1", "tag2"]
draft: false
updatedDate: 'Jan 02 2024'
---

[Markdown content here]
```

## Content Mapping

| Contentful Field | Astro Field | Notes |
|-----------------|-------------|-------|
| `slug` | filename | Converted to kebab-case filename |
| `title` | `title` | Direct mapping |
| `shortDescription` | `description` | Direct mapping |
| `publishedDate` | `pubDate` | Formatted to "Jan 01 2024" |
| `sys.updatedAt` | `updatedDate` | Optional, only if different from pubDate |
| `featuredImage` | `heroImage` | Asset copied to public/assets |
| `content` (Rich Text) | Markdown body | Converted with formatting preserved |
| `seoFields` | Not migrated | SEO handled separately in Astro |
| Draft status | `draft` | Set to true if unpublished |

## Rich Text Conversion

The migration handles:

- **Text formatting**: Bold, italic, underline, code
- **Headings**: H1-H6
- **Lists**: Ordered and unordered
- **Links**: Hyperlinks and asset links
- **Blockquotes**: Preserved
- **Embedded entries**:
  - `ComponentRichImage` → Markdown images
  - `ComponentVideoEmbed` → iframe tags
  - `ComponentIframe` → iframe tags

## Troubleshooting

### Missing Assets

If assets are not found, check:
1. Assets were downloaded during export (check `exports/assets/` directory)
2. Asset filenames match the Contentful file URLs

### Rich Text Conversion Issues

Some complex Rich Text structures may not convert perfectly. Review the generated MDX files and manually fix:
- Complex nested structures
- Custom embedded components not handled
- Special formatting

### Date Format Issues

Dates are converted to "Mon DD YYYY" format. If you need a different format, modify the `formatDate` function in `convert-to-astro.ts`.

## Notes

- **Backup**: Always backup your original Contentful content before migration
- **Testing**: Test the migration on a small subset of content first
- **Manual Review**: Review all generated MDX files for correctness
- **SEO**: SEO fields are not automatically migrated - handle separately if needed

