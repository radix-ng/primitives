import { expect } from '@playwright/test';
import { collectionCases } from '../../../shared/menu-collection';
import type { MenuDriver } from './driver';
export const collectionScenarios = collectionCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
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
