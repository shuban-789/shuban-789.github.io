import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkNotes from '../src/plugins/remark-notes.mjs';
import { DEFAULT_TAG_COLOR, TAG_COLORS, TAG_PALETTE } from '../src/tag.config.js';

const processor = await createMarkdownProcessor({
	remarkPlugins: [remarkNotes],
	syntaxHighlight: false,
});

async function render(markdown, frontmatter = {}) {
	return (await processor.render(markdown, { frontmatter })).code;
}

function noteColors(html) {
	return Array.from(html.matchAll(/data-note-color="([a-z]+)"/g), (match) => match[1]);
}

function notes(count) {
	return Array.from({ length: count }, (_, index) => `> Note ${index + 1}.`)
		.join('\n\nA paragraph between notes.\n\n');
}

test('notes cycle through the post tag colors in their original order', async () => {
	const html = await render(notes(7), {
		tags: [{ color: 'rose' }, { color: 'peach' }, { color: 'sage' }],
	});
	assert.deepEqual(noteColors(html), ['rose', 'peach', 'sage', 'rose', 'peach', 'sage', 'rose']);
});

test('each page starts with its own first tag, even with a shared processor', async () => {
	await render(notes(2), { tags: [{ color: 'rose' }, { color: 'peach' }, { color: 'sage' }] });
	const html = await render(notes(4), { tags: [{ color: 'lavender' }, { color: 'gold' }] });
	assert.deepEqual(noteColors(html), ['lavender', 'gold', 'lavender', 'gold']);
});

test('one tag repeats and pages without tags keep the default color', async () => {
	assert.deepEqual(noteColors(await render(notes(3), { tags: [{ color: 'gold' }] })), ['gold', 'gold', 'gold']);
	assert.deepEqual(noteColors(await render(notes(2), { tags: [] })), [DEFAULT_TAG_COLOR, DEFAULT_TAG_COLOR]);
});

test('missing tag colors and repeated colors keep their positions in the cycle', async () => {
	const html = await render(notes(5), {
		tags: [{ color: 'rose' }, { label: 'Default blue' }, { color: 'rose' }, { color: 'sage' }],
	});
	assert.deepEqual(noteColors(html), ['rose', DEFAULT_TAG_COLOR, 'rose', 'sage', 'rose']);
});

test('nested notes take the next color in reading order', async () => {
	const html = await render('> Outer note.\n>\n> > Inner note.\n\nBody paragraph.\n\n> Final note.', {
		tags: [{ color: 'peach' }, { color: 'sage' }],
	});
	assert.deepEqual(noteColors(html), ['peach', 'sage', 'peach']);
});

test('explicit color overrides still occupy their note position in the cycle', async () => {
	const html = await render('> [!gold]\n> Custom color.\n\nBody paragraph.\n\n> Automatic color.', {
		tags: [{ color: 'rose' }, { color: 'sage' }],
	});
	assert.deepEqual(noteColors(html), ['gold', 'sage']);
});

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
