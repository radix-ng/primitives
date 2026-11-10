import { expect } from '@playwright/test';
import { lifecycleCases, lifecycleConfig } from '../../../shared/lifecycle';
import type { PopoverDriver } from './driver';

export const lifecycleScenarios = lifecycleCases.map((name) => ({
    name,
    async run(d: PopoverDriver) {
        const config = lifecycleConfig(name)!;
        await d.open();
        await expect(d.page.getByTestId('field')).toBeFocused();
        await d.page.getByTestId('field').fill('edited');
        const initialLayout = await d.bounds('initial open layout');
        await d.checkpoint('opened', { open: true, value: 'edited', completions: [true] });
        await d.page.keyboard.press('F8');

        if (config.canceled) {
            await d.checkpoint('close canceled', { open: true, ending: false, completions: [true] });
            await d.page.keyboard.press('F8');
        } else if (config.animated || config.deferred) {
            if (config.animated)
                await expect.poll(() => d.popup.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
            await d.checkpoint('exit pending', {
                open: false,
                mounted: true,
                visible: true,
                inert: false,
                pointerBlocked: true,
                ending: true,
                completions: [true]
            });
        }

        if (config.late) {
            await d.page.keyboard.press('F10');
            // Let the actual CSS exit finish: the accepted late hold must still retain the layer.
            await d.popup.evaluate(async (el) => {
                await Promise.all(el.getAnimations().map((a) => a.finished));
            });
            await d.checkpoint('late hold', { open: false, mounted: true, ending: true, completions: [true] });
        }

        if (name === 'lifecycle-fast-reopen' || name === 'lifecycle-reopen-css') {
            await d.trigger.press('Enter');
            await expect.poll(() => d.page.evaluate(() => window.popoverParity.completions)).toEqual([true, true]);
            await d.page.keyboard.press('F9'); // An old completion request cannot close an open layer.
            await d.checkpoint('reopened before completion', {
                open: true,
                visible: true,
                ending: false,
                value: 'edited',
                completions: [true, true]
            });
            await d.page.keyboard.press('F8');
            await d.closed();
            await expect(d.trigger).toBeFocused();
            await d.checkpoint('new close completed', {
                open: false,
                mounted: false,
                completions: [true, true, false]
            });
            return;
        }

        if (config.deferred || config.late) await d.page.keyboard.press('F9');
        await d.closed();
        await expect(d.trigger).toBeFocused();
        await d.checkpoint('close completed', {
            open: false,
            mounted: config.keepMounted,
            visible: false,
            completions: [true, false]
        });
        await d.page.keyboard.press('F9');
        if (config.canceled) await d.page.keyboard.press('F10');
        await d.checkpoint('stale completion ignored', {
            open: false,
            mounted: config.keepMounted,
            completions: [true, false]
        });

        // Retained content must not keep trapping/focusing the background or intercept native clicks.
        const outside = d.page.getByTestId('outside');
        await outside.click();
        await d.checkpoint('background active', { open: false, activations: 1, completions: [true, false] });
        if (config.keepMounted) {
            await d.page.keyboard.press('F2');
            await d.page.keyboard.press('F6');
            await expect
                .poll(async () => (await d.bounds('closed anchor moved')).trigger.x)
                .toBeGreaterThan(initialLayout.trigger.x + 20);
            await d.checkpoint('retained layout changed', { open: false, mounted: true, visible: false });
            // Hidden retained layers stop tracking, then acquire current metrics when reopened.
            expect((await d.bounds('inactive tracking')).anchorWidth).toBe(initialLayout.anchorWidth);
        }
        await d.open();
        await expect(d.page.getByTestId('field')).toBeFocused();
        await d.checkpoint('reopened', {
            open: true,
            visible: true,
            value: config.keepMounted ? 'edited' : 'draft',
            completions: [true, false, true]
        });
        if (config.keepMounted)
            await expect
                .poll(async () => {
                    const current = await d.bounds('fresh retained layout');
                    return Math.abs(parseFloat(current.anchorWidth) - current.trigger.width);
                })
                .toBeLessThanOrEqual(2);
        await d.page.keyboard.press('F8');
        await d.closed();
        await d.checkpoint('closed again', {
            open: false,
            mounted: config.keepMounted,
            visible: false,
            completions: [true, false, true, false]
        });
    }
}));
