import { expect } from '@playwright/test';
import { sizingNames } from '../src/geometry';
import type { Scenario } from './scenario';

export const sizingScenarios: Scenario[] = sizingNames.map((fixture) => ({
    name: `sizing: ${fixture.slice('geometry-aligned-'.length)}`,
    fixture,
    viewport: { width: 640, height: 480 },
    compareSizing: !fixture.includes('-transformed'),
    async run(d) {
        await d.open();
        const transformed = fixture.includes('-transformed');
        const referenceGap = transformed && d.framework === 'react';
        const edge = fixture.includes('-edge-');
        await d.checkpoint(
            'positioned',
            { open: true, itemAligned: referenceGap || !(edge || transformed), popupWithinViewport: !referenceGap },
            undefined,
            true
        );
        const initial = await d.sizing('initial sizing');
        const config = await d.page.evaluate(() => window.parity.config);
        const selected = config.geometry!.selectedIndex;
        if (!referenceGap) await d.geometry('selected item visible', `item-${selected ?? 0}`);
        if (fixture.includes('-grow-')) {
            await d.wheelList(fixture.endsWith('-up') ? -120 : 120);
            await expect
                .poll(async () => (await d.page.getByTestId('positioner').boundingBox())!.height)
                .toBeGreaterThan(initial.positioner.height + 20);
            const grown = await d.sizing('expanded');
            expect(grown.positioner.height).toBeLessThanOrEqual(461);
            await d.checkpoint('expanded', { open: true, popupWithinViewport: true }, undefined, true);
        }
        if (fixture.endsWith('-capped')) {
            await d.wheelList(200);
            await d.page.evaluate(
                () =>
                    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            );
            const capped = await d.sizing('height cap');
            expect(capped.popup.height).toBeLessThanOrEqual(241);
            expect(Math.abs(capped.positioner.height - initial.positioner.height)).toBeLessThanOrEqual(1);
            await d.checkpoint('capped', { open: true, popupWithinViewport: true }, undefined, true);
        }
        if (fixture.endsWith('-short')) expect(initial.popup.height).toBeLessThan(150);
        const last = `item-${config.options.length - 1}`;
        await d.key('End');
        await d.highlighted(last);
        if (!referenceGap) await d.geometry('last option visible', last);
        await d.key('Enter');
        await d.closed(true);
        await d.checkpoint('selected', { open: false, entries: [['choice', last]] });
        if (fixture.endsWith('-reopen')) {
            await d.open();
            await d.geometry('new selection on retained reopen', last);
            await d.sizing('reopened');
            await d.checkpoint(
                'reopened',
                { open: true, selected: [last], popupWithinViewport: true },
                undefined,
                true
            );
        }
    }
}));
