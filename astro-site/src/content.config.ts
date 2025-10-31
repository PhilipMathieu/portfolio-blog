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
			// Hide posts from production by marking them as drafts
			draft: z.boolean().default(false).optional(),
			tags: z.array(z.string()).default([]).optional(),
		}),
});

export const collections = { blog };
