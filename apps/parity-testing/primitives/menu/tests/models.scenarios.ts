import { expect } from '@playwright/test';
import { modelCases, modelConfig } from '../src/models';
import type { MenuDriver } from './driver';

export const modelScenarios = modelCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = modelConfig(name)!;
        const record = async (phase: string, open: boolean, value?: string | null) => {
            await expect(d.trigger).toHaveAttribute('aria-expanded', String(open));
            if (open) await expect(d.popup).toBeVisible();
            else await expect(d.popup).toHaveCount(0);
            if (p.radio && open) {
                for (const item of ['one', 'two'])
                    await expect(d.item(`radio-${item}`)).toHaveAttribute('aria-checked', String(item === value));
            }
            await d.checkpoint(phase);
        };
        await record('initial model', p.initiallyOpen);
        if (p.radio) {
            await d.open('Enter');
            const initial = p.explicitRadio && p.value !== undefined ? p.value : p.defaultValue;
            await record('initial selection', true, initial);
            if (p.late && name.endsWith('-select')) {
                await d.item('radio-two').click();
                await record('selected before late default', true, 'two');
            }
            await d.page.keyboard.press('F3');
            await record('default changed', true, p.late && name.endsWith('-select') ? 'two' : initial);
            await d.item('radio-one').click();
            await record('selected after default change', true, 'one');
            await d.page.keyboard.press('Escape');
            await d.closed();
        } else if (p.late) {
            if (p.initiallyOpen) {
                await d.page.keyboard.press('Escape');
                await d.closed();
            }
            await d.page.keyboard.press('F3');
            await record('late default ignored', false);
            // Flip the default back too: neither change is a command to reopen the menu.
            await d.page.keyboard.press('F3');
            await record('default restored', false);
            await d.open('Enter');
            await record('native opening still works', true);
            await d.page.keyboard.press('Escape');
            await d.closed();
        } else {
            if (!p.initiallyOpen) await d.open('Enter');
            await record('opened', true);
            if (p.nested) {
                await expect(d.item('more')).toHaveAttribute('aria-expanded', 'false');
                await expect(d.subPopup).toHaveCount(0);
                await d.openSub();
                await d.checkpoint('nested model accepted native open');
                await d.page.keyboard.press('Escape');
                await expect(d.subPopup).toHaveCount(0);
                await expect(d.item('more')).toBeFocused();
            }
            await d.page.keyboard.press('Escape');
            await d.closed();
            await record('closed after default opening', false);
        }
        expect(d.errors).toEqual([]);
    }
}));
