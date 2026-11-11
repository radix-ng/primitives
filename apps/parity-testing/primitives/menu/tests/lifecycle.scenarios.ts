import { expect } from '@playwright/test';
import { lifecycleCases, lifecycleConfig } from '../../../shared/lifecycle';
import type { MenuDriver } from './driver';

const rootScenarios = lifecycleCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const config = lifecycleConfig(name)!;
        await d.open();
        await d.navigateTo('check');
        await d.page.keyboard.press('Space');
        await d.checkpoint('opened', { open: true, checked: 'true', completions: { main: [true], sub: [] } });
        await d.page.keyboard.press('F8');

        if (config.canceled) {
            await d.checkpoint('close canceled', {
                open: true,
                ending: false,
                completions: { main: [true], sub: [] }
            });
            await d.page.keyboard.press('F8');
        } else if (config.animated || config.deferred) {
            if (config.animated)
                await expect.poll(() => d.popup.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
            await d.checkpoint('exit pending', {
                open: false,
                mounted: true,
                visible: true,
                ending: true,
                inert: false,
                pointerBlocked: true,
                completions: { main: [true], sub: [] }
            });
        }

        if (config.late) {
            await d.page.keyboard.press('F10');
            await d.popup.evaluate(async (el) => {
                const animations = el.getAnimations();
                animations.forEach((animation) => animation.finish());
                await Promise.all(animations.map((animation) => animation.finished));
            });
            await d.checkpoint('late hold', {
                open: false,
                mounted: true,
                ending: true,
                completions: { main: [true], sub: [] }
            });
        }

        if (name === 'lifecycle-fast-reopen' || name === 'lifecycle-reopen-css') {
            await d.trigger.press('Enter');
            await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main)).toEqual([true, true]);
            await d.page.keyboard.press('F9');
            await d.checkpoint('reopened before completion', {
                open: true,
                visible: true,
                ending: false,
                checked: 'true',
                completions: { main: [true, true], sub: [] }
            });
            await expect(d.item('alpha')).toBeFocused();
            await d.page.keyboard.press('F8');
            await d.closed();
            await d.checkpoint('new close completed', {
                open: false,
                mounted: false,
                completions: { main: [true, true, false], sub: [] }
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
            completions: { main: [true, false], sub: [] }
        });
        await d.page.keyboard.press('F9');
        if (config.canceled) await d.page.keyboard.press('F10');
        await d.checkpoint('stale completion ignored', {
            open: false,
            mounted: config.keepMounted,
            completions: { main: [true, false], sub: [] }
        });
        await d.outside();
        await d.checkpoint('background active', {
            open: false,
            activations: 1,
            completions: { main: [true, false], sub: [] }
        });
        await d.open();
        await expect(d.item('alpha')).toBeFocused();
        await d.checkpoint('reopened', {
            open: true,
            visible: true,
            checked: config.keepMounted ? 'true' : 'false',
            completions: { main: [true, false, true], sub: [] }
        });
        await d.page.keyboard.press('F8');
        if (config.late) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await d.popup.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
        }
        await d.closed();
        await d.checkpoint('closed again', {
            open: false,
            mounted: config.keepMounted,
            visible: false,
            completions: { main: [true, false, true, false], sub: [] }
        });
    }
}));

export const lifecycleScenarios = [
    ...rootScenarios,
    {
        name: 'lifecycle-submenu-css' as const,
        async run(d: MenuDriver) {
            await d.open();
            await d.openSub();
            await d.page.keyboard.press('F9');
            await d.checkpoint('stale ancestor action while open', {
                open: true,
                subOpen: true,
                completions: { main: [true], sub: [true] }
            });
            await d.page.keyboard.press('Enter');
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await expect(d.subPopup).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('nested exit pending', {
                open: false,
                mounted: true,
                visible: true,
                subOpen: false,
                subVisible: true,
                ending: true,
                completions: { main: [true], sub: [true] }
            });
            await d.closed();
            await d.checkpoint('whole chain completed', {
                open: false,
                mounted: false,
                subVisible: false
            });
        }
    }
];
