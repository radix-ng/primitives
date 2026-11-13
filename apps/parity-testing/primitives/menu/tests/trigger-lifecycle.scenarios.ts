import { expect } from '@playwright/test';
import { multiTriggerLifecycleCases, multiTriggerLifecycleConfig } from '../src/trigger-lifecycle';
import type { MenuDriver } from './driver';

async function finishAnimations(d: MenuDriver) {
    await d.page.evaluate(async () => {
        const animations = document.getAnimations();
        animations.forEach((animation) => animation.finish());
        await Promise.allSettled(animations.map((animation) => animation.finished));
    });
}

async function pendingExit(d: MenuDriver, deferred: boolean) {
    await expect(d.popup).toHaveAttribute('data-ending-style', '');
    if (!deferred)
        await expect
            .poll(() =>
                d.popup.evaluate((el) => el.getAnimations().some((animation) => animation.playState === 'paused'))
            )
            .toBe(true);
    await d.checkpoint('exit pending', {
        open: false,
        mounted: true,
        visible: true,
        ending: true,
        completions: { main: [true], sub: [] }
    });
}

export const multiTriggerLifecycleScenarios = multiTriggerLifecycleCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = multiTriggerLifecycleConfig(name)!;
        const action = (label: string) => d.page.getByRole('menuitem', { name: label, exact: true });
        const previous = d.page.locator('[data-testid="viewport"] > [data-previous]');
        await d.open('mouse');
        await expect(action('Alpha action')).toBeVisible();
        await d.checkpoint('first session opened', { open: true, payloadLabel: 'Alpha' });

        if (p.viewport) {
            await d.item('secondary').click();
            await expect(action('Bravo action')).toBeVisible();
            await expect(previous).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('switch pending', { open: true, payloadLabel: 'Bravo' });
            if (name === 'multi-switch-interrupted') {
                await d.trigger.click();
                await expect(action('Alpha action')).toBeVisible();
                await expect(previous).toHaveAttribute('data-ending-style', '');
                await d.checkpoint('switch reversed', { open: true, payloadLabel: 'Alpha' });
                await d.item('secondary').click();
                await expect(action('Bravo action')).toBeVisible();
                await expect(previous).toHaveAttribute('data-ending-style', '');
                await expect(d.page.locator('[data-testid="viewport"] > [data-current]')).not.toHaveAttribute(
                    'data-starting-style'
                );
                await d.checkpoint('last switch pending', { open: true, payloadLabel: 'Bravo' });
                await finishAnimations(d);
                await expect(previous).toHaveCount(0);
                await d.checkpoint('last switch completed', { open: true, payloadLabel: 'Bravo' });
            }
            if (name === 'multi-switch-remove-root') {
                await d.page.keyboard.press('F4');
                await expect(d.popup).toHaveCount(0);
                await expect(d.page.locator('[data-rdx-focus-guard], [data-floating-ui-focus-guard]')).toHaveCount(0);
                await d.checkpoint('switch owner removed', { open: false, mounted: false });
                await d.page.keyboard.press('F4');
                await expect(d.item('active-payload')).toBeAttached();
                await d.checkpoint('replacement owner attached', { open: false });
                await d.page.keyboard.press('F6');
                await expect(action('Bravo action')).toBeVisible();
                await expect
                    .poll(() => d.page.evaluate(() => window.menuParity.completions.main))
                    .toEqual([true, true]);
                await finishAnimations(d);
                await d.checkpoint('surviving triggers reconnected', { open: true, payloadLabel: 'Bravo' });
            }
        }

        if (!['multi-switch-interrupted', 'multi-switch-remove-root'].includes(name)) {
            await d.page.keyboard.press(p.controlled ? 'F5' : name === 'multi-exit-handle' ? 'F7' : 'Escape');
            await pendingExit(d, p.deferred);
            if (name === 'multi-exit-remove-trigger') {
                await d.page.keyboard.press('F10');
                await expect(d.trigger).toHaveCount(0);
                await d.checkpoint('closing trigger removed', { open: false, mounted: true });
            }
            if (name === 'multi-exit-payload') {
                await d.page.keyboard.press('F3');
                await expect(d.item('active-payload')).toHaveText('Updated');
                await d.checkpoint('closing payload updated', { open: false, payloadLabel: 'Updated' });
            }
            await d.page.keyboard.press('F6');
            await expect(action('Bravo action')).toBeVisible();
            await expect(d.popup).not.toHaveAttribute('data-ending-style');
            await finishAnimations(d);
            await expect(previous).toHaveCount(0);
            await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main)).toEqual([true, true]);
            await d.checkpoint('exit replaced by second trigger', { open: true, payloadLabel: 'Bravo' });
            // These are the original public hold/action, rather than fixture completion callbacks.
            await d.page.keyboard.press('F2');
            await d.page.keyboard.press('F1');
            await d.checkpoint('old hold and open unmount ignored', {
                open: true,
                payloadLabel: 'Bravo',
                completions: { main: [true, true], sub: [] }
            });
        }

        await d.page.keyboard.press('Escape');
        if (!p.deferred) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await finishAnimations(d);
        }
        if (name === 'multi-exit-remove-trigger') {
            await expect(d.item('secondary')).toHaveAttribute('aria-expanded', 'false');
            await expect(d.popup).toHaveCount(0);
        } else await d.closed();
        await d.checkpoint('new session completed', {
            open: false,
            visible: false,
            completions: { main: name === 'multi-switch-interrupted' ? [true, false] : [true, true, false], sub: [] }
        });
    }
}));
