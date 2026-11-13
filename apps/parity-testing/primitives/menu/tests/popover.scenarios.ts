import { expect } from '@playwright/test';
import { popoverMenuCases, popoverMenuConfig } from '../src/popover';
import type { MenuDriver } from './driver';

async function parentGone(d: MenuDriver) {
    await expect(d.item('host-popup')).toHaveCount(0);
    await expect(d.popup).toHaveCount(0);
    await expect(d.subPopup).toHaveCount(0);
    await d.checkpoint('host and menu views removed', { open: false, mounted: false });
    await d.item('after').focus();
    await expect(d.item('after')).toBeFocused();
    await d.checkpoint('background focus released');
}

export const popoverMenuScenarios = popoverMenuCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = popoverMenuConfig(name)!;
        await d.open(name.startsWith('popover-menu-outside') ? 'mouse' : 'Enter');
        await d.checkpoint('menu entered inside popover', {
            open: true,
            visible: true,
            popover: expect.objectContaining({ open: true, visible: true, menuIsolated: false })
        });
        if (settings.nested) {
            await d.openSub();
            await d.checkpoint('submenu entered inside popover', { subOpen: true, subVisible: true });
            if (name === 'popover-menu-remove-submenu') {
                await d.page.keyboard.press('F5');
                await parentGone(d);
                return;
            }
            await d.page.keyboard.press('Escape');
            await expect(d.subPopup).toHaveCount(0);
            await expect(d.item('more')).toBeFocused();
            await d.checkpoint('only submenu escaped', { open: true, subOpen: false });
        }
        if (name.startsWith('popover-menu-remove')) {
            if (settings.animated || settings.deferred) {
                await d.page.keyboard.press('Escape');
                await expect(d.popup).toHaveAttribute('data-ending-style', '');
                await d.checkpoint('menu exit pending inside popover', { open: false, mounted: true, visible: true });
            }
            await d.page.keyboard.press('F5');
            await parentGone(d);
            await d.page.keyboard.press('F6');
            await expect(d.item('host-trigger')).toBeVisible();
            await d.item('host-trigger').click();
            await expect(d.trigger).toBeVisible();
            await expect.poll(() => d.page.evaluate(() => window.menuParity.popover?.completions.at(-1))).toBe(true);
            await d.open();
            await d.checkpoint('recreated host and menu work', { open: true, visible: true });
            return;
        }
        if (name.startsWith('popover-menu-close-parent')) {
            await d.page.keyboard.press('F4');
            await parentGone(d);
            return;
        }
        if (name.startsWith('popover-menu-outside')) {
            if (name.includes('outside-all')) {
                // Use non-modal Menu for outside-both comparisons: the pin's portal capture
                // marker / removed modal backdrop can otherwise leave the host open intermittently.
                await d.page.mouse.move(5, 5);
                await d.checkpoint('pointer outside both surfaces', { open: true });
                await d.page.mouse.down();
                await d.page.mouse.up();
            } else {
                const box = (await d.item('host-after').boundingBox())!;
                await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            }
            await expect(d.popup).toHaveCount(0);
            if (name.includes('outside-all')) {
                await expect(d.item('host-popup')).toHaveCount(0);
                await expect(d.item('host-trigger')).toBeFocused();
                await d.checkpoint('outside both surfaces');
            } else {
                await expect(d.item('host-popup')).toBeVisible();
                await d.checkpoint('outside menu but host remains');
            }
            return;
        }
        if (name === 'popover-menu-select') await d.page.keyboard.press('Enter');
        else if (name === 'popover-menu-tab') await d.page.keyboard.press('Tab');
        else if (name === 'popover-menu-shift-tab') await d.page.keyboard.press('Shift+Tab');
        else await d.page.keyboard.press('Escape');
        if (settings.canceled) {
            await expect(d.popup).toBeVisible();
            await d.checkpoint('menu close veto keeps host open', {
                open: true,
                popover: expect.objectContaining({ open: true })
            });
            return;
        }
        if (settings.deferred) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('menu exit deferred', { open: false, mounted: true, visible: true });
            await d.page.keyboard.press('F3');
        }
        await d.closed();
        await d.checkpoint('menu closed but host remains', {
            open: false,
            popover: expect.objectContaining({ open: true, visible: true })
        });
        if (settings.retained) {
            await d.open();
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('retained menu closes again');
        }
        await d.page.keyboard.press('Escape');
        await expect(d.item('host-popup')).toHaveCount(0);
        await expect(d.item('host-trigger')).toBeFocused();
        await d.checkpoint('host closes after menu');
    }
}));
