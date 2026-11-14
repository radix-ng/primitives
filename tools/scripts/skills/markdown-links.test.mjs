import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markdownHeadings, validateMarkdownLinks } from './markdown-links.mjs';

test('Markdown anchors preserve formatted heading text, Unicode and duplicate suffixes, excluding code', () => {
    const content = '# A `value`\n## A value\n## A value-1\n## État\n~~~md\n## Fake\n~~~\n';
    assert.deepEqual(
        markdownHeadings(content).map(({ id }) => id),
        ['a-value', 'a-value-1', 'a-value-1-1', 'état']
    );
});

test('validation checks fragments and files in relative Markdown links, same-page links and HTML hrefs', () => {
    const files = new Map([
        [
            'guides/start.md',
            '# Start\n[Good](../components/demo.md#real-section)\n<a href="../components/demo.md#missing">Bad</a>\n[Missing](../components/absent.md#real-section)\n[Local](#absent "With a title")'
        ],
        ['components/demo.md', '# Demo\n## Real section\n']
    ]);
    assert.deepEqual(validateMarkdownLinks(files), [
        'guides/start.md: missing Markdown anchor ../components/demo.md#missing',
        'guides/start.md: missing Markdown file ../components/absent.md#real-section',
        'guides/start.md: missing Markdown anchor #absent'
    ]);
});

test('validation accepts encoded fragments and ignores example code, inline code and external links', () => {
    const content =
        '# État\n[State](#%C3%A9tat)\n[External](https://example.com/#missing)\n`[Inline](#missing)`\n```md\n[Code](#missing)\n```\n';
    assert.deepEqual(validateMarkdownLinks(new Map([['demo.md', content]])), []);
});
