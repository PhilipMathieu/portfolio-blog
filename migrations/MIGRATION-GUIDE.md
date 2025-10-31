# Contentful to Astro Migration Guide

This guide documents the migration process from Contentful to Astro MDX format.

## Quick Start

1. **Get your Content Management API token:**
   - Go to https://app.contentful.com/spaces/YOUR_SPACE_ID/api/keys
   - Create a new personal access token (starts with `CFPAT-`)
   - Copy the token

2. **Run the migration:**
   ```bash
   cd migrations
   ./migrate.sh
   ```
   
   Or run manually:
   ```bash
   # Export
   export CONTENTFUL_SPACE_ID=your-space-id
   export CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-your-token
   ./export-content.sh
   
   # Convert
   npm run convert
   ```

3. **Verify:**
   ```bash
   cd ../astro-site
   npm run build
   ```

## Content Mapping

### Frontmatter Fields

| Contentful Field | Astro Field | Notes |
|-----------------|-------------|-------|
| `slug` | filename | Converted to kebab-case (e.g., "my-post" → `my-post.mdx`) |
| `title` | `title` | Direct mapping, escaped for YAML |
| `shortDescription` | `description` | Direct mapping |
| `publishedDate` | `pubDate` | Formatted as "Jan 01 2024" |
| `sys.updatedAt` | `updatedDate` | Optional, only if different from pubDate |
| `featuredImage` | `heroImage` | Relative path `../../assets/filename.jpg` |
| `content` (Rich Text) | Markdown body | Fully converted with formatting |
| Unpublished entries | `draft: true` | Set automatically for unpublished posts |
| Tags | `tags` | Array of strings (currently empty, can be extended) |

### Rich Text Conversion

The migration handles:

✅ **Text formatting**
- Bold (`**text**`)
- Italic (`*text*`)
- Underline (`<u>text</u>`)
- Code (`\`code\``)

✅ **Structure**
- Headings (H1-H6)
- Paragraphs
- Ordered and unordered lists
- Blockquotes
- Horizontal rules

✅ **Links**
- Hyperlinks: `[text](url)`
- Entry hyperlinks: Converted to plain text (can be enhanced)
- Asset hyperlinks: Links to asset URLs

✅ **Embedded entries**
- `ComponentRichImage` → Markdown image: `![caption](/assets/image.jpg)`
- `ComponentVideoEmbed` → iframe tag
- `ComponentIframe` → iframe tag
- `embedded-asset-block` → Image or download link

### Asset Handling

1. **Export**: All assets are downloaded to `exports/assets/` during export
2. **Copy**: Assets used in posts are copied to `astro-site/public/assets/`
3. **Referencing**:
   - Hero images: `../../assets/filename.jpg` (relative path in frontmatter)
   - Embedded images: `/assets/filename.jpg` (absolute path in Markdown)

## Troubleshooting

### Export Fails

**Error**: "CMA token is required"
- **Solution**: Generate a Management API token from Contentful web app

**Error**: "Space not found"
- **Solution**: Verify your space ID is correct using `contentful space list`

### Conversion Issues

**Missing assets**: 
- Check `exports/assets/` directory exists
- Verify assets were downloaded during export
- Manually copy missing assets to `astro-site/public/assets/`

**Rich Text conversion errors**:
- Some complex structures may need manual review
- Check the generated MDX files for formatting issues
- Embedded components not in the standard set may be skipped

**Date format issues**:
- Modify `formatDate()` function in `convert-to-astro.ts` to change format

### Build Errors

**Schema validation errors**:
- Ensure all required fields (title, description, pubDate) are present
- Check frontmatter syntax is valid YAML
- Verify date format matches schema expectations

**Image not found**:
- Check image paths are correct
- Verify assets exist in `public/assets/`
- Ensure paths use forward slashes

## Manual Steps

Some content may require manual adjustment:

1. **Entry hyperlinks**: Currently converted to plain text. You may want to:
   - Create slug mapping for entries
   - Convert to relative links in Markdown

2. **Tags**: Currently empty. You can:
   - Extract from `contentfulMetadata.tags`
   - Extract from related posts
   - Add manually to frontmatter

3. **SEO fields**: Not automatically migrated. Consider:
   - Adding SEO frontmatter fields
   - Creating separate SEO configuration
   - Using Astro SEO plugin

4. **Author information**: Currently not extracted. You can:
   - Add author name to frontmatter
   - Create author content collection
   - Reference author by ID/slug

## Next Steps

After migration:

1. ✅ Review all generated MDX files
2. ✅ Test build with `npm run build`
3. ✅ Verify all images load correctly
4. ✅ Check formatting looks correct
5. ✅ Update routing if needed
6. ✅ Remove Contentful dependencies if not needed
7. ✅ Set up CI/CD for new content

## File Structure

```
migrations/
├── export-content.sh          # Export script
├── convert-to-astro.ts        # Conversion script
├── migrate.sh                 # Complete migration script
├── package.json               # Node dependencies
└── exports/                   # Generated export files (gitignored)
    ├── content-export.json
    ├── content-model.json
    └── assets/                # Downloaded assets

astro-site/
├── src/
│   └── content/
│       └── blog/              # Generated MDX files
└── public/
    └── assets/                # Copied assets
```

## Notes

- The migration preserves as much structure as possible
- Rich Text is converted to standard Markdown
- Complex embedded components are converted to appropriate HTML/MDX
- All assets are copied to ensure local availability
- Unpublished entries are marked as drafts

