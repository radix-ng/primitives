import { expect } from '@playwright/test';
import { itemDialogCases, itemDialogConfig } from '../src/item-dialog';
import type { MenuDriver } from './driver';

async function dialogReady(d: MenuDriver) {
    await expect(d.item('dialog-popup')).toBeVisible();
    await expect.poll(() => d.page.evaluate(() => window.menuParity.dialog?.completions.at(-1))).toBe(true);
    await expect(d.item('dialog-cancel')).toBeFocused();
}

export const itemDialogScenarios = itemDialogCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = itemDialogConfig(name)!;
        if (settings.drag) {
            const box = (await d.trigger.boundingBox())!;
            await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const pressedAt = await d.page.evaluate(() => performance.now());
            await d.page.mouse.down();
            await expect(d.popup).toBeVisible();
            await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(true);
            // Base UI's native opening guard ignores release until 200 ms has elapsed.
            await expect
                .poll(() => d.page.evaluate((start) => performance.now() - start, pressedAt))
                .toBeGreaterThan(210);
            await d.hoverItem('alpha');
            await d.page.mouse.up();
        } else {
            await d.open(name === 'item-dialog-pointer' ? 'mouse' : 'Enter');
            if (settings.nested) await d.openSub();
            if (name === 'item-dialog-pointer') await d.item('alpha').click();
            else await d.page.keyboard.press(name === 'item-dialog-space' ? 'Space' : 'Enter');
        }
        if (settings.canceledOpen) {
            await expect(d.item('dialog-popup')).toHaveCount(0);
            await d.checkpoint('dialog opening vetoed', { open: true, selected: ['alpha'] });
            return;
        }
        await dialogReady(d);
        await d.checkpoint('dialog owns focus after menu item activation', {
            selected: [settings.nested ? 'sub-alpha' : 'alpha'],
            dialog: expect.objectContaining({ open: true, visible: true, inert: false })
        });
        if (settings.stayOpen || settings.canceledClose) {
            await expect(d.popup).toBeVisible();
            if (name === 'item-dialog-stay-tab') {
                await d.page.keyboard.press('Shift+Tab');
                await expect(d.item('dialog-confirm')).toBeFocused();
                await d.checkpoint('Shift Tab stays in dialog', { open: true });
                await d.page.keyboard.press('Tab');
                await expect(d.item('dialog-cancel')).toBeFocused();
            }
            if (name === 'item-dialog-stay-hover') {
                const box = (await d.item('omega').boundingBox())!;
                await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
                await expect(d.item('dialog-cancel')).toBeFocused();
                await d.checkpoint('pointer leaving item preserves dialog focus', { open: true });
            }
        } else if (settings.animated || settings.deferred) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('menu exit does not steal dialog focus', { open: false, mounted: true });
            if (settings.deferred) await d.page.keyboard.press('F3');
            else {
                await expect
                    .poll(() => d.popup.evaluate((popup) => popup.getAnimations({ subtree: true }).length))
                    .toBeGreaterThan(0);
                await d.popup.evaluate((popup) => {
                    for (const animation of popup.getAnimations({ subtree: true })) animation.finish();
                });
            }
            await expect(d.popup).toHaveCount(0);
            await expect(d.item('dialog-cancel')).toBeFocused();
            await d.checkpoint('menu completion preserves dialog focus', { open: false });
        } else if (settings.retained) await expect(d.popup).toBeHidden();
        else await expect(d.popup).toHaveCount(0);
        if (name === 'item-dialog-pointer') await d.item('dialog-cancel').click();
        else await d.page.keyboard.press('Escape');
        await expect(d.item('dialog-popup')).toHaveCount(0);
        await expect.poll(() => d.page.evaluate(() => window.menuParity.dialog?.completions.at(-1))).toBe(false);
        await d.checkpoint('dialog closed and focus returned');
        await expect(settings.stayOpen || settings.canceledClose ? d.item('alpha') : d.trigger).toBeFocused();
        if (settings.stayOpen) {
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.trigger).toBeFocused();
            await d.checkpoint('menu closes after dialog');
        } else if (!settings.canceledClose) {
            await d.open();
            await d.checkpoint('menu can reopen after dialog', { open: true });
        }
    }
}));
