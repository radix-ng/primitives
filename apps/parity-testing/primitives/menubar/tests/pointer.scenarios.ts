import { expect } from '@playwright/test';
import type { pointerCases } from '../src/pointer';
import type { MenubarDriver } from './scenarios';

export async function runPointer(d: MenubarDriver, name: (typeof pointerCases)[number]) {
    // Establish a native pointer position before combining keyboard entry with mouse travel.
    await d.page.mouse.move(700, 520);
    const file = d.page.getByTestId('file-trigger');
    const more = d.page.getByTestId('file-more');
    if (name.includes('-select') || name === 'nested-pointer-cancel-hover-close') {
        await file.press('ArrowDown');
        await expect(d.page.getByTestId('file-alpha')).toBeFocused();
        await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
        await d.checkpoint('pointer parent ready', { open: ['file'] });
        await d.page.keyboard.press('End');
        await expect(more).toBeFocused();
        await d.checkpoint('pointer child trigger ready', { focus: 'file-more' });
        await d.page.keyboard.press('ArrowRight');
        await expect(d.page.getByTestId('file-sub-alpha')).toBeFocused();
    } else {
        await file.click();
        await more.hover();
        if (name === 'nested-pointer-cancel-open') {
            await expect
                .poll(() =>
                    d.page.evaluate(() =>
                        window.menubarParity.changes.some((change) => change.layer === 'file-sub' && change.canceled)
                    )
                )
                .toBe(true);
            await d.checkpoint('pointer child opening canceled', { open: ['file'] });
            await d.page.keyboard.press('F5');
            await d.page.getByTestId('file-alpha').hover();
            await more.hover();
        }
        await expect(d.page.getByTestId('file-sub-popup')).toBeVisible();
    }
    await d.checkpoint('pointer branch ready', { open: ['file', 'file-sub'] });
    if (name === 'nested-pointer-cancel-hover-close') {
        await d.page.getByTestId('file-alpha').hover();
        await d.checkpoint('hover child closing canceled', { open: ['file', 'file-sub'] });
        await d.page.keyboard.press('F5');
        const item = (await d.page.getByTestId('file-alpha').boundingBox())!;
        const start = await d.page.evaluate(() => window.menubarParity.pointerMoves.length);
        await d.page.mouse.move(item.x + 4, item.y + item.height / 2);
        const moves = await d.page.evaluate((start) => window.menubarParity.pointerMoves.slice(start), start);
        expect(moves.length).toBeGreaterThan(0);
        expect(moves.every((move) => move.trusted)).toBe(true);
        d.measurements.push({ name: 'native hover-close retry', bounds: { item, moves } });
        await d.checkpoint('hover child closing allowed', { open: ['file'] });
    } else if (name.includes('-select')) {
        await d.page.getByTestId('file-sub-alpha').click();
        await d.checkpoint('selection close request canceled', { selected: ['file-sub-alpha'] });
        await d.page.keyboard.press('F5');
        await file.press('ArrowDown');
        await expect(d.page.getByTestId('file-alpha')).toBeFocused();
        await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
        await d.checkpoint('selection retry parent ready', { open: ['file'] });
        await d.page.keyboard.press('End');
        await expect(more).toBeFocused();
        await d.checkpoint('selection retry trigger ready', { focus: 'file-more' });
        await d.page.keyboard.press('ArrowRight');
        await expect(d.page.getByTestId('file-sub-alpha')).toBeFocused();
        await d.page.getByTestId('file-sub-alpha').click();
        await d.checkpoint('selection close request allowed', {
            open: [],
            selected: ['file-sub-alpha', 'file-sub-alpha']
        });
        return;
    }
    await d.page.keyboard.press('Escape');
    if (name === 'nested-pointer-cancel-open') await d.page.keyboard.press('Escape');
    await d.checkpoint('pointer menus closed', { open: [] });
}
