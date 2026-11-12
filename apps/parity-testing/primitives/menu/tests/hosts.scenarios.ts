import { expect } from '@playwright/test';
import { hostCases } from '../src/hosts';
import type { MenuDriver } from './driver';
export const hostScenarios = hostCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        await d.open(name.includes('disabled') ? 'mouse' : 'Enter');
        await d.navigateTo(name.includes('subtrigger') ? 'more' : 'action');
        if (name.includes('subtrigger')) {
            if (name.includes('disabled')) await d.page.keyboard.press('Enter');
            else {
                await d.page.keyboard.press(name.endsWith('space') ? 'Space' : 'Enter');
                await expect(d.subPopup).toBeVisible();
                await expect(d.item('sub-alpha')).toBeFocused();
            }
            await d.checkpoint('host submenu activation', { open: true, subOpen: !name.includes('disabled') });
            if (name.includes('disabled')) {
                await d.page.keyboard.press('Space');
                await d.checkpoint('disabled submenu Space stays inactive', { open: true, selected: [] });
            }
            return;
        }
        if (name === 'host-link-typeahead-reopen') {
            await d.page.clock.install();
            await d.page.keyboard.press('a');
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.open();
            await d.navigateTo('action');
            await d.page.keyboard.press('Space');
            await expect.poll(() => d.page.evaluate(() => location.hash)).toBe('#host-target');
            await d.checkpoint('retained session resets typeahead before Space', {
                open: true,
                selected: ['action'],
                navigated: true
            });
            return;
        }
        if (name === 'host-link-typeahead-space') {
            await d.page.clock.install();
            await d.page.keyboard.press('a');
            await d.page.keyboard.press('Space');
            await d.checkpoint('space continues typeahead', { open: true, selected: [], navigated: false });
            return;
        }
        const form = name.startsWith('host-button-form-');
        const key = name.includes('space') ? 'Space' : 'Enter';
        const modifiers = name.endsWith('meta')
            ? 'Meta+'
            : name.endsWith('control')
              ? 'Control+'
              : name.endsWith('shift-alt')
                ? 'Shift+Alt+'
                : name.endsWith('shift')
                  ? 'Shift+'
                  : '';
        await d.page.keyboard.press(modifiers + key);
        const disabled = name.includes('disabled');
        const link = name.includes('link');
        if (!disabled && !form && !name.startsWith('host-link-')) await d.closed();
        if (link && !disabled && !modifiers)
            await expect.poll(() => d.page.evaluate(() => location.hash)).toBe('#host-target');
        await d.checkpoint('host activated', {
            selected: disabled ? [] : ['action'],
            ...(form ? { open: true, hostSubmissions: name.endsWith('submit') ? 1 : 0 } : {}),
            ...(disabled ? { open: true, navigated: false } : {})
        });
        if (disabled) {
            await d.page.keyboard.press('Space');
            await d.checkpoint('disabled Space stays inactive', { open: true, selected: [], navigated: false });
        }
        if (!disabled) {
            const clicks = await d.page.evaluate(() => window.menuParity.hostClicks);
            expect(clicks).toHaveLength(1);
            expect(clicks![0]).toMatchObject({
                ctrl: modifiers.includes('Control'),
                meta: modifiers.includes('Meta'),
                shift: modifiers.includes('Shift'),
                alt: modifiers.includes('Alt')
            });
        }
    }
}));
