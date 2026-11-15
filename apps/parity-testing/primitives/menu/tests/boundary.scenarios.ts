import { expect } from '@playwright/test';
import { boundaryCases, boundaryConfig } from '../src/boundary';
import type { MenuDriver } from './driver';

export const boundaryScenarios = boundaryCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = boundaryConfig(name)!;
        await d.open('mouse');
        const record = async (phase: string, changed = false) => {
            const side = changed ? 'bottom' : settings.initialSide;
            await expect(d.item('positioner')).toHaveAttribute('data-side', side);
            const anchor = (await d.trigger.boundingBox())!;
            const boundary = (await d.item(changed ? 'boundary-outer' : 'boundary-inner').boundingBox())!;
            const popup = (await d.popup.boundingBox())!;
            const availableHeight = await d
                .item('positioner')
                .evaluate((node) => Number.parseFloat(getComputedStyle(node).getPropertyValue('--available-height')));
            expect(Number.isFinite(availableHeight)).toBe(true);
            if (side === 'top') {
                expect(popup.y).toBeGreaterThanOrEqual(boundary.y - 1);
                expect(popup.y + popup.height).toBeLessThan(anchor.y);
            } else expect(popup.y).toBeGreaterThan(anchor.y + anchor.height);
            d.measurements.push({ name: phase, bounds: { anchor, boundary, popup, availableHeight } });
            d.checkpoints.push({
                name: phase,
                state: {
                    side,
                    x: Math.round(popup.x - anchor.x),
                    y: Math.round(popup.y - anchor.y),
                    width: Math.round(popup.width),
                    height: Math.round(popup.height),
                    availableHeight: Math.round(availableHeight)
                }
            });
            expect(d.errors).toEqual([]);
        };
        await record('boundary applied');
        if (settings.dynamic) {
            await d.page.keyboard.press('F3');
            await record('boundary replaced', true);
        }
        await d.item('alpha').click();
        await d.closed();
    }
}));
