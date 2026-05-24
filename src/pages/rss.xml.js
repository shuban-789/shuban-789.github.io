import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_CONFIG } from '../site.config';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_CONFIG.title,
		description: SITE_CONFIG.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
	});
}
