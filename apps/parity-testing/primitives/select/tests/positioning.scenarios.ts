import type { Scenario } from './scenario';

export const positioningScenarios: Scenario[] = [
    {
        name: 'anchor: default center alignment',
        fixture: 'anchor-default',
        async run(d) {
            await d.open();
            await d.alignment('default horizontal center', 'center');
            await d.checkpoint('centered', { open: true });
            await d.key('Escape');
            await d.closed();
            await d.checkpoint('closed', { open: false, entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'modal: keyboard selection',
        fixture: 'modal',
        async run(d) {
            await d.open();
            await d.checkpoint('opened', { open: true, backgroundActivations: 0 });
            await d.key('ArrowDown');
            await d.highlighted('banana');
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected', { label: 'Banana', entries: [['choice', 'banana']], focus: 'trigger' });
        }
    },
    {
        name: 'modal: outside press is blocked',
        fixture: 'modal',
        async run(d) {
            await d.open();
            await d.clickBackground();
            await d.closed();
            await d.checkpoint('dismissed', { open: false, backgroundActivations: 0, entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'modal: canceled outside press',
        fixture: 'modal-cancel-close',
        async run(d) {
            await d.open();
            await d.clickBackground();
            await d.checkpoint('canceled', {
                open: true,
                backgroundActivations: 0,
                entries: [['choice', 'apple']],
                focus: 'body'
            });
            await d.wheelPage(false);
            await d.checkpoint('still locked', { open: true, pageScrolled: false, focus: 'body' });
        }
    },
    {
        name: 'modal: scroll lock releases on close',
        fixture: 'modal',
        async run(d) {
            await d.open();
            await d.wheelPage(false);
            await d.checkpoint('locked', { open: true, pageScrolled: false });
            await d.key('Escape');
            await d.closed();
            await d.wheelPage(true);
            await d.checkpoint('released', { open: false, pageScrolled: true });
        }
    },
    {
        name: 'nonmodal: outside press activates background',
        fixture: 'single',
        async run(d) {
            await d.open();
            await d.clickBackground();
            await d.closed();
            await d.checkpoint('activated', { open: false, backgroundActivations: 1, entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'modal: trigger press closes',
        fixture: 'modal',
        async run(d) {
            await d.open();
            await d.trigger.click();
            await d.closed();
            await d.checkpoint('toggled closed', { open: false, entries: [['choice', 'apple']] });
        }
    },
    ...(['aligned', 'aligned-rtl'] as const).map(
        (fixture): Scenario => ({
            name: `${fixture}: selected text and keyboard selection`,
            fixture,
            async run(d) {
                await d.open();
                await d.alignment('selected text', 'item');
                await d.checkpoint('aligned', {
                    open: true,
                    selected: ['banana'],
                    direction: fixture === 'aligned-rtl' ? 'rtl' : 'ltr'
                });
                await d.key('End');
                await d.highlighted('cherry');
                await d.key('Enter');
                await d.closed();
                await d.checkpoint('selected', { label: 'Cherry', entries: [['choice', 'cherry']], focus: 'trigger' });
                await d.open();
                await d.alignment('new selected text', 'item');
                await d.checkpoint('realigned', { open: true, selected: ['cherry'] });
            }
        })
    ),
    ...(['aligned', 'aligned-modal'] as const).map(
        (fixture): Scenario => ({
            name: `${fixture}: scroll lock releases on close`,
            fixture,
            async run(d) {
                await d.open();
                await d.wheelPage(false);
                await d.checkpoint('locked', { open: true, pageScrolled: false });
                await d.key('Escape');
                await d.closed();
                await d.wheelPage(true);
                await d.checkpoint('released', { open: false, pageScrolled: true });
            }
        })
    ),
    {
        name: 'aligned: viewport resize closes',
        fixture: 'aligned',
        async run(d) {
            await d.open();
            await d.page.setViewportSize({ width: 1000, height: 650 });
            await d.closed();
            await d.checkpoint('resized', { open: false, entries: [['choice', 'banana']] });
        }
    },
    {
        name: 'rtl: anchored start alignment',
        fixture: 'rtl',
        async run(d) {
            await d.open();
            await d.alignment('logical start', 'anchor');
            await d.checkpoint('aligned', { open: true, direction: 'rtl' });
            await d.key('ArrowDown');
            await d.key('Enter');
            await d.closed();
            await d.checkpoint('selected', { label: 'Banana', entries: [['choice', 'banana']] });
        }
    }
];
