import { DEFAULT_TAG_COLOR, TAG_PALETTE, tagStyle } from '../tag.config.js';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
export default function remarkNotes() {
	/**
	 * @param {import('mdast').Nodes} node
	 * @param {import('../tag.config.js').TagColor[]} colors
	 * @param {{ index: number }} position
	 */
	function visit(node, colors, position) {
		if (node.type === 'blockquote') {
			let color = colors[position.index % colors.length];
			position.index += 1;
			const paragraph = node.children[0];
			const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;

			if (paragraph?.type === 'paragraph' && text?.type === 'text') {
				const marker = text.value.match(/^\[!([a-z]+)\](?:[ \t]*\r?\n|[ \t]+|$)/i);
				const requestedColor = marker?.[1].toLowerCase();
				if (marker && requestedColor && Object.hasOwn(TAG_PALETTE, requestedColor)) {
					color = /** @type {import('../tag.config.js').TagColor} */ (requestedColor);
					text.value = text.value.slice(marker[0].length);
					if (!text.value) paragraph.children.shift();
					if (!paragraph.children.length) node.children.shift();
				}
			}

			node.data ??= {};
			const properties = node.data.hProperties ?? {};
			node.data.hProperties = {
				...properties,
				'data-note-color': color,
				style: [properties.style, tagStyle(color)].filter(Boolean).join('; '),
			};
		}

		if ('children' in node) {
			for (const child of node.children) visit(child, colors, position);
		}
	}

	return (tree, file) => {
		const tags = file.data.astro?.frontmatter?.tags;
		const colors = Array.isArray(tags)
			? tags.map((tag) => {
				const color = tag?.color;
				return typeof color === 'string' && Object.hasOwn(TAG_PALETTE, color)
					? /** @type {import('../tag.config.js').TagColor} */ (color)
					: DEFAULT_TAG_COLOR;
			})
			: [];
		visit(tree, colors.length ? colors : [DEFAULT_TAG_COLOR], { index: 0 });
	};
}
