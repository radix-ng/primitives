import { expect } from '@playwright/test';
import { closedTypeaheadScenarios } from './closed-typeahead.scenarios';
import { type Snapshot } from './driver';
import { positioningScenarios } from './positioning.scenarios';
import type { Scenario } from './scenario';
import { typeaheadScenarios } from './typeahead.scenarios';

export const scenarios: Scenario[] = [
    ...typeaheadScenarios,
    ...closedTypeaheadScenarios,
    ...positioningScenarios,
    {
        name: 'keyboard and typeahead',
        fixture: 'single',
        async run(d) {
            await d.open();
            await d.checkpoint('opened', { open: true, entries: [['choice', 'apple']] });
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.checkpoint('arrow');
            await d.key('ArrowDown');
            await d.highlighted('blueberry');
            await d.checkpoint('disabled option', { highlighted: ['blueberry'] });
            await d.key('Home');
            await d.key('b');
            await d.highlighted('banana');
            await d.checkpoint('typeahead');
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected', { label: 'Banana', entries: [['choice', 'banana']] });
        }
    },
    {
        name: 'disabled options: navigation and blocked activation',
        fixture: 'disabled-navigation',
        async run(d) {
            const unchanged: Partial<Snapshot> = {
                open: true,
                label: 'Banana',
                entries: [['choice', 'banana']],
                events: [
                    { type: 'open', open: true, reason: 'trigger-press', canceled: false, held: false },
                    { type: 'complete', open: true }
                ]
            };
            await d.open();
            await d.key('ArrowDown');
            await d.highlighted('blueberry');
            await d.checkpoint('disabled middle', { ...unchanged, highlighted: ['blueberry'] });
            await d.key('Enter');
            await d.key('Space');
            await d.checkpoint('activation ignored', { ...unchanged, highlighted: ['blueberry'] });
            await d.key('Home');
            await d.highlighted('apple');
            await d.key('ArrowUp');
            await d.checkpoint('disabled first', { ...unchanged, highlighted: ['apple'] });
            await d.key('End');
            await d.highlighted('cherry');
            await d.key('ArrowDown');
            await d.checkpoint('disabled last', { ...unchanged, highlighted: ['cherry'] });
            await d.key('ArrowUp');
            await d.highlighted('blackberry');
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('enabled selected', { label: 'Blackberry', entries: [['choice', 'blackberry']] });
        }
    },
    {
        name: 'typeahead skips disabled options',
        fixture: 'disabled-navigation',
        async run(d) {
            await d.open();
            await d.key('b');
            await d.highlighted('blackberry');
            await d.checkpoint('first enabled match', { highlighted: ['blackberry'], entries: [['choice', 'banana']] });
            await d.key('b');
            await d.highlighted('banana');
            await d.checkpoint('cycles enabled matches', { highlighted: ['banana'], entries: [['choice', 'banana']] });
            await d.key('b');
            await d.highlighted('blackberry');
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected', { label: 'Blackberry', entries: [['choice', 'blackberry']] });
        }
    },
    {
        name: 'pointer selection',
        fixture: 'single',
        async run(d) {
            await d.open(true);
            await d.checkpoint('opened');
            await d.choose('cherry');
            await d.closed();
            await d.checkpoint('selected', { label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    },
    {
        name: 'multiple selection',
        fixture: 'multiple',
        async run(d) {
            await d.open();
            await d.choose('banana');
            await d.checkpoint('added', {
                open: true,
                entries: [
                    ['choice', 'apple'],
                    ['choice', 'banana']
                ]
            });
            await d.choose('apple');
            await d.checkpoint('removed', { open: true, entries: [['choice', 'banana']] });
            await d.key('Escape');
            await d.closed();
            await d.checkpoint('closed');
        }
    },
    {
        name: 'disabled trigger',
        fixture: 'disabled',
        async run(d) {
            await d.page.getByTestId('before').focus();
            await d.key('Tab');
            // Safari's default Tab policy can skip every button, including "after".
            // Keep the exact focus in the comparison and assert the disabled control is skipped.
            await d.checkpoint('skipped', { open: false, disabled: true, entries: [] });
            await expect(d.trigger).not.toBeFocused();
        }
    },
    {
        name: 'read-only pointer selection',
        fixture: 'read-only',
        async run(d) {
            await d.open();
            await d.choose('banana');
            await d.checkpoint('ignored pointer', { open: true, entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'read-only keyboard selection',
        fixture: 'read-only',
        async run(d) {
            await d.open();
            await d.key('ArrowDown');
            await d.key('Enter');
            await d.checkpoint('ignored keyboard', { open: true, entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'cancel open',
        fixture: 'cancel-open',
        async run(d) {
            await d.trigger.press('Enter');
            await d.checkpoint('canceled', { open: false, popupVisible: false });
        }
    },
    {
        name: 'cancel value',
        fixture: 'cancel-value',
        async run(d) {
            await d.open();
            await d.choose('banana');
            await d.closed();
            await d.checkpoint('canceled', { entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'cancel close',
        fixture: 'cancel-close',
        async run(d) {
            await d.open();
            await d.key('Escape');
            await d.checkpoint('escape canceled', { open: true });
            await d.action('close');
            await d.checkpoint('action canceled', { open: true });
        }
    },
    {
        name: 'deferred unmount',
        fixture: 'deferred',
        async run(d) {
            await d.open();
            await d.action('close');
            await d.closed();
            await d.checkpoint('held', { open: false, popupMounted: true, popupVisible: true });
            await d.action('unmount');
            await d.checkpoint('finished', { focus: 'trigger' });
            await d.action('unmount');
            await d.checkpoint('duplicate finish');
        }
    },
    {
        name: 'reopen deferred close',
        fixture: 'deferred',
        async run(d) {
            await d.open();
            await d.action('close');
            await d.closed();
            await d.checkpoint('held');
            await d.open();
            await d.checkpoint('reopened', { open: true, popupVisible: true });
            await d.action('unmount');
            await d.checkpoint('stale finish', { open: true });
            await d.action('close');
            await d.closed();
            await d.action('unmount');
            await d.checkpoint('finished', { open: false });
        }
    },
    {
        name: 'native reset',
        fixture: 'single',
        async run(d) {
            await d.open();
            await d.choose('banana');
            await d.closed();
            await d.checkpoint('selected');
            await d.reset();
            await d.checkpoint('reset');
        }
    },
    {
        name: 'object values',
        fixture: 'objects',
        async run(d) {
            await d.open();
            await d.choose('banana');
            await d.closed();
            await d.checkpoint('selected', { entries: [['choice', 'banana']] });
            await d.open();
            await d.checkpoint('reopened', { selected: ['banana'] });
        }
    },
    {
        name: 'array-valued item',
        fixture: 'array',
        async run(d) {
            await d.open();
            await d.choose('30:40');
            await d.closed();
            await d.checkpoint('selected', { entries: [['choice', '30:40']] });
            await d.open();
            await d.checkpoint('reopened', { selected: ['30:40'] });
        }
    },
    ...(['Tab', 'Shift+Tab', 'focus outside'] as const).map(
        (action): Scenario => ({
            name: `default policy: ${action}`,
            fixture: 'single',
            async run(d) {
                await d.open();
                await d.checkpoint('opened');
                if (action === 'focus outside') await d.focusAfter();
                else await d.key(action);
                await d.checkpoint('left', { entries: [['choice', 'apple']] });
            }
        })
    ),
    {
        name: 'opt-in focus out',
        fixture: 'focus-out',
        async run(d) {
            await d.open();
            await d.checkpoint('opened');
            await d.key('Tab');
            await d.closed();
            await d.checkpoint('left', { focus: 'after', entries: [['choice', 'apple']] });
        }
    }
];
