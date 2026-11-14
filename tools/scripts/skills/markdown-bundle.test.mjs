import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMarkdownBundle } from './markdown-bundle.mjs';
import { validateMarkdownLinks } from './markdown-links.mjs';
import { getStorybookDocs } from './storybook-docs.mjs';

const { files, fullDocs } = createMarkdownBundle(getStorybookDocs(), { versionLine: 'Test version' });

test('links to the Signal Forms matrix and paired recipes retain their actual target sections', () => {
    const index = files.get('components/signal-forms.md');
    assert.match(index, /^## Control integration matrix$/m);
    assert.match(index, /^## One recipe, two Angular APIs$/m);
    assert.match(index, /submission\.action/);
    assert.match(files.get('guides/forms.md'), /\]\(\.\.\/components\/signal-forms\.md#control-integration-matrix\)/);
    assert.match(
        files.get('guides/forms-migration.md'),
        /\]\(\.\.\/components\/signal-forms\.md#one-recipe-two-angular-apis\)/
    );
    assert.doesNotMatch(index, /^## Control authoring/m, 'unlinked detail remains outside the compact index');
});

test('links to individual examples target the source shard instead of a missing index heading', () => {
    assert.match(
        files.get('guides/forms.md'),
        /\]\(\.\.\/examples\/signal-forms--async-validation-and-reset-lifecycle\.md\)/
    );
    assert.match(
        files.get('examples/signal-forms--async-validation-and-reset-lifecycle.md'),
        /resetProfile\(event: Event\)/
    );
});

test('recipe links in HTML cards and ordinary Markdown both resolve to exported recipes', () => {
    assert.match(files.get('recipes/forms.md'), /href="signal-forms\.md"/);
    assert.match(files.get('recipes/forms.md'), /href="tanstack-form\.md"/);
    assert.match(files.get('recipes/tanstack-form.md'), /\]\(signal-forms\.md\)/);
});

test('all final pages, example shards and the full dump have valid local files and anchors', () => {
    assert.deepEqual(validateMarkdownLinks(new Map([...files, ['llms-full.txt', fullDocs.join('\n\n')]])), []);
    assert.match(fullDocs.join('\n\n'), /\]\(components\/signal-forms\.md#control-integration-matrix\)/);
});

const component = (body) => ({
    section: 'components',
    slug: 'demo',
    title: 'Demo',
    description: 'Demo',
    storybookId: 'primitives-demo',
    body
});

test('same-page links in extracted example prose resolve from the original page, with code untouched', () => {
    const body =
        '# Demo\n## Examples\n### First\n[Next](#second)\n```md\n[Example only](#missing)\n```\n### Second\nDone.\n';
    const bundle = createMarkdownBundle([component(body)], { versionLine: 'Test version' });
    assert.match(bundle.files.get('examples/demo--first.md'), /\[Next\]\(demo--second\.md\)/);
    assert.match(bundle.files.get('examples/demo--first.md'), /\[Example only\]\(#missing\)/);
    assert.deepEqual(validateMarkdownLinks(bundle.files), []);
});

test('code immediately after an example heading survives splitting, including the last example', () => {
    const source = '```md\n## This is example code\n[Example only](#missing)\n```';
    const bundle = createMarkdownBundle([component(`# Demo\n## Examples\n### Only code\n\n${source}\n`)], {
        versionLine: 'Test'
    });
    assert.ok(bundle.files.get('examples/demo--only-code.md').endsWith(source));
    assert.deepEqual(validateMarkdownLinks(bundle.files), []);
    assert.match(files.get('examples/autocomplete--disabled.md'), /export class AutocompleteDisabled/);
    assert.match(files.get('examples/stepper--vertical.md'), /rdxStepperRoot/);
});

test('duplicate example filenames and unknown Storybook pages fail explicitly', () => {
    assert.throws(
        () =>
            createMarkdownBundle([component('# Demo\n## Examples\n### Test!\nA\n### Test\nB')], {
                versionLine: 'Test'
            }),
        /Duplicate example slug/
    );
    assert.throws(
        () =>
            createMarkdownBundle([component('# Demo\n[Missing](?path=/docs/removed--docs)')], { versionLine: 'Test' }),
        /unknown Storybook page/
    );
});
