import { expect } from '@playwright/test';
import { toggleCases } from '../src/toggle';
import type { ButtonDriver } from './driver';

export const toggleScenarios = Object.entries(toggleCases).map(([name, settings]) => ({
    name,
    async run(d: ButtonDriver) {
        const p = settings.toggle!;
        const target = d.page.getByTestId('subject');
        const zero = {
            clicks: [],
            submits: [],
            resets: 0,
            hash: '',
            scrolled: false,
            toggleChanges: [],
            pressed: false
        };
        await d.checkpoint('toggle initial state', { ...zero, tabStops: [0, -1, -1] });
        await d.page.getByTestId('field').focus();
        await d.page.keyboard.press('Tab');
        await expect(d.page.getByTestId('first')).toBeFocused();
        await d.page.keyboard.press('ArrowRight');
        await expect(target).toBeFocused();
        const isEnter = p.action === 'enter' || p.action === 'enter-repeat' || p.action === 'prevent-enter';
        const key = isEnter ? 'Enter' : 'Space';
        const modified = p.action === 'space-modified';
        const trusted = p.action === 'pointer' || (isEnter && settings.host === 'button');
        const changes = (count: number) =>
            Array.from({ length: count }, (_, index) => ({
                pressed: p.action === 'cancel-change' || index % 2 === 0,
                type: 'click',
                reason: 'none',
                trusted,
                shift: modified,
                ctrl: modified
            }));
        const click = expect.objectContaining({ target: 'subject', trusted, shift: modified, ctrl: modified });
        if (p.action === 'pointer') {
            await d.pointerClick();
            await d.checkpoint('pointer changes toggle once', {
                ...zero,
                pressed: true,
                toggleChanges: changes(1),
                clicks: [click]
            });
        } else {
            if (modified) {
                await d.page.keyboard.down('Control');
                await d.page.keyboard.down('Shift');
            }
            await d.page.keyboard.down(key);
            const count = p.action === 'prevent-enter' ? 0 : 1;
            await d.checkpoint('toggle changes once on keydown', {
                ...zero,
                pressed: count > 0 && p.action !== 'cancel-change',
                toggleChanges: changes(count),
                clicks: count ? [click] : []
            });
            const repeat = p.action === 'space-repeat' || p.action === 'enter-repeat';
            const finalCount = count && repeat ? 3 : count;
            if (repeat) {
                await d.page.keyboard.down(key);
                await d.page.keyboard.down(key);
            }
            await d.page.keyboard.up(key);
            if (modified) {
                await d.page.keyboard.up('Shift');
                await d.page.keyboard.up('Control');
            }
            await d.checkpoint('keyup adds no toggle change', {
                ...zero,
                pressed: finalCount > 0 && p.action !== 'cancel-change',
                toggleChanges: changes(finalCount),
                clicks: Array.from({ length: finalCount }, () => click)
            });
            if (p.action === 'space') {
                await d.page.keyboard.press('Space');
                await d.checkpoint('next press toggles off once', {
                    ...zero,
                    pressed: false,
                    toggleChanges: changes(2),
                    clicks: [click, click]
                });
            }
        }
        await d.page.keyboard.press('ArrowRight');
        await expect(d.page.getByTestId('last')).toBeFocused();
        await d.checkpoint('toggle retains toolbar navigation', { tabStops: [-1, -1, 0] });
        await d.page.keyboard.press('Tab');
        await expect(d.page.getByTestId('after')).toBeFocused();
    }
}));
