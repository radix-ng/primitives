import { expect } from '@playwright/test';
import { readOnlyCases } from '../src/read-only';
import type { AutocompleteDriver } from './driver';
export const readOnlyScenarios = Object.entries(readOnlyCases).map(([name, settings]) => ({
    name,
    async run(d: AutocompleteDriver) {
        const p = settings.navigation!;
        const input = d.page.getByTestId('input');
        await input.focus();
        const check = (name: string, expected: Record<string, unknown> = {}) =>
            d.navigationCheckpoint(name, expected, p.readOnlyCase === 'preview' ? 'read-only-preview' : 'navigation');
        const press = async (key: string, expected: Record<string, unknown> = {}) => {
            await d.page.keyboard.press(key);
            await check(`after ${key}`, expected);
        };
        await check('initial read-only state', { readOnly: p.readOnly, committed: p.value ?? '' });
        if (p.readOnlyCase === 'browse') {
            if (p.opener === 'input' || p.opener === 'trigger') {
                await d.page.getByTestId(p.opener).click();
            } else {
                if (p.opener === 'trigger-key') await d.page.getByTestId('trigger').focus();
                await d.page.keyboard.press(p.direction!);
            }
            await check('opened for browsing', { open: true, value: '', committed: '' });
            await press('ArrowDown', { open: true, value: '' });
            await press('Enter', { open: true, value: '', committed: '', submits: 0 });
            await press('Space', { open: true, value: '', committed: '' });
            await d.page.keyboard.type('x');
            await press('Delete', { open: true, value: '', committed: '' });
            await d.page.getByTestId('item-1').click();
            await check('item press stays read-only', { open: true, value: '', committed: '' });
            await press('Escape', { open: false, value: '', committed: '' });
        } else if (p.readOnlyCase === 'preview') {
            if (p.previewOrigin === 'typing') {
                await d.page.keyboard.type('Al');
                // G4 owns when typing displays the suffix. Establish the settled query/highlight
                // through native input; retain the full setup observation without certifying G4.
                await d.navigationCheckpoint('typed setup', { committed: 'Al', active: 'item-0' }, 'read-only-setup');
            } else {
                await press('ArrowDown', { open: true, value: '' });
            }
            await press('ArrowDown', {
                value: p.previewOrigin === 'typing' ? 'Beta' : 'Alpha',
                committed: p.previewOrigin === 'typing' ? 'Al' : ''
            });
            const committed = p.previewOrigin === 'typing' ? 'Al' : '';
            await press('F2', { readOnly: true, value: committed, committed, ariaAutocomplete: 'none' });
            await press('ArrowDown', { readOnly: true, value: committed, committed });
            await press('F2', { readOnly: false, value: committed, committed, ariaAutocomplete: p.mode });
            await press('ArrowUp', {
                readOnly: false,
                committed,
                value: p.previewOrigin === 'typing' ? 'Beta' : 'Alpha'
            });
        } else if (p.readOnlyCase === 'enter') {
            await press('Enter', { open: true, committed: '', value: '', active: null, submits: 1 });
        } else if (p.readOnlyCase === 'grid') {
            await press('ArrowDown', { active: 'item-0', value: '', listReadOnly: null, ariaReadOnly: 'true' });
            await press(p.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', { active: 'item-1', value: '' });
            await press('Enter', { open: true, value: '', committed: '' });
        } else {
            // Native caret precondition; later selection is observed without repair.
            await input.evaluate((element) => (element as HTMLInputElement).setSelectionRange(2, 2));
            for (const key of ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'Home', 'Delete'])
                await press(key, { open: true, value: 'Seed', committed: 'Seed', active: null });
        }
        expect(d.errors).toEqual([]);
    }
}));
