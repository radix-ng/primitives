import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

test('portable examples reach the single setup guide and rendered stylesheet', () => {
    const { files, fullDocs } = createMarkdownBundle(docs, { versionLine: 'Test version' });
    const example = files.get('examples/popover--default.md');
    const sharedStyles = readFileSync(
        new URL('../../../apps/radix-storybook/.storybook/demo-styles.css', import.meta.url),
        'utf8'
    );
    const defaultSource = readFileSync(
        new URL('../../../packages/primitives/popover/stories/popover-default.ts', import.meta.url),
        'utf8'
    );
    const [, defaultCode] = example.match(/```typescript\n([\s\S]*?)\n```/);
    assert.equal(files.get('demo-styles.css'), sharedStyles);
    assert.match(example, /\]\(\.\.\/guides\/styling\.md#copy-an-example-into-your-app\)/);
    assert.match(files.get('guides/styling.md'), /\]\(\.\.\/demo-styles\.css\)/);
    assert.match(files.get('guides/styling.md'), /"@tailwindcss\/postcss": \{\}/);
    assert.deepEqual(
        docs.filter(({ assets }) => assets.has('demo-styles.css')).map(({ slug }) => slug),
        ['styling']
    );
    assert.match(fullDocs.join('\n\n'), /\]\(demo-styles\.css\)/);
    assert.doesNotMatch(fullDocs.join('\n\n'), /^## Setup and shared files$/m);
    const pages = [...files].filter(([file]) => file.endsWith('.md')).map(([, body]) => body);
    assert.ok([...pages, ...fullDocs].every((body) => !body.includes(sharedStyles.trim())));
    assert.equal(defaultCode, defaultSource.replace(/\r\n?/g, '\n').trim());
    assert.doesNotMatch(defaultCode, /from ['"]\.|\.\.\.popoverImports|@layer components/);
    assert.doesNotMatch(example, /<Source\b/);
});

test('example shards share the setup link and retain local dependencies and wrapper sources', () => {
    const { files } = createMarkdownBundle(docs, { versionLine: 'Test version' });
    for (const name of [
        'button--default',
        'input--default',
        'accordion--default',
        'select--typed-application-wrapper',
        'menu--default',
        'drawer--default'
    ]) {
        const source = files.get(`examples/${name}.md`);
        assert.ok(source, name);
        assert.match(source, /\]\(\.\.\/guides\/styling\.md#copy-an-example-into-your-app\)/, name);
        assert.doesNotMatch(source, /@tailwindcss\/postcss/);
        assert.doesNotMatch(source, /from ['"][^'"]*storybook\/styles|<Source\b/);
    }
    assert.match(files.get('examples/button--default.md'), /Install `@lucide\/angular`/);
    assert.match(files.get('examples/calendar--default.md'), /Install `@internationalized\/date`, `@lucide\/angular`/);
    assert.match(files.get('examples/select--typed-application-wrapper.md'), /export class SelectTypedControl/);
    assert.match(files.get('examples/field--default.md'), /#### `\.\/field\.shared\.ts`/);
});
