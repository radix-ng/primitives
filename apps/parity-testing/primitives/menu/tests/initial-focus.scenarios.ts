import { expect } from '@playwright/test';
import { initialFocusCases, initialFocusConfig } from '../src/initial-focus';
import type { MenuDriver } from './driver';
export const initialFocusScenarios = initialFocusCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = initialFocusConfig(name)!;
        await d.open(settings.nested ? 'Enter' : settings.key);
        if (settings.nested) {
            await d.navigateTo('more');
            await d.page.keyboard.press('ArrowRight');
            await expect(d.subPopup).toBeVisible();
        }
        await d.checkpoint('disabled boundary opened', { open: true, selected: [] });
        const direction = settings.key === 'ArrowUp' ? 'ArrowUp' : 'ArrowDown';
        for (let index = 1; index <= 2; index++) {
            await d.page.keyboard.press(direction);
            await d.checkpoint(`boundary arrow ${index}`, { open: true, selected: [] });
        }
        // The same explicit native edge requests resolve a different logical index when a sibling exists.
        await d.page.keyboard.press('End');
        await d.checkpoint('boundary End requested');
        await d.page.keyboard.press('Home');
        await d.checkpoint('boundary Home requested');
        if (!settings.single) {
            await expect(d.item(settings.nested ? 'sub-alpha' : 'action')).toBeFocused();
            await d.page.keyboard.press('Enter');
            await d.page.keyboard.press('Space');
            await d.checkpoint('disabled item does not activate', { open: true, selected: [], navigated: false });
        }
        const depart = async () => {
            const staysInParent = settings.departure === 'Shift+Tab' || settings.parentControl;
            await d.page.keyboard.press(settings.departure ?? 'Tab');
            await d.checkpoint('submenu Tab boundary departed', {
                open: staysInParent,
                subOpen: false,
                focus: settings.departure === 'Shift+Tab' ? 'more' : settings.parentControl ? 'parent-control' : 'after'
            });
            if (staysInParent) await d.page.keyboard.press('Escape');
            await d.closed();
        };
        if (settings.departure && !settings.retained) {
            await d.page.keyboard.press('End');
            await d.checkpoint('submenu ready to depart');
            await depart();
            return;
        }
        await d.page.keyboard.press('Escape');
        if (settings.nested) {
            // Start the next gesture in the parent, after child focus-scope deactivation.
            await expect(d.item('more')).toBeFocused();
            await d.page.keyboard.press('Escape');
        }
        await d.closed();
        await d.checkpoint('boundary closed', { open: false });
        if (settings.retained) {
            await d.open('ArrowDown');
            if (settings.nested) {
                await d.navigateTo('more');
                await d.page.keyboard.press('ArrowRight');
                await expect(d.subPopup).toBeVisible();
            }
            await d.checkpoint('retained disabled boundary reopened', { open: true, selected: [] });
            if (settings.nested) await depart();
            else {
                await d.page.keyboard.press('Escape');
                await d.closed();
            }
        }
    }
}));
