import { expect } from '@playwright/test';
import { liveNames } from '../src/live';
import type { Scenario } from './scenario';

export const liveLayoutScenarios: Scenario[] = liveNames.map((fixture) => ({
    name: `live layout: ${fixture.slice('live-'.length)}`,
    fixture,
    viewport: { width: 640, height: 480 },
    async run(d) {
        const aligned = fixture.includes('-aligned-');
        const scaledPortal = fixture.includes('-portal-scale');
        const referenceGap = scaledPortal && aligned && d.framework === 'react';
        await d.open();
        const initial = await d.sizing('initial live layout');
        await d.checkpoint(
            'positioned',
            {
                open: true,
                itemAligned: aligned && (!scaledPortal || referenceGap),
                popupWithinViewport: !referenceGap,
                anchorHidden: false,
                ...(aligned && !scaledPortal
                    ? { selectedTextAligned: !(fixture.includes('-initial-scale') && d.framework === 'react') }
                    : {})
            },
            undefined,
            'live'
        );

        if (fixture.includes('-scroll') || fixture.endsWith('-clipped')) {
            await d.scrollAncestor(fixture.endsWith('-clipped') ? 180 : 40);
            const scrolled = await d.sizing('ancestor scrolled');
            expect(scrolled.trigger.y).toBeLessThan(initial.trigger.y - 20);
            if (aligned || fixture.endsWith('-frozen')) {
                expect(Math.abs(scrolled.positioner.y - initial.positioner.y)).toBeLessThanOrEqual(1);
            } else await d.anchorGap('follows scrolling anchor');
            await d.checkpoint(
                'ancestor scrolled',
                { open: true, anchorHidden: fixture.endsWith('-clipped') },
                undefined,
                'live'
            );
        } else if (!fixture.includes('scale')) {
            for (const command of ['F2', 'F6', 'F4', 'F3', 'F7', 'F8']) {
                await d.key(command);
                const current = await d.sizing(command);
                const frozen = fixture.endsWith('-frozen') || fixture === 'live-aligned-default';
                if (frozen) {
                    expect(Math.abs(current.positioner.x - initial.positioner.x)).toBeLessThanOrEqual(1);
                    expect(Math.abs(current.positioner.y - initial.positioner.y)).toBeLessThanOrEqual(1);
                    expect(Math.abs(current.positioner.width - initial.positioner.width)).toBeLessThanOrEqual(1);
                } else {
                    expect(Math.abs(current.positioner.width - current.trigger.width)).toBeLessThanOrEqual(2);
                    if (!aligned) await d.anchorGap('tracks changed anchor');
                    else {
                        expect(Math.abs(current.positioner.x - initial.positioner.x)).toBeLessThanOrEqual(1);
                        expect(Math.abs(current.positioner.y - initial.positioner.y)).toBeLessThanOrEqual(1);
                    }
                }
                await d.checkpoint(
                    command,
                    {
                        open: true,
                        popupWithinViewport: true,
                        anchorHidden: false,
                        label: command === 'F8' ? 'Item 18 renamed' : 'Item 18',
                        entries: [['choice', 'item-18']]
                    },
                    undefined,
                    'live'
                );
            }
        }
        expect(await d.page.evaluate(() => window.parity.events.filter((event) => event.type === 'value'))).toEqual([]);
        // Recover visible keyboard targets after user scrolling or consumer CSS changes.
        await d.key('ArrowDown');
        await d.key('Home');
        await d.highlighted('item-0');
        if (!referenceGap && !fixture.endsWith('-clipped')) await d.geometry('first option visible', 'item-0');
        await d.key('End');
        await d.highlighted('item-39');
        if (!referenceGap && !fixture.endsWith('-clipped')) await d.geometry('last option visible', 'item-39');
        await d.key('Enter');
        await d.closed(true);
        await d.checkpoint('selected', { open: false, entries: [['choice', 'item-39']] });
        if (!fixture.includes('scale') && !fixture.includes('scroll') && !fixture.endsWith('clipped')) {
            await d.open();
            await d.sizing('reopened live layout');
            await d.checkpoint(
                'reopened',
                {
                    open: true,
                    popupWithinViewport: true,
                    anchorHidden: false,
                    entries: [['choice', 'item-39']],
                    ...(aligned ? { selectedTextAligned: d.framework === 'angular' } : {})
                },
                undefined,
                'live'
            );
        }
    }
}));
