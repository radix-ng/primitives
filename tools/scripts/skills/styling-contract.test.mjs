import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { parseDataAttributes } from './styling-contract.mjs';

const primitiveRoot = new URL('../../../packages/primitives/', import.meta.url);
const doc = (slug) => readFileSync(new URL(`${slug}/stories/${slug}.docs.mdx`, primitiveRoot), 'utf8');

test('legacy global tables keep explicit parts and escaped union values', () => {
    assert.deepEqual(
        parseDataAttributes(`## Data attributes
| Attribute | Parts | Values |
| --- | --- | --- |
| \`data-state\` | Root, Item | \`"open" \\| "closed"\` |
`),
        [{ attribute: 'data-state', parts: 'Root, Item', values: '"open" | "closed"' }]
    );
});

test('per-part tables retain ownership, combined hooks and value descriptions', () => {
    assert.deepEqual(
        parseDataAttributes(`## API Reference
### Popup
**Data attributes**
| Attribute | Present when / value |
| --- | --- |
| \`data-open\` / \`data-closed\` | Reflects the open state. |
### Arrow
| Data attribute | Value |
| :--- | ---: |
| \`[data-side]\` | \`"top" \\| "bottom"\` |
### Backdrop
**Data attributes**
| Attribute | Present when |
| --- | --- |
| \`data-open\` | The popup is open. |
`),
        [
            { attribute: 'data-open', parts: 'Popup', values: 'Reflects the open state.' },
            { attribute: 'data-closed', parts: 'Popup', values: 'Reflects the open state.' },
            { attribute: 'data-side', parts: 'Arrow', values: '"top" | "bottom"' },
            { attribute: 'data-open', parts: 'Backdrop', values: 'The popup is open.' }
        ]
    );
});

test('an unheaded single-part API uses its ArgTypes declaration; CSS tables and code are excluded', () => {
    const content = [
        '## API Reference',
        '<ArgTypes of={RdxButtonDirective} />',
        '**Data attributes**',
        '| Attribute | Present when |',
        '| --- | --- |',
        '| `data-disabled` | The button is disabled. |',
        '**CSS variables**',
        '| Variable | Description |',
        '| --- | --- |',
        '| `--size` | A measured size. |',
        '```md',
        '### Fake',
        '| Attribute | Value |',
        '| --- | --- |',
        '| `data-fake` | Example only. |',
        '```',
        '~~~md',
        '| Attribute | Value |',
        '| --- | --- |',
        '| `data-fake` | Example only. |',
        '~~~'
    ].join('\n');
    assert.deepEqual(parseDataAttributes(content), [
        { attribute: 'data-disabled', parts: 'RdxButtonDirective', values: 'The button is disabled.' }
    ]);
});

test('Select Popup exports the documented presence and positioning hooks', () => {
    const hooks = parseDataAttributes(doc('select'));
    const popup = hooks.filter(({ parts }) => parts === 'RdxSelectPopup');
    assert.deepEqual(
        popup.map(({ attribute }) => attribute),
        ['data-open', 'data-closed', 'data-starting-style', 'data-ending-style', 'data-side', 'data-align']
    );
    assert.equal(popup[0].values, 'The select is open.');
    assert.equal(popup[1].values, 'The select is closed.');
    assert.deepEqual(
        hooks
            .filter(({ parts, attribute }) => parts === 'RdxSelectArrow' && /data-(open|closed)$/.test(attribute))
            .map(({ attribute }) => attribute),
        ['data-open', 'data-closed']
    );
});

test('Tabs bracketed hooks retain each part and quoted direction values', () => {
    const hooks = parseDataAttributes(doc('tabs'));
    assert.equal(
        hooks.find(({ parts, attribute }) => parts === 'TabsTab' && attribute === 'data-activation-direction')?.values,
        '"left" | "right" | "up" | "down" | "none"'
    );
    assert.ok(hooks.some(({ parts, attribute }) => parts === 'TabsPanel' && attribute === 'data-hidden'));
    assert.ok(hooks.some(({ parts, attribute }) => parts === 'TabsIndicator' && attribute === 'data-orientation'));
});

test('Accordion parts keep their distinct hooks, and Stepper retains its documented enum', () => {
    const hooks = parseDataAttributes(doc('accordion'));
    const trigger = hooks.filter(({ parts }) => parts === 'Trigger').map(({ attribute }) => attribute);
    const panel = hooks.filter(({ parts }) => parts === 'Panel').map(({ attribute }) => attribute);
    assert.ok(trigger.includes('data-panel-open'));
    assert.ok(!trigger.includes('data-open'));
    assert.ok(panel.includes('data-open'));
    assert.ok(!panel.includes('data-closed'));
    assert.equal(
        parseDataAttributes(doc('stepper')).find(({ attribute }) => attribute === 'data-state')?.values,
        '"active" / "inactive" / "completed".'
    );
});

test('OTP and Editable use explicit Parts / Present on columns; Toast keeps its real data-state', () => {
    assert.equal(
        parseDataAttributes(doc('otp-field')).find(({ attribute }) => attribute === 'data-disabled')?.parts,
        'Root, Input'
    );
    assert.ok(parseDataAttributes(doc('editable')).every(({ parts }) => parts));
    assert.deepEqual(parseDataAttributes(doc('toast'))[0], {
        attribute: 'data-state',
        parts: 'Root',
        values: 'open while visible, closed once dismissal begins'
    });
});

test('all existing MDX attribute-table rows survive extraction, including repeated hooks on different parts', () => {
    for (const file of readdirSync(primitiveRoot, { recursive: true }).filter((file) => file.endsWith('.docs.mdx'))) {
        const content = readFileSync(new URL(file, primitiveRoot), 'utf8');
        const withoutCode = content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
        const documented = [...withoutCode.matchAll(/^\|\s*`?\[?data-[^\n|]*\|/gm)]
            .flatMap(([cell]) => cell.match(/\bdata-[a-z0-9-]+\b/g) ?? [])
            .sort();
        const hooks = parseDataAttributes(content);
        assert.deepEqual(hooks.map(({ attribute }) => attribute).sort(), documented, file);
        for (const hook of hooks) {
            assert.ok(hook.parts, `${file}: missing owner for ${hook.attribute}`);
            assert.ok(hook.values, `${file}: missing values for ${hook.attribute}`);
        }
    }
});

test('a primitive with no documented hooks keeps an empty list', () => {
    assert.deepEqual(parseDataAttributes(doc('aspect-ratio')), []);
    assert.deepEqual(parseDataAttributes('## API Reference\nNo inputs or state attributes.'), []);
});
