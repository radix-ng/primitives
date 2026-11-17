import { expect } from '@playwright/test';
import { navigationCases } from '../src/navigation';
import type { AutocompleteDriver } from './driver';
export const navigationScenarios = Object.entries(navigationCases).map(([name, settings]) => ({
    name,
    async run(d: AutocompleteDriver) {
        const p = settings.navigation!;
        const input = d.page.getByTestId('input');
        await input.focus();
        await expect(input).toBeFocused();
        // A fixed native caret is the precondition for editing-key cases, not a repair after a key.
        if (p.value)
            await input.evaluate((element, kind) => {
                const input = element as HTMLInputElement;
                const position = kind === 'caret' ? 2 : input.value.length;
                input.setSelectionRange(position, position);
            }, p.kind);
        await d.navigationCheckpoint('before native keys', { open: !!p.initialOpen, value: p.value ?? '' });
        const press = async (key: string, expected: Record<string, unknown> = {}) => {
            await d.page.keyboard.press(key);
            await d.navigationCheckpoint(`after ${key}`, expected);
        };
        if (p.kind === 'list' || p.kind === 'disabled') {
            const expected =
                p.direction === 'ArrowUp'
                    ? ['item-2', 'item-1', 'item-0', null, 'item-2', 'item-1']
                    : ['item-0', 'item-1', 'item-2', null, 'item-0', 'item-1'];
            for (let i = 0; i < 6; i++) {
                await d.page.keyboard.press(p.direction!);
                const active = p.autoHighlight === false && p.loop && p.initialOpen ? { active: expected[i] } : {};
                await d.navigationCheckpoint(`arrow ${i + 1}`, { open: true, value: '', ...active });
            }
            if (p.kind === 'disabled') await press('Enter', { open: true, value: '' });
        } else if (p.kind === 'grid') {
            const next = p.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
            const previous = p.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
            for (const key of [p.direction!, next, 'ArrowDown', 'ArrowDown', 'ArrowUp', previous, next])
                await press(key, { open: true, value: '' });
        } else if (p.kind === 'grid-closed') {
            for (const key of ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft']) await press(key);
        } else if (p.kind === 'caret') {
            for (const key of ['Home', 'End', 'Home', 'ArrowRight', 'ArrowLeft', 'End'])
                await press(key, { open: true, value: 'draft', active: null });
        } else if (p.kind === 'space') {
            if (p.spaceHighlight) await press('ArrowDown', { open: true, active: 'item-0' });
            await press('Space');
        } else {
            const keys = ['Shift+ArrowDown', 'Control+ArrowDown', 'Alt+ArrowDown', 'Meta+ArrowDown'];
            const active = ['item-0', 'item-1', 'item-2', null];
            for (const [i, key] of keys.entries()) await press(key, { open: true, active: active[i], value: '' });
        }
    }
}));
