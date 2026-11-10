import { expect } from '@playwright/test';
import type { retainedCases } from '../src/retained';
import type { MenubarDriver } from './scenarios';

export async function runRetained(d: MenubarDriver, name: (typeof retainedCases)[number]) {
    await d.page.mouse.move(700, 520);
    const file = d.page.getByTestId('file-trigger');
    const popup = d.page.getByTestId('file-popup');
    const original = (await popup.elementHandle())!;
    await expect(popup).toBeHidden();
    await file.press('ArrowDown');
    await expect(d.page.getByTestId('file-alpha')).toBeFocused();
    await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
    await d.checkpoint('retained root opened', { open: ['file'] });
    if (name.startsWith('retained-nested-')) {
        await d.page.keyboard.press('End');
        await expect(d.page.getByTestId('file-more')).toBeFocused();
        await d.checkpoint('retained child trigger ready', { focus: 'file-more' });
        await d.page.keyboard.press('ArrowRight');
        await expect(d.page.getByTestId('file-sub-alpha')).toBeFocused();
        await d.checkpoint('retained child opened', { open: ['file', 'file-sub'] });
        if (name.endsWith('-pointer')) {
            await d.page.getByTestId('edit-trigger').hover();
            await d.checkpoint('switched from retained child', { open: ['edit'] });
        } else {
            const child = (await d.page.getByTestId('file-sub-popup').elementHandle())!;
            await d.page.keyboard.press('Escape');
            await d.checkpoint('retained child closed', { open: ['file'], focus: 'file-more' });
            await d.page.keyboard.press('ArrowRight');
            await expect(d.page.getByTestId('file-sub-alpha')).toBeFocused();
            expect(await child.evaluate((element) => element.isConnected)).toBe(true);
            await d.checkpoint('same retained child reopened', { open: ['file', 'file-sub'] });
            await d.page.keyboard.press('Escape');
        }
    } else if (name === 'retained-cancel-close') {
        await d.page.keyboard.press('Escape');
        await d.checkpoint('retained close canceled', { open: ['file'], focus: 'file-alpha' });
        await d.page.keyboard.press('F5');
    } else {
        await d.page.keyboard.press(name.endsWith('-rtl') ? 'ArrowLeft' : 'ArrowRight');
        await d.checkpoint('retained sibling opened', { open: ['edit'] });
    }
    await d.page.keyboard.press('Escape');
    await d.checkpoint('retained menus closed', { open: [], visible: [] });
    await file.press('ArrowDown');
    await expect(d.page.getByTestId('file-alpha')).toBeFocused();
    expect(await original.evaluate((element) => element.isConnected)).toBe(true);
    await d.checkpoint('same retained root reopened', { open: ['file'] });
    await d.page.keyboard.press('Escape');
    await d.checkpoint('retained root closed again', { open: [], visible: [] });
    await d.page.keyboard.press('Tab');
    await d.checkpoint('closed retained views skipped by Tab', { open: [], visible: [] });
    expect(await d.page.evaluate(() => !!document.activeElement?.closest('[data-menu-popup]'))).toBe(false);
}
