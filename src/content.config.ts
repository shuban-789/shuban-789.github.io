import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { DEFAULT_TAG_COLOR, TAG_COLORS } from './tag.config.js';

const tagSchema = z.object({
	label: z.string(),
	color: z.enum(TAG_COLORS).default(DEFAULT_TAG_COLOR),
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(tagSchema).default([]),
		badge: z.string().optional(),
	}),
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		eyebrow: z.string().optional(),
		tagline: z.string().optional(),
		location: z.string().optional(),
	}),
});

export const collections = { blog, pages };
