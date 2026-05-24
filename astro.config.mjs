// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE ?? 'https://shuban-789.github.io',
	base: process.env.BASE || '/',
	markdown: {
		shikiConfig: {
			theme: 'github-light',
			wrap: true,
		},
	},
	integrations: [mdx(), sitemap()],
});
