import { expect } from '@playwright/test';
import { cases, type Probe } from '../src/contract';
import type { AccordionDriver } from './driver';

export const identityScenarios = Object.entries(cases)
    .filter(([, s]) => s.identity)
    .map(([name, s]) => ({
        name,
        async run(d: AccordionDriver) {
            const { page } = d;
            const kind = s.identity!;
            const multiple = s.multiple!;
            // Native references prove that reordering preserves hosts/IDs and remounting replaces them.
            const originals = await page.evaluateHandle(
                () =>
                    new Map(
                        [...document.querySelectorAll<HTMLElement>('[data-testid$="-item"]')].map((item) => {
                            const id = item.dataset.testid!.replace(/-item$/, '');
                            return [
                                id,
                                {
                                    item,
                                    triggerId: item.querySelector<HTMLElement>('[data-testid$="-trigger"]')!.id,
                                    panelId: item.querySelector<HTMLElement>('[data-testid$="-panel"]')!.id
                                }
                            ];
                        })
                    )
            );
            const trace: Probe['trace'] = [];
            const checkpoint = async (name: string, selection: string[], open: string[], order?: string[]) => {
                const read = () =>
                    page.evaluate((originals) => {
                        const rows = [...document.querySelectorAll<HTMLElement>('[data-testid$="-item"]')].map(
                            (item) => {
                                const id = item.dataset.testid!.replace(/-item$/, '');
                                const trigger = item.querySelector<HTMLElement>('[data-testid$="-trigger"]')!;
                                const panel = item.querySelector<HTMLElement>('[data-testid$="-panel"]')!;
                                const original = originals.get(id);
                                const open = trigger.getAttribute('aria-expanded') === 'true';
                                return {
                                    id,
                                    open,
                                    index: item.getAttribute('data-index'),
                                    sameHost: original ? original.item === item : null,
                                    sameTriggerId: original ? original.triggerId === trigger.id : null,
                                    samePanelId: original ? original.panelId === panel.id : null,
                                    labelled: panel.getAttribute('aria-labelledby') === trigger.id,
                                    controls: open
                                        ? trigger.getAttribute('aria-controls') === panel.id
                                        : !trigger.hasAttribute('aria-controls'),
                                    hidden: panel.getAttribute('hidden'),
                                    input: panel.querySelector('input')!.value,
                                    parts: Object.fromEntries(
                                        ['item', 'header', 'trigger', 'panel'].map((part) => {
                                            const node =
                                                part === 'item'
                                                    ? item
                                                    : item.querySelector<HTMLElement>(`[data-testid="${id}-${part}"]`)!;
                                            return [
                                                part,
                                                Object.fromEntries(
                                                    [...node.attributes]
                                                        .filter(
                                                            (attribute) =>
                                                                attribute.name.startsWith('data-') &&
                                                                attribute.name !== 'data-testid' &&
                                                                !attribute.name.startsWith('data-rdx-')
                                                        )
                                                        .map((attribute) => [attribute.name, attribute.value])
                                                )
                                            ];
                                        })
                                    )
                                };
                            }
                        );
                        return {
                            selection: JSON.parse(
                                document.querySelector('[data-testid="selection"]')!.textContent!
                            ) as string[],
                            order: rows.map((row) => row.id),
                            open: rows.filter((row) => row.open).map((row) => row.id),
                            rows,
                            trace: window.accordionParity.trace
                        };
                    }, originals);
                const expected = { selection, open, trace: [...trace], ...(order ? { order } : {}) };
                await expect.poll(read).toMatchObject(expected);
                let state = await read();
                let previous = '';
                let stable = 0;
                for (let frame = 0; frame < 120; frame++) {
                    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
                    state = await read();
                    const current = JSON.stringify(state);
                    stable = current === previous ? stable + 1 : 0;
                    if (stable >= 3) break;
                    if (frame === 119) throw new Error('Accordion identity did not settle');
                    previous = current;
                }
                expect(state).toMatchObject(expected);
                for (const [index, row] of state.rows.entries()) {
                    expect(row.index).toBe(String(index));
                    expect(row.labelled).toBe(true);
                    expect(row.controls).toBe(true);
                }
                expect(d.errors).toEqual([]);
                d.checkpoints.push({ name, state });
                d.measurements.push({ name, dom: await page.locator('body').innerHTML() });
                return state;
            };
            const request = async (id: string, nextOpen: boolean, value: string[]) => {
                trace.push(
                    {
                        part: id,
                        next: nextOpen,
                        reason: 'trigger-press',
                        type: 'click',
                        target: `${id}-trigger`,
                        shared: true
                    },
                    {
                        part: 'root',
                        next: value,
                        reason: 'trigger-press',
                        type: 'click',
                        target: `${id}-trigger`,
                        shared: true
                    }
                );
                await page.getByTestId(`${id}-trigger`).click();
            };
            const action = (id: string) => page.getByTestId(id).click();
            try {
                if (kind === 'controlled') {
                    await checkpoint('controlled object default', ['a'], ['a'], ['a', 'b']);
                    await action('external-orphan');
                    await checkpoint('equal object is a distinct external selection', ['orphan'], []);
                    await request('a', true, multiple ? ['orphan', 'a'] : ['a']);
                    await checkpoint('refused request keeps exact external reference', ['orphan'], []);
                    await action('accept');
                    const accepted = multiple ? ['orphan', 'b'] : ['b'];
                    await request('b', true, accepted);
                    await checkpoint('accepted request preserves reference payload', accepted, ['b']);
                    await action('external-clear');
                    await checkpoint('external clear is silent', [], []);
                    return;
                }
                if (kind === 'replace') {
                    await checkpoint('default object reference', ['a'], ['a'], ['a', 'b']);
                    await page.getByTestId('a-panel').locator('input').fill('edited');
                    await action('replace-a');
                    const replaced = await checkpoint('new equal value closes the same host silently', ['a'], []);
                    expect(replaced.rows[0]).toMatchObject({ sameHost: true, samePanelId: true, input: 'edited' });
                    const selected = multiple ? ['a', 'replacement'] : ['replacement'];
                    await request('a', true, selected);
                    await checkpoint('request uses replacement reference', selected, ['a']);
                    await action('restore-a');
                    await checkpoint(
                        'restoring original value reads existing membership',
                        selected,
                        multiple ? ['a'] : []
                    );
                    await request('a', !multiple, multiple ? ['replacement'] : ['a']);
                    await checkpoint(
                        'next request uses restored reference',
                        multiple ? ['replacement'] : ['a'],
                        multiple ? [] : ['a']
                    );
                    return;
                }
                if (kind === 'collection') {
                    const selected = multiple ? ['a', 'b'] : ['a'];
                    const movedOpen = multiple ? ['b', 'a'] : ['a'];
                    await checkpoint('default selection', selected, selected, ['a', 'b']);
                    await page.getByTestId('a-panel').locator('input').fill('edited');
                    await action('reorder');
                    const reordered = await checkpoint(
                        'keyed move preserves values and native state',
                        selected,
                        movedOpen,
                        ['b', 'a']
                    );
                    expect(reordered.rows[1]).toMatchObject({
                        sameHost: true,
                        sameTriggerId: true,
                        samePanelId: true,
                        input: 'edited'
                    });
                    await action('insert');
                    await checkpoint('insert updates indices without selection requests', selected, movedOpen, [
                        'c',
                        'b',
                        'a'
                    ]);
                    await action('remove-a');
                    await checkpoint('removal keeps orphaned selected reference', selected, multiple ? ['b'] : [], [
                        'c',
                        'b'
                    ]);
                    await action('return-a');
                    const returned = await checkpoint('same value opens a recreated item', selected, movedOpen, [
                        'c',
                        'b',
                        'a'
                    ]);
                    expect(returned.rows[2]).toMatchObject({
                        sameHost: false,
                        sameTriggerId: false,
                        samePanelId: false,
                        input: 'initial'
                    });
                    await request('a', false, multiple ? ['b'] : []);
                    await checkpoint(
                        'recreated item can close the original selection',
                        multiple ? ['b'] : [],
                        multiple ? ['b'] : []
                    );
                    return;
                }
                if (kind === 'fallback-recreate') {
                    await checkpoint('nullish initial values', [], [], ['a', 'b']);
                    await request('a', true, ['generated:1']);
                    await checkpoint('generated value selected', ['generated:1'], ['a']);
                    await action('reorder');
                    const moved = await checkpoint(
                        'generated value survives keyed move',
                        ['generated:1'],
                        ['a'],
                        ['b', 'a']
                    );
                    expect(moved.rows[1]).toMatchObject({ sameHost: true, sameTriggerId: true, samePanelId: true });
                    await action('remove-a');
                    await checkpoint('removed generated value remains selected', ['generated:1'], [], ['b']);
                    await action('return-a');
                    const returned = await checkpoint(
                        'new item gets a new fallback identity',
                        ['generated:1'],
                        [],
                        ['b', 'a']
                    );
                    expect(returned.rows[1]).toMatchObject({
                        sameHost: false,
                        sameTriggerId: false,
                        samePanelId: false
                    });
                    const selected = multiple ? ['generated:1', 'generated:2'] : ['generated:2'];
                    await request('a', true, selected);
                    await checkpoint('recreated item requests its new identity', selected, ['a']);
                    return;
                }
                if (kind === 'mode') {
                    await checkpoint('multiple object defaults', ['a', 'b'], ['a', 'b'], ['a', 'b']);
                    await action('toggle-multiple');
                    await checkpoint('single mode does not reinterpret the existing array', ['a', 'b'], ['a', 'b']);
                    await request('b', false, ['b']);
                    await checkpoint('single request compares the first reference', ['b'], ['b']);
                    await request('b', false, []);
                    await checkpoint('first value can close', [], []);
                    await action('toggle-multiple');
                    await request('b', true, ['b']);
                    await checkpoint('multiple mode after reset', ['b'], ['b']);
                    await request('a', true, ['b', 'a']);
                    await checkpoint('multiple appends preserve request order', ['b', 'a'], ['a', 'b']);
                    return;
                }
                if (kind === 'shared') {
                    await checkpoint('shared identity initial', [], [], ['a', 'b', 'c']);
                    await request('a', true, ['a']);
                    await checkpoint('shared value expands both items without sibling callbacks', ['a'], ['a', 'b']);
                    await request('c', true, multiple ? ['a', 'c'] : ['c']);
                    await checkpoint(
                        'structurally equal clone is distinct',
                        multiple ? ['a', 'c'] : ['c'],
                        multiple ? ['a', 'b', 'c'] : ['c']
                    );
                    await request('b', !multiple, multiple ? ['c'] : ['a']);
                    await checkpoint(
                        'shared trigger uses the same identity',
                        multiple ? ['c'] : ['a'],
                        multiple ? ['c'] : ['a', 'b']
                    );
                    return;
                }
                if (kind === 'duplicates') {
                    await checkpoint(
                        'frozen defaults preserve duplicate references',
                        ['a', 'a', 'b'],
                        ['a', 'b'],
                        ['a', 'b']
                    );
                    await request('a', false, multiple ? ['b'] : []);
                    await checkpoint(
                        'close removes every copy of the requested reference',
                        multiple ? ['b'] : [],
                        multiple ? ['b'] : []
                    );
                    await request('b', !multiple, multiple ? [] : ['b']);
                    await checkpoint(
                        'remaining value follows the active mode',
                        multiple ? [] : ['b'],
                        multiple ? [] : ['b']
                    );
                    return;
                }
                if (kind === 'nan') {
                    await checkpoint('numeric initial', [], [], ['a', 'b', 'c']);
                    await request('a', true, ['a']);
                    await checkpoint('NaN membership is open', ['a'], ['a']);
                    await request('a', false, ['a']);
                    await checkpoint('pin uses strict equality for removal and retains NaN', ['a'], ['a']);
                    await request('b', true, multiple ? ['a', 'b'] : ['b']);
                    await checkpoint(
                        'signed zero shares membership',
                        multiple ? ['a', 'b'] : ['b'],
                        multiple ? ['a', 'b', 'c'] : ['b', 'c']
                    );
                    await request('c', false, multiple ? ['a'] : []);
                    await checkpoint(
                        'opposite zero removes the selected signed zero',
                        multiple ? ['a'] : [],
                        multiple ? ['a'] : []
                    );
                    return;
                }
                const ids = kind === 'primitive-types' ? ['a', 'b', 'c', 'd'] : ['a', 'b', 'c'];
                await checkpoint('identity initial', [], [], ids);
                let selected: string[] = [];
                for (const [index, id] of ids.entries()) {
                    const label = kind === 'fallback' ? `generated:${index + 1}` : id;
                    selected = multiple ? [...selected, label] : [label];
                    await request(id, true, selected);
                    await checkpoint(
                        `select ${id} by exact identity`,
                        selected,
                        multiple ? ids.slice(0, index + 1) : [id]
                    );
                }
                const last = ids.at(-1)!;
                selected = multiple ? selected.slice(0, -1) : [];
                await request(last, false, selected);
                await checkpoint(
                    'close removes only the requested identity',
                    selected,
                    multiple ? ids.slice(0, -1) : []
                );
                if (kind === 'fallback') {
                    const next = multiple ? ['generated:2'] : ['generated:1'];
                    await request('a', !multiple, next);
                    await checkpoint(
                        'nullish fallback remains stable after sibling requests',
                        next,
                        multiple ? ['b'] : ['a']
                    );
                }
            } finally {
                await originals.dispose();
            }
        }
    }));
