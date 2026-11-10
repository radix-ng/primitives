import { expect } from '@playwright/test';
import { MenuFamilyDriver } from '../../../shared/menu-family-driver';
import { cases } from '../src/contract';
export class MenubarDriver extends MenuFamilyDriver {
    constructor(page: ConstructorParameters<typeof MenuFamilyDriver>[0], framework: 'angular' | 'react') {
        super(page, framework, 'menubarParity');
    }
}
export const scenarios = cases.map((name) => ({
    name,
    async run(d: MenubarDriver) {
        const file = d.page.getByTestId('file-trigger'),
            edit = d.page.getByTestId('edit-trigger');
        if (name.startsWith('collection-')) {
            await file.focus();
            await d.checkpoint('before collection change', { open: [], focus: 'file-trigger' });
            await d.page.keyboard.press('F3');
            await expect(d.page.getByTestId(name === 'collection-insert' ? 'new-trigger' : 'file-trigger')).toHaveCount(
                name === 'collection-remove' ? 0 : 1
            );
            await d.checkpoint('bar changed', { open: [] });
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('roved updated order', { open: [] });
            const opener = name === 'collection-disable' ? file : edit;
            await opener.press('ArrowDown');
            await expect(d.page.getByTestId(name === 'collection-disable' ? 'file-popup' : 'edit-popup')).toBeVisible();
            await d.checkpoint('opened live menu', { open: [name === 'collection-disable' ? 'file' : 'edit'] });
            if (name !== 'collection-disable' && name !== 'collection-remove') {
                await d.page.keyboard.press('ArrowRight');
                await d.checkpoint('switched updated order');
            }
            await d.page.keyboard.press('Escape');
            await expect(d.page.locator('[data-menu-popup]')).toHaveCount(0);
            await d.checkpoint('closed', { open: [] });
            return;
        }
        if (name === 'roving') {
            await file.focus();
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('roved past disabled', { open: [] });
            await d.page.keyboard.press('End');
            await d.checkpoint('last trigger', { open: [] });
            await d.page.keyboard.press('Home');
            await d.checkpoint('first trigger', { open: [] });
            return;
        }
        if (name === 'disabled') {
            const box = (await file.boundingBox())!;
            await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await d.checkpoint('disabled request', { open: [], mounted: [] });
            return;
        }
        if (name === 'open-pointer') {
            const box = (await file.boundingBox())!;
            await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await d.page.mouse.down();
            await expect(d.page.getByTestId('file-popup')).toBeVisible();
            await d.checkpoint('pressed', { open: ['file'] });
            await d.page.mouse.up();
        } else await file.press('ArrowDown');
        if (name === 'cancel-open') {
            await d.checkpoint('opening canceled', { open: [], mounted: [] });
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('roving after cancellation', { open: [] });
            return;
        }
        await expect(d.page.getByTestId('file-popup')).toBeVisible();
        await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
        await d.checkpoint('opened', { open: ['file'] });
        if (name === 'switch-keyboard' || name === 'rtl-switch') {
            await d.page.keyboard.press(name === 'rtl-switch' ? 'ArrowLeft' : 'ArrowRight');
            await expect(d.page.getByTestId('edit-popup')).toBeVisible();
            await d.checkpoint('switched', { open: ['edit'] });
        }
        if (name === 'switch-pointer') {
            await edit.hover();
            await expect(d.page.getByTestId('edit-popup')).toBeVisible();
            await d.checkpoint('switched', { open: ['edit'] });
            await d.page.getByTestId('blocked-trigger').hover();
            await d.checkpoint('disabled hover ignored', { open: ['edit'] });
        }
        if (name === 'select') await d.page.getByTestId('file-alpha').press('Enter');
        else if (name === 'outside') {
            const box = (await d.page.getByTestId('outside').boundingBox())!;
            await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else if (name === 'tab') await d.page.keyboard.press('Tab');
        else await d.page.keyboard.press('Escape');
        if (name === 'cancel-close') {
            await d.checkpoint('close canceled', { open: ['file'] });
            return;
        }
        await expect(d.page.locator('[data-menu-popup]')).toHaveCount(0);
        await d.checkpoint('closed', { open: [], selected: name === 'select' ? ['file-alpha'] : [] });
    }
}));
