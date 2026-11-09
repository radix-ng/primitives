import { expect } from '@playwright/test';
import type { Scenario } from './scenario';

export const touchScenarios: Scenario[] = [
    {
        name: 'touch: scroll options without selecting',
        fixture: 'touch-scroll',
        input: 'touch-gesture',
        async run(d) {
            await d.openByTouch();
            await d.gesture(d.option('cherry'), 'pan');
            await expect.poll(() => d.page.getByTestId('list').evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
            await d.checkpoint('list scrolled', { open: true, label: 'Apple', entries: [['choice', 'apple']] });
            const events = await d.inputEvents();
            expect(events.some((e) => e.type === 'pointercancel' && e.trusted)).toBe(true);
            expect(events.filter((e) => e.type.startsWith('touch')).every((e) => e.trusted)).toBe(true);
        }
    },
    {
        name: 'touch: tap selection',
        fixture: 'single',
        input: 'touch-tap',
        async run(d) {
            await d.openByTouch();
            await d.checkpoint('opened', { open: true, entries: [['choice', 'apple']] });
            await d.option('banana').tap();
            await d.closed(true);
            await d.checkpoint('selected', { open: false, label: 'Banana', entries: [['choice', 'banana']] });
            expect(
                (await d.inputEvents()).some((e) => e.type === 'pointerup' && e.pointerType === 'touch' && e.trusted)
            ).toBe(true);
        }
    },
    {
        name: 'touch: disabled trigger',
        fixture: 'disabled',
        input: 'touch-tap',
        async run(d) {
            const b = (await d.trigger.boundingBox())!;
            await d.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
            await d.checkpoint('ignored', { open: false, entries: [], events: [] });
        }
    },
    {
        name: 'touch: read-only selection',
        fixture: 'read-only',
        input: 'touch-tap',
        async run(d) {
            await d.openByTouch();
            await d.option('banana').tap();
            await d.checkpoint('unchanged', { open: true, label: 'Apple', entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'touch: disabled option',
        fixture: 'single',
        input: 'touch-tap',
        async run(d) {
            await d.openByTouch();
            await d.option('blueberry').tap({ force: true });
            await d.checkpoint('ignored', { open: true, label: 'Apple', entries: [['choice', 'apple']] });
        }
    },
    {
        name: 'touch: multiple toggle',
        fixture: 'multiple',
        input: 'touch-tap',
        async run(d) {
            await d.openByTouch();
            await d.option('banana').tap();
            await d.checkpoint('added', {
                open: true,
                entries: [
                    ['choice', 'apple'],
                    ['choice', 'banana']
                ]
            });
            await d.option('apple').tap();
            await d.checkpoint('removed', { open: true, entries: [['choice', 'banana']] });
        }
    },
    ...(['single', 'modal'] as const).map(
        (fixture): Scenario => ({
            name: `touch: ${fixture} outside tap`,
            fixture,
            input: 'touch-tap',
            async run(d) {
                await d.openByTouch();
                await d.tapBackground();
                await d.closed(true);
                await d.checkpoint('dismissed', {
                    open: false,
                    backgroundActivations: fixture === 'modal' ? 0 : 1,
                    entries: [['choice', 'apple']]
                });
            }
        })
    ),
    {
        name: 'touch: aligned popup falls below trigger',
        fixture: 'aligned',
        input: 'touch-tap',
        async run(d) {
            await d.openByTouch();
            const trigger = (await d.trigger.boundingBox())!;
            const popup = (await d.page.getByTestId('popup').boundingBox())!;
            d.measurements.push({ name: 'touch fallback', bounds: { trigger, popup } });
            expect(popup.y).toBeGreaterThanOrEqual(trigger.y + trigger.height - 2);
            await d.option('cherry').tap();
            await d.closed(true);
            await d.checkpoint('selected', { open: false, label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    },
    {
        name: 'touch: canceled trigger gesture',
        fixture: 'aligned',
        input: 'touch-gesture',
        async run(d) {
            await d.page.clock.install();
            await d.gesture(d.trigger, 'cancel');
            await d.page.clock.runFor(500);
            await d.checkpoint('canceled', { open: false, entries: [['choice', 'banana']], events: [] });
            expect((await d.inputEvents()).some((e) => e.type === 'pointercancel' && e.trusted)).toBe(true);
            await d.openByTouch();
            await d.checkpoint('next tap opens', { open: true });
        }
    },
    {
        name: 'touch: pan from trigger',
        fixture: 'aligned',
        input: 'touch-gesture',
        async run(d) {
            await d.gesture(d.trigger, 'pan');
            await expect.poll(() => d.page.evaluate(() => scrollY > 0)).toBe(true);
            await d.checkpoint('scrolled without opening', {
                open: false,
                pageScrolled: true,
                entries: [['choice', 'banana']],
                events: []
            });
            expect((await d.inputEvents()).some((e) => e.type === 'pointercancel' && e.trusted)).toBe(true);
        }
    },
    {
        name: 'touch: canceled option gesture',
        fixture: 'single',
        input: 'touch-gesture',
        async run(d) {
            await d.openByTouch();
            await d.gesture(d.option('banana'), 'cancel');
            await d.checkpoint('no selection', { open: true, entries: [['choice', 'apple']] });
            await d.option('cherry').tap();
            await d.closed(true);
            await d.checkpoint('next tap selects', { open: false, label: 'Cherry', entries: [['choice', 'cherry']] });
        }
    }
];
