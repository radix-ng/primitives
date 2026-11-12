import { expect } from '@playwright/test';
import { projectionCases, projectionConfig } from '../src/projection';
import type { MenuDriver } from './driver';

export const projectionScenarios = projectionCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = projectionConfig(name)!;
        for (let session = 1; session <= (p.retained ? 2 : 1); session++) {
            await d.open();
            const first = p.mixed ? 'inner' : p.late ? 'omega' : 'alpha';
            await expect(d.item(first)).toBeFocused();
            await d.checkpoint(`session ${session} projected entry`, { focus: first, highlighted: [first] });
            if (p.nested) {
                await d.openSub(name.endsWith('-rtl'));
                await d.checkpoint(`session ${session} child entry`, {
                    focus: 'sub-alpha',
                    highlighted: ['sub-alpha']
                });
                await d.page.keyboard.press(name.endsWith('-rtl') ? 'ArrowRight' : 'ArrowLeft');
                await expect(d.item('more')).toBeFocused();
                await expect(d.subPopup).not.toBeVisible();
                await d.checkpoint(`session ${session} parent return`, {
                    open: true,
                    subOpen: false,
                    highlighted: ['more']
                });
            }
            if (name === 'projection-keyboard' || p.mixed) {
                if (p.mixed) {
                    await d.page.keyboard.press('ArrowDown');
                    await expect(d.item('alpha')).toBeFocused();
                }
                await d.page.keyboard.press('ArrowDown');
                await expect(d.item('blocked')).toBeFocused();
                await d.page.keyboard.press('Enter');
                await d.checkpoint('disabled projected activation ignored', {
                    selected: [],
                    focus: 'blocked',
                    open: true
                });
                await d.page.keyboard.press('ArrowDown');
                await expect(d.item('bravo')).toBeFocused();
                await d.checkpoint('projected arrow order', { focus: 'bravo', highlighted: ['bravo'] });
            }
            if (name === 'projection-typeahead') {
                await d.navigateTo('omega');
                await d.page.keyboard.press('z');
                await expect(d.item('alpha')).toBeFocused();
                await d.checkpoint('projected explicit label', { focus: 'alpha', highlighted: ['alpha'] });
            }
            if (p.values) {
                await d.navigateTo('check');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('projected checkbox', { open: true, checked: 'true', focus: 'check' });
                await d.navigateTo('radio-two');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('projected radio', { open: true, radio: ['radio-two'], focus: 'radio-two' });
            }
            if (p.link) {
                await d.navigateTo('link');
                await d.page.keyboard.press('Enter');
                await d.closed();
                await expect(d.page).toHaveURL(/#projection-target$/);
                await d.checkpoint('projected link selected', { open: false, selected: ['link'] });
                continue;
            }
            if (name === 'projection-reorder' || p.late) {
                await d.page.keyboard.press('F3');
                await expect(d.item('bravo')).toBeVisible();
                await d.checkpoint('projected collection changed', { focus: first });
                await d.page.keyboard.press('ArrowUp');
                await expect(d.item('omega')).toBeFocused();
                await d.checkpoint('navigation after projected DOM change');
            }
            if (p.cancelFocus) {
                await d.page.keyboard.press('Tab');
                await d.checkpoint('projected focus-out veto', { open: true, focus: 'alpha' });
            }
            if (p.finalTarget || p.cancelFocus || p.nested) {
                await d.page.keyboard.press('Escape');
            } else {
                await d.page.keyboard.press('End');
                await expect(d.item('omega')).toBeFocused();
                await d.page.keyboard.press('Enter');
            }
            await d.closed();
            await d.checkpoint(`session ${session} projected disposal`, {
                open: false,
                focus: p.finalTarget ? 'root-final' : 'primary'
            });
        }
    }
}));
