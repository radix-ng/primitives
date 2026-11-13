import { expect } from '@playwright/test';
import { dialogMenuCases, dialogMenuConfig } from '../src/dialog';
import type { MenuDriver } from './driver';

async function parentGone(d: MenuDriver) {
    await expect(d.item('dialog-popup')).toHaveCount(0);
    await expect(d.popup).toHaveCount(0);
    await expect(d.subPopup).toHaveCount(0);
    await d.checkpoint('parent and menu views removed', { open: false, mounted: false });
    await expect(d.item('after')).toBeEnabled();
    await d.item('after').focus();
    await expect(d.item('after')).toBeFocused();
    await d.checkpoint('background focus released');
}

export const dialogMenuScenarios = dialogMenuCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = dialogMenuConfig(name)!;
        await d.open(name.startsWith('dialog-menu-outside') ? 'mouse' : 'Enter');
        await d.checkpoint('menu entered inside dialog', {
            open: true,
            visible: true,
            dialog: expect.objectContaining({ open: true, visible: true, menuIsolated: false })
        });
        if (settings.nested) {
            await d.openSub();
            await d.checkpoint('submenu entered inside dialog', { subOpen: true, subVisible: true });
            if (name === 'dialog-menu-remove-submenu') {
                await d.page.keyboard.press('F5');
                await parentGone(d);
                return;
            }
            await d.page.keyboard.press('Escape');
            if (settings.retained) await expect(d.subPopup).toBeHidden();
            else await expect(d.subPopup).toHaveCount(0);
            await expect(d.item('more')).toBeFocused();
            await d.checkpoint('only submenu escaped', { open: true, subOpen: false });
        }
        if (name.startsWith('dialog-menu-remove')) {
            if (settings.animated || settings.deferred) {
                await d.page.keyboard.press('Escape');
                await expect(d.popup).toHaveAttribute('data-ending-style', '');
                await d.checkpoint('menu exit pending inside dialog', { open: false, mounted: true, visible: true });
            }
            await d.page.keyboard.press('F5');
            await parentGone(d);
            await d.page.keyboard.press('F6');
            await expect(d.item('dialog-trigger')).toBeVisible();
            await d.item('dialog-trigger').click();
            await expect(d.trigger).toBeVisible();
            await expect.poll(() => d.page.evaluate(() => window.menuParity.dialog?.completions.at(-1))).toBe(true);
            await d.open();
            await d.checkpoint('recreated parent and menu work', { open: true, visible: true });
            return;
        }
        if (name === 'dialog-menu-close-parent') {
            await d.page.keyboard.press('F4');
            await parentGone(d);
            return;
        }
        if (name.startsWith('dialog-menu-outside')) {
            if (name === 'dialog-menu-outside-all') await d.page.mouse.click(5, 580);
            else {
                const box = (await d.item('dialog-after').boundingBox())!;
                await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            }
            await expect(d.popup).toHaveCount(0);
            await expect(d.item('dialog-popup')).toBeVisible();
            await d.checkpoint('outside press resolved');
            if (name === 'dialog-menu-outside-all') {
                await d.page.mouse.click(5, 580);
                await expect(d.item('dialog-popup')).toHaveCount(0);
                await expect(d.item('dialog-trigger')).toBeFocused();
                await d.checkpoint('next outside press closes dialog');
            }
            return;
        }
        if (name === 'dialog-menu-select') await d.page.keyboard.press('Enter');
        else if (name === 'dialog-menu-tab') await d.page.keyboard.press('Tab');
        else if (name === 'dialog-menu-shift-tab') await d.page.keyboard.press('Shift+Tab');
        else await d.page.keyboard.press('Escape');
        if (settings.canceled) {
            await expect(d.popup).toBeVisible();
            await d.checkpoint('menu close veto keeps both layers open', {
                open: true,
                dialog: expect.objectContaining({ open: true })
            });
            return;
        }
        if (settings.deferred) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('menu exit deferred', { open: false, mounted: true, visible: true });
            await d.page.keyboard.press('F3');
        }
        await d.closed();
        await d.checkpoint('menu closed but dialog remains', {
            open: false,
            dialog: expect.objectContaining({ open: true, visible: true })
        });
        if (settings.retained) {
            await d.open();
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('retained menu closes again');
        }
        await d.page.keyboard.press('Escape');
        await expect(d.item('dialog-popup')).toHaveCount(0);
        await expect(d.item('dialog-trigger')).toBeFocused();
        await d.checkpoint('dialog closes after menu');
    }
}));
