import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkNotes from '../src/plugins/remark-notes.mjs';
import { TAG_COLORS } from '../src/tag.config.js';

const processor = await createMarkdownProcessor({
	remarkPlugins: [remarkNotes],
	syntaxHighlight: false,
});

async function render(markdown, frontmatter = {}) {
	return (await processor.render(markdown, { frontmatter })).code;
}

test('notes use plain blockquotes regardless of post tag colors', async () => {
	for (const tags of [[], [{ color: 'rose' }, { color: 'sage' }], [{ color: 'gold' }]]) {
		const html = await render('> First note.\n\nBody.\n\n> Second note.', { tags });
		assert.equal((html.match(/<blockquote>/g) ?? []).length, 2);
		assert.ok(!html.includes('--tag-'));
		assert.ok(!html.includes('data-note-color'));
	}
});

test('existing notes keep their text', async () => {
	const html = await render('> NOTE: Existing content.');
	assert.ok(html.includes('<p>NOTE: Existing content.</p>'));
});

test('legacy color markers are hidden without adding color overrides', async () => {
	for (const color of TAG_COLORS) {
		const html = await render(`> [!${color}]\n> A note.`);
		assert.ok(html.includes('<blockquote>'));
		assert.ok(html.includes('<p>A note.</p>'));
		assert.ok(!html.includes(`[!${color}]`));
		assert.ok(!html.includes('--tag-'));
	}
});

test('the marker can share a line with formatted note text', async () => {
	const html = await render('> [!GOLD] **NOTE:** An inline `example`.');
	assert.ok(html.includes('<blockquote>'));
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

test('nested notes use the same plain blockquote markup', async () => {
	const html = await render('> [!rose]\n> Outer note.\n>\n> > [!sage]\n> > Inner note.\n> >\n> > > Default note.');
	assert.equal((html.match(/<blockquote>/g) ?? []).length, 3);
	assert.ok(!html.includes('[!'));
	assert.ok(!html.includes('--tag-'));
});

test('unrecognized markers remain visible as ordinary note text', async () => {
	const html = await render('> [!unknown]\n> Keep this content.');
	assert.ok(html.includes('[!unknown]'));
	assert.ok(html.includes('Keep this content.'));
	assert.ok(html.includes('<blockquote>'));
});

test('note syntax in fenced code remains literal', async () => {
	const html = await render('```md\n> [!rose]\n> Example note.\n```');
	assert.ok(html.includes('[!rose]'));
	assert.ok(!html.includes('<blockquote'));
});
