import { expect } from '@playwright/test';
import type { compositionCases } from '../src/composition';
import type { MenubarDriver } from './scenarios';

type CompositionCase = (typeof compositionCases)[number];
export async function runComposition(d: MenubarDriver, name: CompositionCase) {
    const file = d.page.getByTestId('file-trigger');
    const edit = d.page.getByTestId('edit-trigger');
    const rtl = name.endsWith('-rtl');
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (name.startsWith('cancel-switch-')) {
        await file.press('ArrowDown');
        await expect(d.page.getByTestId('file-popup')).toBeVisible();
        await d.checkpoint('before canceled switch', { open: ['file'] });
        if (name.endsWith('-pointer')) await edit.hover();
        else await d.page.keyboard.press('ArrowRight');
        await d.checkpoint('switch cancellation settled');
        // A native application command changes the callback policy, not any Menu state.
        await d.page.keyboard.press('F5');
        const target = name.startsWith('cancel-switch-open') ? edit : file;
        await target.press('ArrowDown');
        await d.checkpoint('switch allowed again');
        await d.page.keyboard.press('Escape');
        if (name.startsWith('cancel-switch-close')) {
            await d.checkpoint('closed one overlapping menu');
            await file.hover();
            await d.checkpoint('hover after interaction mode ended', { open: ['edit'] });
            await d.page.keyboard.press('Escape');
        }
        await d.checkpoint('closed after retry', { open: [] });
        return;
    }
    if (name === 'vertical-roving' || name === 'roving-rtl') {
        await file.focus();
        await d.page.keyboard.press(name === 'vertical-roving' ? 'ArrowDown' : 'ArrowLeft');
        await d.checkpoint('roved on bar axis', { open: [], focus: 'edit-trigger' });
        await d.page.keyboard.press(name === 'vertical-roving' ? 'ArrowUp' : 'ArrowRight');
        await d.checkpoint('returned on bar axis', { open: [], focus: 'file-trigger' });
        await d.page.keyboard.press('End');
        await d.checkpoint('last enabled trigger', {
            open: [],
            focus: name === 'roving-rtl' ? 'new-trigger' : 'edit-trigger'
        });
        await d.page.keyboard.press('Home');
        await d.checkpoint('first enabled trigger', { open: [], focus: 'file-trigger' });
        return;
    }
    if (name.startsWith('vertical-')) {
        await file.press(openKey);
        await expect(d.page.getByTestId('file-popup')).toBeVisible();
        await d.checkpoint('opened across bar axis', { open: ['file'], focus: 'file-alpha' });
        if (name.startsWith('vertical-close-arrow')) {
            await d.page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft');
            await d.checkpoint('cross-axis close requested');
            await d.page.keyboard.press('Escape');
            await d.checkpoint('settled after cross-axis close', { open: [], focus: 'file-trigger' });
            return;
        }
        if (name === 'vertical-popup') {
            await d.page.keyboard.press('ArrowDown');
            await d.checkpoint('navigated inside popup', { open: ['file'], focus: 'file-blocked' });
            await d.page.keyboard.press('Escape');
            await d.checkpoint('returned to vertical bar', { open: [], focus: 'file-trigger' });
            await d.page.keyboard.press('ArrowDown');
            await d.checkpoint('roved after close', { open: [], focus: 'edit-trigger' });
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('opened next vertical menu', { open: ['edit'], focus: 'edit-alpha' });
        }
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed vertical menu', { open: [] });
        return;
    }
    await file.press('ArrowDown');
    await expect(d.page.getByTestId('file-popup')).toBeVisible();
    await expect(d.page.getByTestId('file-alpha')).toBeFocused();
    await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
    await d.checkpoint('parent menu ready', { open: ['file'], focus: 'file-alpha' });
    await d.page.keyboard.press('End');
    await expect(d.page.getByTestId('file-more')).toBeFocused();
    await d.checkpoint('nested trigger ready', { open: ['file'], focus: 'file-more' });
    await d.page.keyboard.press(openKey);
    if (name === 'nested-cancel-open') {
        await expect(d.page.getByTestId('file-sub-popup')).toHaveCount(0);
        await d.checkpoint('child opening canceled', { open: ['file'], focus: 'file-more' });
        await d.page.keyboard.press('F5');
        await d.page.keyboard.press(openKey);
    }
    await expect(d.page.getByTestId('file-sub-popup')).toBeVisible();
    await expect(d.page.getByTestId('file-sub-alpha')).toBeFocused();
    await d.checkpoint('opened nested menu', { open: ['file', 'file-sub'], focus: 'file-sub-alpha' });
    if (name.startsWith('nested-cancel-close')) {
        await d.page.keyboard.press(name.includes('-arrow') ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'Escape');
        await d.checkpoint('child closing canceled', { open: ['file', 'file-sub'] });
        await d.page.keyboard.press('F5');
        await d.page.keyboard.press('Escape');
        await d.checkpoint('child retry accepted', { open: ['file'], focus: 'file-more' });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('parent closed after child retry', { open: [] });
        return;
    }
    if (name === 'nested-switch' || name === 'nested-forward' || name === 'nested-composed') {
        if (name === 'nested-switch') await edit.hover();
        else await d.page.keyboard.press(openKey);
        await expect(d.page.getByTestId('edit-popup')).toBeVisible();
        await d.checkpoint('switched away from nested branch', { open: ['edit'] });
    } else {
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed only child', { open: ['file'], focus: 'file-more' });
    }
    await d.page.keyboard.press('Escape');
    await d.checkpoint('closed composition', { open: [] });
}
