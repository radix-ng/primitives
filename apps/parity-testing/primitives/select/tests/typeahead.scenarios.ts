import type { Scenario } from './scenario';

export const typeaheadScenarios: Scenario[] = [
    {
        name: 'typeahead: multiword prefix and commit',
        fixture: 'typeahead',
        async run(d) {
            await d.open();
            for (const character of 'new d') await d.key(character === ' ' ? 'Space' : character);
            await d.highlighted('new-delhi');
            await d.checkpoint('multiword', { open: true, label: 'Amsterdam', entries: [['choice', 'amsterdam']] });
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected', { label: 'New Delhi', entries: [['choice', 'new-delhi']] });
        }
    },
    {
        name: 'typeahead: origin after arrows',
        fixture: 'typeahead',
        async run(d) {
            await d.open();
            await d.key('End');
            await d.highlighted('tokyo');
            await d.key('b');
            await d.highlighted('berlin');
            await d.checkpoint('search starts after selection', {
                highlighted: ['berlin'],
                entries: [['choice', 'amsterdam']]
            });
            await d.key('b');
            await d.highlighted('bern');
            await d.checkpoint('cycles', { highlighted: ['bern'] });
        }
    },
    {
        name: 'typeahead: Space on disabled then recovery',
        fixture: 'disabled-navigation',
        async run(d) {
            await d.open();
            await d.key('End');
            await d.key('Space');
            await d.key('b');
            await d.checkpoint('leading space miss', {
                open: true,
                highlighted: ['cherry'],
                entries: [['choice', 'banana']]
            });
            await d.key('b');
            await d.highlighted('blackberry');
            await d.checkpoint('fresh query', { highlighted: ['blackberry'], entries: [['choice', 'banana']] });
        }
    },
    {
        name: 'typeahead: miss resets immediately',
        fixture: 'typeahead',
        async run(d) {
            await d.open();
            await d.key('z');
            await d.key('b');
            await d.highlighted('berlin');
            await d.checkpoint('recovered', { highlighted: ['berlin'] });
        }
    },
    {
        name: 'typeahead: repeated letters inside labels',
        fixture: 'typeahead-double-letter',
        async run(d) {
            await d.open();
            await d.key('a');
            await d.key('a');
            await d.highlighted('aachen');
            await d.checkpoint('double initial', { highlighted: ['aachen'] });
            await d.key('r');
            await d.highlighted('aardvark');
            await d.checkpoint('longer prefix', { highlighted: ['aardvark'] });
        }
    },
    {
        name: 'typeahead: duplicate labels remain distinct',
        fixture: 'typeahead-duplicate-labels',
        async run(d) {
            await d.open();
            await d.key('b');
            await d.highlighted('berlin-one');
            await d.key('b');
            await d.highlighted('berlin-two');
            await d.checkpoint('second identical label', { highlighted: ['berlin-two'] });
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected second value', { entries: [['choice', 'berlin-two']] });
        }
    },
    {
        name: 'typeahead: timeout and Space activation',
        fixture: 'typeahead',
        async run(d) {
            await d.page.clock.install();
            await d.open();
            await d.key('n');
            await d.highlighted('new-york');
            await d.page.clock.runFor(800);
            await d.key('Space');
            await d.closed();
            await d.checkpoint('committed after timeout', { label: 'New York', entries: [['choice', 'new-york']] });
        }
    },
    {
        name: 'typeahead: close and reopen reset',
        fixture: 'typeahead',
        async run(d) {
            await d.open();
            await d.key('n');
            await d.key('Escape');
            await d.closed();
            await d.open();
            await d.key('b');
            await d.highlighted('berlin');
            await d.checkpoint('fresh on reopen', { highlighted: ['berlin'] });
        }
    },
    {
        name: 'typeahead: read-only multiword search',
        fixture: 'typeahead-read-only',
        async run(d) {
            await d.open();
            for (const character of 'new y') await d.key(character === ' ' ? 'Space' : character);
            await d.highlighted('new-york');
            await d.key('Enter');
            await d.checkpoint('not committed', {
                open: true,
                label: 'Amsterdam',
                highlighted: ['new-york'],
                entries: [['choice', 'amsterdam']]
            });
        }
    },
    {
        name: 'typeahead: multiple search then commit',
        fixture: 'typeahead-multiple',
        async run(d) {
            await d.open();
            for (const character of 'new y') await d.key(character === ' ' ? 'Space' : character);
            await d.highlighted('new-york');
            await d.checkpoint('search only', { open: true, entries: [['choice', 'amsterdam']] });
            await d.key('Enter');
            await d.checkpoint('added', {
                open: true,
                entries: [
                    ['choice', 'amsterdam'],
                    ['choice', 'new-york']
                ]
            });
        }
    },
    {
        name: 'typeahead: no selection uses active item',
        fixture: 'typeahead-no-selection',
        async run(d) {
            await d.open();
            await d.key('End');
            await d.key('b');
            await d.highlighted('berlin');
            await d.checkpoint('active origin', { open: true, highlighted: ['berlin'] });
        }
    }
];
