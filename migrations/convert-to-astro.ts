#!/usr/bin/env tsx
/**
 * Migration script to convert Contentful blog posts to Astro MDX format
 * 
 * Usage: tsx convert-to-astro.ts <export-file> <output-dir>
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Types for Contentful export structure
interface ContentfulAsset {
  sys: { id: string };
  fields: {
    title?: { [locale: string]: string };
    description?: { [locale: string]: string };
    file?: {
      [locale: string]: {
        url: string;
        fileName: string;
        contentType: string;
        details?: {
          size?: number;
          image?: {
            width?: number;
            height?: number;
          };
        };
      };
    };
  };
}

interface RichTextNode {
  nodeType: string;
  content?: RichTextNode[];
  marks?: Array<{ type: string }>;
  value?: string;
  data?: {
    uri?: string;
    target?: { sys: { id: string } };
    [key: string]: any;
  };
}

interface EmbeddedEntry {
  sys: { id: string; contentType?: { sys: { id: string } } };
  fields?: any;
}

interface ContentfulEntry {
  sys: {
    id: string;
    contentType: { sys: { id: string } };
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    publishedVersion?: number;
    version: number;
  };
  fields: {
    [fieldName: string]: {
      [locale: string]: any;
    };
  };
}

interface ContentfulExport {
  entries: ContentfulEntry[];
  assets: ContentfulAsset[];
  locales: Array<{ code: string; default: boolean }>;
}

/**
 * Convert Rich Text node to Markdown
 */
function richTextToMarkdown(
  node: RichTextNode,
  embeddedEntries: Map<string, EmbeddedEntry>,
  assets: Map<string, ContentfulAsset>,
  locale: string = 'en-US'
): string {
  if (!node) return '';

  const { nodeType, content, marks, value, data } = node;

  switch (nodeType) {
    case 'document':
      return content?.map(child => richTextToMarkdown(child, embeddedEntries, assets, locale)).join('') || '';
    
    case 'paragraph':
      const paraContent = content?.map(child => richTextToMarkdown(child, embeddedEntries, assets, locale)).join('') || '';
      // Check if entire paragraph is code (for code blocks)
      if (content && content.length === 1 && content[0].nodeType === 'text' && content[0].marks?.some((m: any) => m.type === 'code')) {
        // This is inline code, handled by text node
        return paraContent ? `${paraContent}\n\n` : '';
      }
      return paraContent ? `${paraContent}\n\n` : '';
    
    case 'code':
      // Code block - convert to fenced code block
      const codeBlockContent = content?.map(c => {
        if (c.nodeType === 'text') {
          return c.value || '';
        }
        return richTextToMarkdown(c, embeddedEntries, assets, locale);
      }).join('') || '';
      const codeLanguage = data?.language || '';
      return `\`\`\`${codeLanguage}\n${codeBlockContent}\n\`\`\`\n\n`;
    
    case 'heading-1':
      return `# ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    case 'heading-2':
      return `## ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    case 'heading-3':
      return `### ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    case 'heading-4':
      return `#### ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    case 'heading-5':
      return `##### ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    case 'heading-6':
      return `###### ${content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || ''}\n\n`;
    
    case 'unordered-list':
      const ulItems = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).filter(Boolean) || [];
      return ulItems.map(item => `- ${item.trim()}`).join('\n') + '\n\n';
    
    case 'ordered-list':
      const olItems = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).filter(Boolean) || [];
      return olItems.map((item, i) => `${i + 1}. ${item.trim()}`).join('\n') + '\n\n';
    
    case 'list-item':
      const itemContent = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('').trim();
      return itemContent;
    
    case 'blockquote':
      const quoteContent = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('').trim();
      return `> ${quoteContent}\n\n`;
    
    case 'hr':
      return `---\n\n`;
    
    case 'hyperlink':
      const linkText = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || '';
      const href = data?.uri || '';
      return `[${linkText}](${href})`;
    
    case 'entry-hyperlink':
      const entryLinkText = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || '';
      // Entry hyperlinks need special handling - could link to slug if available
      return entryLinkText; // Simplified for now
    
    case 'asset-hyperlink':
      const assetLinkText = content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || '';
      const hyperlinkAssetId = data?.target?.sys?.id;
      if (hyperlinkAssetId && assets.has(hyperlinkAssetId)) {
        const asset = assets.get(hyperlinkAssetId)!;
        const assetUrl = asset.fields?.file?.[locale]?.url || '';
        return `[${assetLinkText}](${assetUrl})`;
      }
      return assetLinkText;
    
    case 'embedded-entry-block':
      const entryId = data?.target?.sys?.id;
      if (entryId && embeddedEntries.has(entryId)) {
        return handleEmbeddedEntry(embeddedEntries.get(entryId)!, assets, locale);
      }
      return '';
    
    case 'embedded-entry-inline':
      const inlineEntryId = data?.target?.sys?.id;
      if (inlineEntryId && embeddedEntries.has(inlineEntryId)) {
        return handleEmbeddedEntry(embeddedEntries.get(inlineEntryId)!, assets, locale, true);
      }
      return '';
    
    case 'embedded-asset-block':
      const embeddedAssetId = data?.target?.sys?.id;
      if (embeddedAssetId && assets.has(embeddedAssetId)) {
        return handleEmbeddedAsset(assets.get(embeddedAssetId)!, locale);
      }
      return '';
    
    case 'text':
      let text = value || '';
      if (marks) {
        // Process marks in reverse order to get correct nesting
        const sortedMarks = [...marks].reverse();
        sortedMarks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`;
              break;
            case 'italic':
              text = `*${text}*`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'code':
              text = `\`${text}\``;
              break;
          }
        });
      }
      return text;
    
    default:
      console.warn(`Unhandled node type: ${nodeType}`);
      return content?.map(c => richTextToMarkdown(c, embeddedEntries, assets, locale)).join('') || '';
  }
}

/**
 * Handle embedded entries (images, videos, iframes)
 */
function handleEmbeddedEntry(
  entry: EmbeddedEntry,
  assets: Map<string, ContentfulAsset>,
  locale: string,
  inline: boolean = false
): string {
  const contentType = entry.sys?.contentType?.sys?.id || '';
  const fields = entry.fields || {};

  // Handle both cases (export format may use lowercase)
  const normalizedContentType = contentType.toLowerCase();
  
  switch (normalizedContentType) {
    case 'componentrichimage':
      const imageField = fields.image?.[locale];
      const caption = fields.caption?.[locale] || '';
      const fullWidth = fields.fullWidth?.[locale] || false;
      
      if (imageField?.sys?.id && assets.has(imageField.sys.id)) {
        const asset = assets.get(imageField.sys.id)!;
        const file = asset.fields?.file?.[locale];
        if (file?.url) {
          // Extract filename from URL and create relative path
          const fileName = file.fileName || basename(file.url);
          const imagePath = `/assets/${fileName}`;
          const fullWidthAttr = fullWidth ? '{: .full-width}\n' : '';
          return `![${caption || ''}](${imagePath}${caption ? ` "${caption}"` : ''})\n${fullWidthAttr}\n`;
        }
      }
      return '';
    
    case 'componentvideoembed':
      const videoUrl = fields.videoUrl?.[locale] || '';
      const videoTitle = fields.videoTitle?.[locale] || '';
      const videoCaption = fields.videoCaption?.[locale] || '';
      
      if (videoUrl) {
        return `<iframe src="${videoUrl}" title="${videoTitle}" allowfullscreen></iframe>\n${videoCaption ? `*${videoCaption}*\n` : ''}`;
      }
      return '';
    
    case 'componentiframe':
      const iframeUrl = fields.iframeUrl?.[locale] || '';
      if (iframeUrl) {
        return `<iframe src="${iframeUrl}"></iframe>\n`;
      }
      return '';
    
    default:
      console.warn(`Unhandled embedded entry type: ${contentType}`);
      return '';
  }
}

/**
 * Handle embedded assets
 */
function handleEmbeddedAsset(asset: ContentfulAsset, locale: string): string {
  const file = asset.fields?.file?.[locale];
  const title = asset.fields?.title?.[locale] || '';
  const description = asset.fields?.description?.[locale] || '';
  
  if (file?.url) {
    const fileName = file.fileName || basename(file.url);
    const imagePath = `/assets/${fileName}`;
    
    if (file.contentType?.startsWith('image/')) {
      return `![${title || description || ''}](${imagePath})\n`;
    } else {
      // For non-image assets, create a download link
      return `[${title || fileName}](${imagePath})\n`;
    }
  }
  return '';
}

/**
 * Convert date string to Astro format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Sanitize filename from slug
 */
function slugToFilename(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Main conversion function
 */
async function convertContentfulToAstro(
  exportFile: string,
  outputDir: string,
  assetsDir: string
) {
  console.log(`Reading Contentful export from: ${exportFile}`);
  const exportData: ContentfulExport = JSON.parse(readFileSync(exportFile, 'utf-8'));
  
  const defaultLocale = exportData.locales.find(l => l.default)?.code || 'en-US';
  const locale = defaultLocale;
  
  // Extract space ID from export data (from asset URLs or entry space references)
  let spaceId: string | undefined;
  if (exportData.assets.length > 0) {
    const firstAsset = exportData.assets[0];
    const fileUrl = firstAsset.fields?.file?.[locale]?.url;
    if (fileUrl) {
      // URL format: //images.ctfassets.net/{spaceId}/...
      const match = fileUrl.match(/images\.ctfassets\.net\/([^\/]+)/);
      if (match) {
        spaceId = match[1];
      }
    }
  }
  // Fallback: try to get from entry space reference
  if (!spaceId && exportData.entries.length > 0) {
    const firstEntry = exportData.entries[0];
    spaceId = firstEntry.sys?.space?.sys?.id;
  }
  
  if (!spaceId) {
    // Last resort: try to detect from directory structure
    const baseDir = dirname(assetsDir);
    const cdnBaseDir = join(baseDir, 'images.ctfassets.net');
    if (existsSync(cdnBaseDir)) {
      const dirs = readdirSync(cdnBaseDir, { withFileTypes: true });
      const spaceDir = dirs.find(d => d.isDirectory());
      if (spaceDir) {
        spaceId = spaceDir.name;
      }
    }
  }
  
  if (spaceId) {
    console.log(`Detected space ID: ${spaceId}`);
  } else {
    console.warn('Could not detect space ID, will use default or search all directories');
  }
  
  // Create maps for quick lookup
  const assetsMap = new Map<string, ContentfulAsset>();
  exportData.assets.forEach(asset => {
    assetsMap.set(asset.sys.id, asset);
  });
  
  const entriesMap = new Map<string, ContentfulEntry>();
  exportData.entries.forEach(entry => {
    entriesMap.set(entry.sys.id, entry);
  });
  
  // Find all blog post entries
  const blogPosts = exportData.entries.filter(
    entry => entry.sys.contentType.sys.id === 'pageBlogPost'
  );
  
  console.log(`Found ${blogPosts.length} blog posts to migrate`);
  
  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });
  
  // Helper function to download asset from URL
  const downloadAsset = async (url: string, destPath: string): Promise<boolean> => {
    try {
      const https = require('https');
      const http = require('http');
      const { URL } = require('url');
      
      // Parse and encode URL properly
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        // If URL parsing fails, try to fix it
        if (!url.startsWith('http')) {
          url = 'https:' + url;
        }
        parsedUrl = new URL(url);
      }
      
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      return new Promise((resolve) => {
        const file = require('fs').createWriteStream(destPath);
        
        const options = {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + (parsedUrl.search || ''),
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Contentful-Migration/1.0)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity'  // Disable compression to avoid issues
          }
        };
        
            const req = protocol.request(options, (response: any) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            file.close();
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              // Handle relative redirects
              const absoluteRedirect = redirectUrl.startsWith('http') 
                ? redirectUrl 
                : `${parsedUrl.protocol}//${parsedUrl.hostname}${redirectUrl}`;
              return downloadAsset(absoluteRedirect, destPath).then(resolve);
            }
            resolve(false);
            return;
          }
          
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(true);
            });
            file.on('error', (err: any) => {
              console.error(`File write error for ${url}:`, err.message);
              file.close();
              if (existsSync(destPath)) {
                require('fs').unlinkSync(destPath);
              }
              resolve(false);
            });
          } else {
            console.error(`HTTP error for ${url}: Status ${response.statusCode}`);
            file.close();
            if (existsSync(destPath)) {
              require('fs').unlinkSync(destPath);
            }
            resolve(false);
          }
        });
        
        req.on('error', (err: any) => {
          console.error(`Download error for ${url}:`, err.message);
          file.close();
          if (existsSync(destPath)) {
            require('fs').unlinkSync(destPath);
          }
          resolve(false);
        });
        
        req.setTimeout(60000, () => {
          console.error(`Download timeout for ${url}`);
          req.destroy();
          file.close();
          if (existsSync(destPath)) {
            require('fs').unlinkSync(destPath);
          }
          resolve(false);
        });
        
        req.end();
      });
    } catch (err) {
      return false;
    }
  };
  
  // Helper function to copy asset to public directory
  const copyAssetToPublic = async (assetId: string, fileName: string, assetUrl?: string, spaceId?: string): Promise<string | null> => {
    // outputDir is like "../astro-site/src/content/blog"
    // We need to go to "../astro-site/public/assets" (3 levels up from blog, then public/assets)
    const publicAssetsDir = join(outputDir, '..', '..', '..', 'public', 'assets');
    const destPath = join(publicAssetsDir, fileName);
    const destDir = dirname(destPath);
    
    // Ensure destination directory exists
    mkdirSync(destDir, { recursive: true });
    
    // Try to find asset in exports directory (various possible locations)
    // Check the base directory structure first
    const baseDir = dirname(assetsDir);
    // The migrations directory - where the script is running from
    const actualMigrationsDir = dirname(exportFile); // This gives us the directory containing content-export.json (exports/)
    const migrationsDir = dirname(actualMigrationsDir); // Go up one more to get migrations/
    const possiblePaths = [
      // Check in exports/assets directory
      join(assetsDir, assetId, fileName),
      join(assetsDir, fileName),
      join(assetsDir, assetId + '-' + fileName),
    ];
    
    for (const sourcePath of possiblePaths) {
      if (existsSync(sourcePath)) {
        const stat = require('fs').statSync(sourcePath);
        if (stat.isFile()) {
          copyFileSync(sourcePath, destPath);
          return `/assets/${fileName}`;
        }
      }
    }
    
    // Try recursive search in assets directory
    if (existsSync(assetsDir)) {
      const findAssetRecursive = (dir: string, targetName: string): string | null => {
        try {
          const entries = readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              const found = findAssetRecursive(fullPath, targetName);
              if (found) return found;
            } else if (entry.name === fileName || entry.name.toLowerCase() === targetName.toLowerCase()) {
              return fullPath;
            }
          }
        } catch (err) {
          // Directory may not be readable
        }
        return null;
      };
      
      const foundAssetPath = findAssetRecursive(assetsDir, fileName);
      if (foundAssetPath) {
        copyFileSync(foundAssetPath, destPath);
        return `/assets/${fileName}`;
      }
    }
    
    // Also check the images.ctfassets.net directory structure
    // Structure: images.ctfassets.net/{spaceId}/{assetId}/{hash}/{filename}
    // Try multiple locations: exports/images.ctfassets.net and migrations/images.ctfassets.net
    const cdnBaseDir1 = join(baseDir, 'images.ctfassets.net');
    const cdnBaseDir2 = join(migrationsDir, 'images.ctfassets.net');
    const cdnBaseDir = existsSync(cdnBaseDir2) ? cdnBaseDir2 : (existsSync(cdnBaseDir1) ? cdnBaseDir1 : null);
    
    if (cdnBaseDir && existsSync(cdnBaseDir)) {
      let cdnAssetsDir: string;
      if (spaceId) {
        cdnAssetsDir = join(cdnBaseDir, spaceId);
      } else {
        // If spaceId not provided, search all space directories
        try {
          const spaceDirs = readdirSync(cdnBaseDir, { withFileTypes: true });
          const spaceDir = spaceDirs.find(d => d.isDirectory());
          if (spaceDir) {
            cdnAssetsDir = join(cdnBaseDir, spaceDir.name);
          } else {
            return null;
          }
        } catch {
          return null;
        }
      }
      
      if (existsSync(cdnAssetsDir)) {
      // First try direct path with assetId
      const assetIdDir = join(cdnAssetsDir, assetId);
      if (existsSync(assetIdDir)) {
        // Look for the file in subdirectories (the hash directories)
        try {
          const hashDirs = readdirSync(assetIdDir, { withFileTypes: true });
          for (const hashDir of hashDirs) {
            if (hashDir.isDirectory()) {
              const hashDirPath = join(assetIdDir, hashDir.name);
              // Try exact filename first
              let filePath = join(hashDirPath, fileName);
              if (existsSync(filePath)) {
                console.log(`✓ Found asset ${fileName} (${assetId}) in CDN structure at ${filePath}`);
                copyFileSync(filePath, destPath);
                console.log(`  → Copied to ${destPath}`);
                return `/assets/${fileName}`;
              }
              // Try variations (spaces -> underscores, etc.)
              const fileNameVariations = [
                fileName.replace(/\s+/g, '_'), // spaces to underscores
                fileName.replace(/ /g, '_'), // single space to underscore
                fileName.replace(/_/g, ' '), // underscores to spaces
              ];
              for (const variant of fileNameVariations) {
                if (variant !== fileName) {
                  filePath = join(hashDirPath, variant);
                  if (existsSync(filePath)) {
                    console.log(`✓ Found asset ${fileName} as ${variant} (${assetId}) in CDN structure`);
                    copyFileSync(filePath, destPath);
                    console.log(`  → Copied to ${destPath}`);
                    return `/assets/${fileName}`;
                  }
                }
              }
              // If not found, list files in hash directory and try fuzzy match
              try {
                const filesInHashDir = readdirSync(hashDirPath);
                const matchedFile = filesInHashDir.find((f: string) => {
                  // Remove extensions and compare normalized names
                  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return normalize(f) === normalize(fileName);
                });
                if (matchedFile) {
                  filePath = join(hashDirPath, matchedFile);
                  console.log(`✓ Found asset ${fileName} as ${matchedFile} (${assetId}) in CDN structure`);
                  copyFileSync(filePath, destPath);
                  console.log(`  → Copied to ${destPath}`);
                  return `/assets/${fileName}`;
                }
              } catch {
                // Couldn't list directory
              }
            }
          }
        } catch (err) {
          // Directory may not be readable
        }
      }
      
      // Fallback: recursive search by filename
      const findAssetInCdnStructure = (dir: string, targetName: string): string | null => {
        try {
          const entries = readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              const found = findAssetInCdnStructure(fullPath, targetName);
              if (found) return found;
            } else if (entry.name === fileName || entry.name.toLowerCase() === targetName.toLowerCase()) {
              return fullPath;
            }
          }
        } catch (err) {
          // Directory may not be readable
        }
        return null;
      };
      
      const foundAssetPath = findAssetInCdnStructure(cdnAssetsDir, fileName);
      if (foundAssetPath) {
        copyFileSync(foundAssetPath, destPath);
        return `/assets/${fileName}`;
      }
      }
    }
    
    // If asset not found locally, try to download from URL
    if (assetUrl) {
      const fullUrl = assetUrl.startsWith('http') ? assetUrl : `https:${assetUrl}`;
      console.log(`Downloading ${fileName} from ${fullUrl}...`);
      const downloaded = await downloadAsset(fullUrl, destPath);
      if (downloaded && existsSync(destPath)) {
        const stats = require('fs').statSync(destPath);
        if (stats.size > 0) {
          console.log(`✓ Successfully downloaded ${fileName} (${stats.size} bytes)`);
          return `/assets/${fileName}`;
        } else {
          console.warn(`Downloaded file ${fileName} is empty, removing...`);
          require('fs').unlinkSync(destPath);
        }
      } else {
        console.warn(`Failed to download ${fileName} from ${fullUrl}`);
      }
    }
    
    console.warn(`Asset ${fileName} (${assetId}) not found and could not be downloaded`);
    return null;
  };
  
  // Process each blog post
  for (const post of blogPosts) {
    const fields = post.fields;
    const slug = fields.slug?.[locale] || '';
    
    if (!slug) {
      console.warn(`Skipping post ${post.sys.id} - no slug found`);
      continue;
    }
    
    // Track assets used in this post for copying
    const usedAssets = new Set<string>();
    
    // Extract frontmatter fields
    const title = fields.title?.[locale] || 'Untitled';
    const description = fields.shortDescription?.[locale] || '';
    const publishedDate = fields.publishedDate?.[locale] || post.sys.publishedAt || post.sys.createdAt;
    const updatedDate = post.sys.updatedAt;
    
    // Handle featured image
    let heroImage: string | undefined;
    const featuredImage = fields.featuredImage?.[locale];
    if (featuredImage?.sys?.id && assetsMap.has(featuredImage.sys.id)) {
      const asset = assetsMap.get(featuredImage.sys.id)!;
      const file = asset.fields?.file?.[locale];
      if (file?.url) {
        const fileName = file.fileName || basename(file.url);
        // Copy asset to public directory
        // Copy asset using helper function (with URL for download if needed)
        const assetUrl = file.url;
        const fullUrl = assetUrl.startsWith('http') ? assetUrl : `https:${assetUrl}`;
        const assetPath = await copyAssetToPublic(featuredImage.sys.id, fileName, fullUrl, spaceId);
        if (assetPath) {
          // When using image() schema helper, use absolute path from public folder
          // But also need to handle spaces in filenames - use the exported filename
          heroImage = `/assets/${fileName}`;
        }
      }
    }
    
    // Extract tags (from metadata or related posts)
    const tags: string[] = [];
    // Tags might be in contentfulMetadata - we'll add this if needed
    
    // Extract author info
    const author = fields.author?.[locale];
    const authorName = author?.fields?.name?.[locale] || '';
    
    // Extract SEO fields
    const seoFields = fields.seoFields?.[locale];
    
    // Extract content (Rich Text)
    const content = fields.content?.[locale];
    let markdownBody = '';
    
    if (content) {
      // In export format, content is the document itself, not wrapped in json/links
      // Build embedded entries map by finding references in the content nodes
      const embeddedEntriesMap = new Map<string, EmbeddedEntry>();
      
      // Recursive function to find all embedded entry and asset references
      const findEmbeddedReferences = (node: any) => {
        if (!node) return;
        
        // Check if this node references an embedded entry
        if (node.data?.target?.sys?.id) {
          const entryId = node.data.target.sys.id;
          const fullEntry = entriesMap.get(entryId);
          if (fullEntry) {
            embeddedEntriesMap.set(entryId, {
              sys: fullEntry.sys,
              fields: fullEntry.fields
            });
            
            // Also track assets from embedded entries (like ComponentRichImage)
            // Note: Contentful export may use lowercase IDs
            const contentTypeId = fullEntry.sys.contentType?.sys?.id || '';
            if (contentTypeId === 'ComponentRichImage' || contentTypeId === 'componentRichImage') {
              const imageField = fullEntry.fields?.image?.[locale];
              if (imageField?.sys?.id) {
                usedAssets.add(imageField.sys.id);
              }
            }
          }
        }
        
        // Check if this node references an embedded asset
        if (node.data?.target?.sys?.id && assetsMap.has(node.data.target.sys.id)) {
          usedAssets.add(node.data.target.sys.id);
        }
        
        // Recursively check children
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(findEmbeddedReferences);
        }
      };
      
      // Find all embedded references
      findEmbeddedReferences(content);
      
      // In export format, content is the document directly (not content.json)
      markdownBody = richTextToMarkdown(content, embeddedEntriesMap, assetsMap, locale);
      
    }
    
    // Copy all used assets to public directory
    for (const assetId of usedAssets) {
      if (assetsMap.has(assetId)) {
        const asset = assetsMap.get(assetId)!;
        const file = asset.fields?.file?.[locale];
        if (file?.url) {
          const fileName = file.fileName || basename(file.url);
          const assetUrl = file.url;
          const fullUrl = assetUrl.startsWith('http') ? assetUrl : `https:${assetUrl}`;
          await copyAssetToPublic(assetId, fileName, fullUrl, spaceId);
        }
      }
    }
    
    // Build frontmatter
    const frontmatter: Record<string, any> = {
      title: `'${title.replace(/'/g, "''")}'`,
      description: `'${description.replace(/'/g, "''")}'`,
      pubDate: `'${formatDate(publishedDate)}'`
    };
    
    if (heroImage) {
      frontmatter.heroImage = `'${heroImage}'`;
    }
    
    if (tags.length > 0) {
      frontmatter.tags = JSON.stringify(tags);
    }
    
    // Check if draft (unpublished)
    if (!post.sys.publishedAt || post.sys.version !== post.sys.publishedVersion) {
      frontmatter.draft = true;
    }
    
    if (updatedDate && updatedDate !== publishedDate) {
      frontmatter.updatedDate = `'${formatDate(updatedDate)}'`;
    }
    
    // Generate MDX file
    const filename = `${slugToFilename(slug)}.mdx`;
    const filepath = join(outputDir, filename);
    
    const frontmatterStr = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const mdxContent = `---\n${frontmatterStr}\n---\n\n${markdownBody}`;
    
    writeFileSync(filepath, mdxContent, 'utf-8');
    console.log(`Created: ${filename}`);
  }
  
  console.log('\nMigration complete!');
  console.log(`Migrated ${blogPosts.length} blog posts to ${outputDir}`);
}

// Main execution
const exportFile = process.argv[2] || join(__dirname, 'exports', 'content-export.json');
const outputDir = process.argv[3] || join(__dirname, '..', 'astro-site', 'src', 'content', 'blog');
const assetsDir = process.argv[4] || join(__dirname, 'exports', 'assets');

if (!existsSync(exportFile)) {
  console.error(`Error: Export file not found: ${exportFile}`);
  console.error('Please run the export script first or provide the path to the export file.');
  process.exit(1);
}

convertContentfulToAstro(exportFile, outputDir, assetsDir).catch(console.error);

