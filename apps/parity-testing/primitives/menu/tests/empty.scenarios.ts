import { expect } from '@playwright/test';
import { emptyCases, emptyConfig } from '../src/empty';
import type { MenuDriver } from './driver';

export const emptyScenarios = emptyCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = emptyConfig(name)!;
        await d.open(settings.pointer ? 'mouse' : settings.openKey);
        if (!settings.nested) {
            await d.checkpoint('empty root opened', { open: true, focus: 'popup', highlighted: [] });
            if (name === 'empty-root-forward' || name === 'empty-root-backward') {
                await d.page.keyboard.press(settings.backward ? 'ArrowUp' : 'ArrowDown');
                await d.checkpoint('empty root navigation requested');
            }
            // Data arrives in a later application turn, beyond either implementation's initial
            // mount retries. No input/state or CSS lifecycle is synthesized by the clock.
            await d.page.clock.runFor(400);
            await d.page.keyboard.press('F3');
            await expect(d.item('alpha')).toBeVisible();
            await d.checkpoint('root items arrived');
            await d.page.keyboard.press(settings.backward ? 'ArrowUp' : 'ArrowDown');
            await d.checkpoint('entered populated root');
            await d.page.keyboard.press('Enter');
            await d.closed();
            await d.checkpoint('populated root selected', { open: false });
            if (settings.retained) {
                await d.page.keyboard.press('F4');
                await d.open('ArrowUp');
                await d.checkpoint('retained root reopened empty');
                await d.page.clock.runFor(400);
                await d.page.keyboard.press('F3');
                await d.checkpoint('retained root refilled');
                await d.page.keyboard.press('ArrowUp');
                await d.page.keyboard.press('Enter');
                await d.closed();
                await d.checkpoint('retained root selected again');
            }
            return;
        }

        await d.navigateTo('more');
        const forward = name.endsWith('-rtl') ? 'ArrowLeft' : 'ArrowRight';
        if (settings.hover) await d.hoverItem('more');
        else await d.page.keyboard.press(forward);
        await expect(d.subPopup).toBeVisible();
        await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.sub.at(-1))).toBe(true);
        await d.checkpoint('empty submenu opened');
        if (settings.hover) {
            await d.page.keyboard.press(name.endsWith('-enter') ? 'Enter' : forward);
            await d.checkpoint('empty hovered submenu keyboard promotion');
        }
        await d.page.clock.runFor(400);
        if (name === 'empty-sub-close-refill') {
            await d.page.keyboard.press('Escape');
            await d.checkpoint('empty submenu closed');
        }
        await d.page.keyboard.press('F3');
        if (name !== 'empty-sub-close-refill') await expect(d.item('sub-alpha')).toBeVisible();
        await d.checkpoint('submenu items arrived');
        await d.item('more').press(forward);
        const pinFocusLimit = name === 'empty-sub-hover-forward' || name === 'empty-sub-hover-forward-rtl';
        if (!pinFocusLimit || d.framework === 'angular') await expect(d.item('sub-alpha')).toBeFocused();
        await d.checkpoint('entered populated submenu');
        // Keep the pin's failed keyboard handoff observable, then finish through real pointer input.
        if (pinFocusLimit) await d.item('sub-alpha').click();
        else await d.page.keyboard.press('Enter');
        await d.closed();
        await d.checkpoint('populated submenu selected', { open: false, selected: ['sub-alpha'] });
    }
}));
