import { TAG_PALETTE } from '../tag.config.js';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
export default function remarkNotes() {
	/**
	 * @param {import('mdast').Nodes} node
	 */
	function visit(node) {
		if (node.type === 'blockquote') {
			const paragraph = node.children[0];
			const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;

			if (paragraph?.type === 'paragraph' && text?.type === 'text') {
				const marker = text.value.match(/^\[!([a-z]+)\](?:[ \t]*\r?\n|[ \t]+|$)/i);
				const requestedColor = marker?.[1].toLowerCase();
				if (marker && requestedColor && Object.hasOwn(TAG_PALETTE, requestedColor)) {
					// Keep legacy color markers hidden; all notes use the shared gray CSS.
					text.value = text.value.slice(marker[0].length);
					if (!text.value) paragraph.children.shift();
					if (!paragraph.children.length) node.children.shift();
				}
			}
		}

		if ('children' in node) {
			for (const child of node.children) visit(child);
		}
	}

	return (tree) => visit(tree);
}
