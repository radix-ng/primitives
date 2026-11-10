import { expect } from '@playwright/test';
import { menuCollectionCases } from '../../../shared/menu-collection';
import type { MenuDriver } from './driver';
export const collectionScenarios = menuCollectionCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        if (name === 'collection-empty-refill') {
            await d.open('mouse');
            await d.page.keyboard.press('F3');
            await expect(d.popup.locator('[role^="menuitem"]')).toHaveCount(0);
            await d.checkpoint('empty collection', { open: true, focus: 'popup', highlighted: [] });
            await d.page.keyboard.press('ArrowDown');
            await d.checkpoint('navigated empty collection', { open: true, focus: 'popup', highlighted: [] });
            await d.page.keyboard.press('F4');
            await expect(d.item('new')).toBeVisible();
            await d.checkpoint('collection refilled', { open: true });
            await d.page.keyboard.press('ArrowDown');
            await d.checkpoint('entered refilled collection', { focus: 'new', highlighted: ['new'] });
            await d.page.keyboard.press('Enter');
            await d.closed();
            await d.checkpoint('selected new item', { open: false, selected: ['new'] });
            return;
        }
        if (name.startsWith('collection-submenu')) {
            await d.open();
            if (name === 'collection-submenu-empty-refill') {
                await d.hoverItem('more');
                await expect(d.subPopup).toBeVisible();
            } else await d.openSub();
            await d.checkpoint('before nested change', { open: true, subOpen: true });
            await d.page.keyboard.press('F3');
            if (name === 'collection-submenu-unmount') {
                await expect(d.subPopup).toHaveCount(0);
                await expect(d.item('more')).toHaveCount(0);
                await d.checkpoint('owning branch removed', { open: true, subOpen: false });
                await d.page.keyboard.press('ArrowDown');
                await d.checkpoint('parent still interactive', { focus: 'alpha', highlighted: ['alpha'] });
                await d.page.keyboard.press('F4');
                await expect(d.item('more')).toBeVisible();
                await d.openSub();
                await d.checkpoint('replacement branch opened', { open: true, subOpen: true, focus: 'sub-alpha' });
                await d.page.keyboard.press('Enter');
            } else if (name === 'collection-submenu-empty-refill') {
                await expect(d.subPopup.locator('[role^="menuitem"]')).toHaveCount(0);
                await d.checkpoint('empty nested collection', { open: true, subOpen: true });
                await d.page.keyboard.press('F4');
                await expect(d.item('sub-new')).toBeVisible();
                await d.checkpoint('nested collection refilled', { open: true, subOpen: true });
                await d.item('sub-new').click();
            } else {
                await d.checkpoint('nested collection reordered', { open: true, subOpen: true });
                await d.page.keyboard.press('ArrowDown');
                await d.checkpoint('navigated reordered submenu', { open: true, subOpen: true });
                await d.item('sub-bravo').click();
            }
            await d.closed();
            await d.checkpoint('selected from live branch', { open: false });
            return;
        }
        await d.open();
        if (name === 'collection-insert') await d.navigateTo('bravo');
        await d.checkpoint('before collection change', { open: true });
        await d.page.keyboard.press('F3');
        await expect(d.item(name === 'collection-insert' ? 'new' : 'alpha')).toHaveCount(
            name === 'collection-remove' ? 0 : 1
        );
        await d.checkpoint('collection changed', { open: true });
        if (name === 'collection-label') {
            await d.page.keyboard.press('z');
            await d.checkpoint('new label matched', { focus: 'alpha', highlighted: ['alpha'] });
        }
        await d.page.keyboard.press('ArrowDown');
        await d.checkpoint('navigated updated order', { open: true });
        await d.item('bravo').click();
        await d.closed();
        await d.checkpoint('selected live item', { open: false, selected: ['bravo'] });
    }
}));
