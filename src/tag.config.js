// Shared color configuration for post tags and Markdown notes.
export const TAG_PALETTE = {
	peach: { bg: '#fff0e7', border: '#f4b28b', text: '#96512f' },
	sky: { bg: '#eef8ff', border: '#8fbfe5', text: '#245b7d' },
	lavender: { bg: '#f4efff', border: '#b8a2ef', text: '#58408d' },
	sage: { bg: '#f0faee', border: '#9bc78d', text: '#3f6d37' },
	gold: { bg: '#fff6cc', border: '#e0c46c', text: '#7d641a' },
	rose: { bg: '#ffeaf1', border: '#e4a0b8', text: '#893954' },
};

/** @typedef {keyof typeof TAG_PALETTE} TagColor */

/** @type {TagColor} */
export const DEFAULT_TAG_COLOR = 'sky';

export const TAG_COLORS = /** @type {TagColor[]} */ (Object.keys(TAG_PALETTE));

/** @param {TagColor} [color] */
export function tagStyle(color = DEFAULT_TAG_COLOR) {
	const colors = TAG_PALETTE[color];
	return `--tag-bg: ${colors.bg}; --tag-border: ${colors.border}; --tag-text: ${colors.text};`;
}
