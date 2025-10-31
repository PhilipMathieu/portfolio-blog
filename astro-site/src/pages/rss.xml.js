import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = (await getCollection('blog'))
		// In production, exclude drafts. In dev mode, include all posts.
		.filter((post) => import.meta.env.DEV || !post.data.draft)
		// Sort by publication date, newest first
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			// Include tags if available
			...(post.data.tags && post.data.tags.length > 0 && { 
				categories: post.data.tags 
			}),
		})),
	});
}
