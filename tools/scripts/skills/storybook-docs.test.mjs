import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMarkdownBundle } from './markdown-bundle.mjs';
import { getStorybookDocs } from './storybook-docs.mjs';

const docs = getStorybookDocs();

test('public Agents, Learn and Overview MDX are exported as their own sections', () => {
    assert.deepEqual(
        docs
            .filter(({ section }) => section === 'agents')
            .map(({ slug }) => slug)
            .sort(),
        ['build-with-radix-ng', 'compose-components', 'getting-started', 'reference', 'verify-the-result']
    );
    assert.ok(docs.some(({ section, slug }) => section === 'learn' && slug === 'composition'));
    assert.ok(docs.some(({ section, slug }) => section === 'overview' && slug === 'skills'));
    const paths = docs.map(({ section, slug }) => `${section}/${slug}`);
    assert.equal(new Set(paths).size, paths.length, 'public Markdown routes must be unique');
});

test('Storybook links become usable offline Markdown links and blocks do not leak into exports', () => {
    const { files } = createMarkdownBundle(docs, { versionLine: 'Test version' });
    const start = files.get('agents/getting-started.md');
    assert.match(start, /\]\(compose-components\.md\)/);
    assert.match(start, /\]\(\.\.\/overview\/installation\.md\)/);
    assert.doesNotMatch(start, /<Meta\b|^import /m);
    assert.match(files.get('overview/skills.md'), /\]\(\.\.\/agents\/getting-started\.md\)/);
});

test('composition examples export real source from the existing stories', () => {
    const tabs = docs.find(({ section, slug }) => section === 'components' && slug === 'tabs');
    const menu = docs.find(({ section, slug }) => section === 'components' && slug === 'menu');
    const select = docs.find(({ section, slug }) => section === 'components' && slug === 'select');
    assert.match(tabs.body, /hostDirectives: \[RdxTabsRoot\]/);
    assert.match(menu.body, /createRdxDialogHandle/);
    assert.match(select.body, /select-focus-controls/);
    for (const { body } of [tabs, menu, select]) assert.doesNotMatch(body, /<Canvas\b/);
});
