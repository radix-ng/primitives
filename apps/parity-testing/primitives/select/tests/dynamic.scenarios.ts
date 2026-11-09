import { expect } from '@playwright/test';
import type { Scenario } from './scenario';

// F-keys are application commands shared by both fixtures. They change only the option
// data, without moving focus out of the popup or driving the primitive's state.
export const dynamicScenarios: Scenario[] = [
    {
        name: 'dynamic: removed selection falls back to initial',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.key('Enter');
            await d.closed(true);
            await d.open();
            await d.key('F3');
            await expect(d.option('banana')).toHaveCount(0);
            await d.checkpoint('restored initial', { open: true, label: 'Apple', entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'dynamic: removal change can be canceled',
        fixture: 'dynamic-cancel-value',
        async run(d) {
            await d.open();
            await d.key('F4');
            await expect(d.option('apple')).toHaveCount(0);
            await d.checkpoint('canceled', { open: true, label: 'Apple', entries: [['choice', 'apple']] });
            await d.key('Escape');
            await d.closed(true);
            await d.checkpoint('retained', { open: false, label: 'Apple', entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'dynamic: insert during navigation',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('F2');
            await expect(d.option('apricot')).toBeVisible();
            await d.key('ArrowDown');
            await d.highlighted('apricot');
            await d.checkpoint('inserted', { open: true, entries: [['choice', 'apple']] });
            await d.key('Enter');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Apricot', entries: [['choice', 'apricot']] });
        }
    },
    {
        name: 'dynamic: reorder during navigation',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.key('F6');
            await expect(d.page.locator('[data-option-key]')).toHaveText(['Cherry', 'Blueberry', 'Banana', 'Apple']);
            await d.checkpoint('reordered', { open: true, entries: [['choice', 'apple']] });
            // Both navigate in the new DOM order. Base UI resets the highlight to the selected
            // value on reorder; Angular retains the highlighted element (recorded separately).
            await d.key('Home');
            await d.key('ArrowDown');
            await d.highlighted('blueberry');
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.key('Enter');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Banana', entries: [['choice', 'banana']] });
        }
    },
    {
        name: 'dynamic: remove highlighted option',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.key('F3');
            await expect(d.option('banana')).toHaveCount(0);
            await d.checkpoint('removed', { open: true, entries: [['choice', 'apple']] });
            await d.choose('cherry');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    },
    {
        name: 'dynamic: remove selected option',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('F4');
            await expect(d.option('apple')).toHaveCount(0);
            await d.checkpoint('removed', { open: true, entries: [['choice', '']], label: 'Choose a fruit' });
            await d.choose('cherry');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    },
    {
        name: 'dynamic: disable highlighted option',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.key('F8');
            await expect(d.option('banana')).toHaveAttribute('aria-disabled', 'true');
            await d.key('Enter');
            await d.checkpoint('activation ignored', { open: true, entries: [['choice', 'apple']] });
            await d.key('c');
            await d.highlighted('cherry');
            await d.key('Enter');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    },
    {
        name: 'dynamic: rename selected label while closed',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.key('Enter');
            await d.closed(true);
            await d.key('F7');
            await expect(d.trigger).toHaveText('Pear');
            await d.checkpoint('renamed', { open: false, label: 'Pear', entries: [['choice', 'banana']] });
            await d.open();
            await d.checkpoint('reopened', { open: true, selected: ['banana'], label: 'Pear' });
        }
    },
    {
        name: 'dynamic: multiple prunes removed values',
        fixture: 'dynamic-multiple',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.key('Enter');
            await d.key('F4');
            await expect(d.option('apple')).toHaveCount(0);
            await d.checkpoint('removed', {
                open: true,
                selected: ['banana'],
                entries: [['choice', 'banana']]
            });
            await d.key('End');
            await d.key('Enter');
            await d.checkpoint('selected', {
                open: true,
                selected: ['banana', 'cherry'],
                entries: [
                    ['choice', 'banana'],
                    ['choice', 'cherry']
                ]
            });
        }
    },
    {
        name: 'dynamic: reload objects with key equality',
        fixture: 'dynamic-objects',
        async run(d) {
            await d.open();
            await d.key('F9');
            await d.checkpoint('reloaded', { open: true, selected: ['apple'], entries: [['choice', 'apple']] });
            await d.choose('banana');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Banana', entries: [['choice', 'banana']] });
        }
    },
    {
        name: 'dynamic: typeahead uses live labels',
        fixture: 'dynamic',
        async run(d) {
            await d.open();
            await d.key('b');
            await d.highlighted('banana');
            await d.key('F7');
            await expect(d.option('banana')).toHaveText('Pear');
            await d.key('p');
            await d.highlighted('banana');
            await d.checkpoint('renamed match', { open: true, entries: [['choice', 'apple']] });
            await d.key('Enter');
            await d.closed(true);
            await d.checkpoint('selected', { label: 'Pear', entries: [['choice', 'banana']] });
        }
    }
];
