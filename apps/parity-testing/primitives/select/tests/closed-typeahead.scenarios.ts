import { expect } from '@playwright/test';
import type { SelectDriver } from './driver';
import type { Scenario } from './scenario';

async function focus(d: SelectDriver) {
    await d.trigger.focus();
    await d.checkpoint('focused while closed', { open: false, focus: 'trigger', popupVisible: false });
}
const valueEvent = (value: string, canceled = false) => ({
    type: 'value' as const,
    value,
    reason: 'none',
    canceled,
    kinds: ['string'],
    references: true
});

export const closedTypeaheadScenarios: Scenario[] = [
    {
        name: 'closed typeahead: prefix and cycling',
        fixture: 'typeahead',
        async run(d) {
            await focus(d);
            await d.key('b');
            await expect(d.trigger).toHaveText('Berlin');
            await d.checkpoint('first match', {
                open: false,
                focus: 'trigger',
                popupVisible: false,
                entries: [['choice', 'berlin']],
                events: [valueEvent('berlin')]
            });
            await d.key('b');
            await expect(d.trigger).toHaveText('Bern');
            await d.checkpoint('cycled', {
                open: false,
                focus: 'trigger',
                entries: [['choice', 'bern']],
                events: [valueEvent('berlin'), valueEvent('bern')]
            });
        }
    },
    {
        name: 'closed typeahead: rapid multiword',
        fixture: 'typeahead',
        async run(d) {
            await focus(d);
            await d.page.keyboard.type('new y');
            await expect(d.trigger).toHaveText('New York');
            await d.checkpoint('multiword committed', {
                open: false,
                focus: 'trigger',
                popupVisible: false,
                entries: [['choice', 'new-york']],
                events: Array.from({ length: 5 }, () => valueEvent('new-york'))
            });
        }
    },
    {
        name: 'closed typeahead: value cancellation',
        fixture: 'typeahead-cancel-value',
        async run(d) {
            await focus(d);
            await d.key('b');
            await d.checkpoint('first canceled', {
                open: false,
                label: 'Amsterdam',
                entries: [['choice', 'amsterdam']],
                events: [valueEvent('berlin', true)]
            });
            await d.key('b');
            await d.checkpoint('cycling canceled', {
                open: false,
                label: 'Amsterdam',
                entries: [['choice', 'amsterdam']],
                events: [valueEvent('berlin', true), valueEvent('bern', true)]
            });
        }
    },
    {
        name: 'closed typeahead: timeout and idle Space',
        fixture: 'typeahead',
        async run(d) {
            await d.page.clock.install();
            await focus(d);
            await d.key('b');
            await expect(d.trigger).toHaveText('Berlin');
            await d.page.clock.runFor(800);
            await d.checkpoint('expired', { open: false, focus: 'trigger', label: 'Berlin' });
            await d.open(false, 'Space');
            await d.checkpoint('opened normally', { open: true, selected: ['berlin'] });
        }
    },
    {
        name: 'closed typeahead: blur resets search',
        fixture: 'typeahead',
        async run(d) {
            await focus(d);
            await d.key('n');
            await expect(d.trigger).toHaveText('New York');
            await d.focusAfter();
            await d.trigger.focus();
            await d.key('b');
            await expect(d.trigger).toHaveText('Berlin');
            await d.checkpoint('fresh after blur', { open: false, focus: 'trigger', entries: [['choice', 'berlin']] });
        }
    },
    {
        name: 'closed typeahead: popup blur resets search',
        fixture: 'typeahead',
        async run(d) {
            await d.open();
            await d.key('n');
            await d.highlighted('new-york');
            await d.key('Escape');
            await d.closed();
            await expect(d.trigger).toBeFocused();
            await d.key('b');
            await expect(d.trigger).toHaveText('Berlin');
            await d.checkpoint('fresh after popup blur', {
                open: false,
                focus: 'trigger',
                entries: [['choice', 'berlin']]
            });
        }
    },
    {
        name: 'closed typeahead: duplicate labels',
        fixture: 'typeahead-duplicate-labels',
        async run(d) {
            await focus(d);
            await d.key('b');
            await d.checkpoint('first Berlin', { open: false, label: 'Berlin', entries: [['choice', 'berlin-one']] });
            await d.key('b');
            await d.checkpoint('second Berlin', { open: false, label: 'Berlin', entries: [['choice', 'berlin-two']] });
        }
    },
    {
        name: 'closed typeahead: skips disabled matches',
        fixture: 'typeahead',
        async run(d) {
            await focus(d);
            await d.key('t');
            await d.checkpoint('ignored', {
                open: false,
                focus: 'trigger',
                entries: [['choice', 'amsterdam']],
                events: []
            });
        }
    },
    ...(['typeahead-read-only', 'typeahead-multiple'] as const).map(
        (fixture): Scenario => ({
            name: `closed typeahead: inactive in ${fixture}`,
            fixture,
            async run(d) {
                await focus(d);
                await d.key('b');
                await d.checkpoint('unchanged', {
                    open: false,
                    focus: 'trigger',
                    label: 'Amsterdam',
                    entries: [['choice', 'amsterdam']],
                    events: []
                });
            }
        })
    )
];
