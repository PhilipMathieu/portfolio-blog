// @ts-nocheck
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.string().optional(), // Absolute path from public/ folder, e.g. "/assets/image.png"
			heroIframe: z.string().optional(), // URL to embed as hero instead of a static image
			// External project URL the static hero image links to (ignored when heroIframe is set).
			// http(s)-only: the value lands in an <a href>, so schemes like javascript: must not validate
			heroLink: z.string().url().regex(/^https?:\/\//, 'heroLink must be an http(s) URL').optional(),
			// URL of an external site (e.g. GitHub Pages) rendered as the body of the
			// post: prose becomes a short intro, then the site fills the page below it
			embedSite: z.string().url().optional(),
			embedHeight: z.string().optional(), // CSS height override for the embedSite frame
			// Hide posts from production by marking them as drafts
			draft: z.boolean().default(false).optional(),
			tags: z.array(z.string()).default([]).optional(),
			// Indicate the level of AI involvement in writing this post
			aiUsage: z.enum(['human', 'co-authored', 'generative']).default('human').optional(),
		}),
});

export const collections = { blog };
