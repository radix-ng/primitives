import { valueCases } from '../src/value';
import type { AutocompleteDriver } from './driver';
export const valueScenarios = Object.entries(valueCases).map(([name, settings]) => ({
    name,
    async run(d: AutocompleteDriver) {
        const p = settings.valueState!;
        const input = d.page.getByTestId('input');
        await input.focus();
        let step = 0;
        const check = (name: string, expected: Record<string, unknown> = {}) =>
            d.valueCheckpoint(`${++step}. ${name}`, expected);
        const press = async (key: string, expected: Record<string, unknown> = {}) => {
            await d.page.keyboard.press(key);
            await check(`after ${key}`, expected);
        };
        await check('initial', { committed: p.value ?? '' });
        if (p.kind === 'initial') {
            const items =
                p.mode === 'list' || p.mode === 'both'
                    ? p.value?.trim()
                        ? ['Beta']
                        : ['Alpha', 'Alpine', 'Beta', 'Gamma']
                    : ['Alpha', 'Alpine', 'Beta', 'Gamma'];
            await check('initial filtering', { items });
        } else if (p.kind === 'defaults') {
            await press('ArrowDown', { open: true, items: ['Beta'], value: ' Beta ' });
        } else if (p.kind === 'external') {
            for (const key of ['F2', 'F3', 'F4']) await press(key);
        } else if (p.kind === 'typing') {
            for (const key of ['a', 'ArrowDown', 'ArrowUp', 'Backspace']) await press(key);
        } else {
            await press('ArrowDown', { value: 'Alpha', committed: p.value ?? '' });
            if (p.kind === 'cancel-edit') {
                await press('b', { value: 'al', committed: 'al', active: 'value-item-0' });
                return;
            }
            if (p.kind === 'hover') {
                await d.page.getByTestId('value-item-1').hover();
                await check('hover preserves preview', { value: 'Alpha', committed: '' });
                await input.hover();
                await check('pointer leave preserves preview', { value: 'Alpha', committed: '' });
            } else if (p.kind === 'external-preview') {
                for (const key of ['F2', 'F3', 'F4']) await press(key);
            } else if (p.kind === 'mode') {
                await press('F5', { value: '', committed: '' });
                await press('F5', { value: '', committed: '' });
                await press('ArrowDown', { value: 'Alpine', committed: '' });
            } else {
                if (p.kind === 'select') {
                    await d.page.getByTestId('value-item-2').click();
                    await check('selection commits', { value: 'Beta', committed: 'Beta', open: false });
                } else await press('Escape', { value: '', committed: '', open: false });
                await press('ArrowDown', { open: true });
                await press('ArrowDown', { open: true });
            }
        }
    }
}));
