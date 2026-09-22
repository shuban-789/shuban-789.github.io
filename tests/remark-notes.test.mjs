import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkNotes from '../src/plugins/remark-notes.mjs';
import { DEFAULT_TAG_COLOR, TAG_COLORS, TAG_PALETTE } from '../src/tag.config.js';

const processor = await createMarkdownProcessor({
	remarkPlugins: [remarkNotes],
	syntaxHighlight: false,
});

async function render(markdown) {
	return (await processor.render(markdown)).code;
}

test('existing notes keep their text and receive the shared default color', async () => {
	const html = await render('> NOTE: Existing content.');
	assert.ok(html.includes(`data-note-color="${DEFAULT_TAG_COLOR}"`));
	assert.ok(html.includes('<p>NOTE: Existing content.</p>'));
});

test('every post tag color is available for notes', async (t) => {
	for (const color of TAG_COLORS) {
		await t.test(color, async () => {
			const html = await render(`> [!${color}]\n> A colored note.`);
			const palette = TAG_PALETTE[color];
			assert.ok(html.includes(`data-note-color="${color}"`));
			assert.ok(html.includes(`--tag-bg: ${palette.bg};`));
			assert.ok(html.includes(`--tag-border: ${palette.border};`));
			assert.ok(html.includes(`--tag-text: ${palette.text};`));
			assert.ok(html.includes('<p>A colored note.</p>'));
			assert.ok(!html.includes(`[!${color}]`));
		});
	}
});

test('the marker can share a line with formatted note text', async () => {
	const html = await render('> [!GOLD] **NOTE:** An inline `example`.');
	assert.ok(html.includes('data-note-color="gold"'));
	assert.ok(html.includes('<strong>NOTE:</strong> An inline <code>example</code>.'));
	assert.ok(!html.includes('[!GOLD]'));
});

test('notes preserve paragraphs, lists, links, and code blocks', async () => {
	const html = await render([
		'> [!sage]',
		'>',
		'> **NOTE:** First paragraph.',
		'>',
		'> Second paragraph with a [link](https://example.com).',
		'>',
		'> - A list item',
		'>',
		'> ```js',
		'> const example = 1;',
		'> ```',
	].join('\n'));
	assert.ok(!html.includes('<p></p>'));
	assert.ok(!html.includes('[!sage]'));
	assert.ok(html.includes('<p><strong>NOTE:</strong> First paragraph.</p>'));
	assert.ok(html.includes('<a href="https://example.com">link</a>'));
	assert.ok(html.includes('<li>A list item</li>'));
	assert.ok(html.includes('<pre><code class="language-js">const example = 1;'));
});

test('nested notes choose colors independently', async () => {
	const html = await render('> [!rose]\n> Outer note.\n>\n> > [!sage]\n> > Inner note.\n> >\n> > > Default note.');
	assert.deepEqual(
		Array.from(html.matchAll(/data-note-color="([a-z]+)"/g), (match) => match[1]),
		['rose', 'sage', DEFAULT_TAG_COLOR],
	);
});

test('unrecognized markers remain visible as ordinary note text', async () => {
	const html = await render('> [!unknown]\n> Keep this content.');
	assert.ok(html.includes('[!unknown]'));
	assert.ok(html.includes('Keep this content.'));
	assert.ok(html.includes(`data-note-color="${DEFAULT_TAG_COLOR}"`));
});

test('note syntax in fenced code remains literal', async () => {
	const html = await render('```md\n> [!rose]\n> Example note.\n```');
	assert.ok(html.includes('[!rose]'));
	assert.ok(!html.includes('<blockquote'));
});
