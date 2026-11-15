import { expect } from '@playwright/test';
import { panelCases, type PanelCaseName } from '../src/panels';
import type { TabsDriver } from './driver';

export const panelScenarios = (Object.keys(panelCases) as PanelCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = panelCases[name].panels!;
        const page = driver.page;
        const panel = (i: number) => page.getByTestId(`panel-${i}`);
        const content = (i: number) => page.getByTestId(`content-${i}`);
        const tab = (i: number) => page.getByTestId(`tab-${i}`);
        const retained = !settings.presence || settings.keepMounted;
        const finish = async (i: number, subtree = true) =>
            panel(i).evaluate((element, subtree) => {
                for (const animation of element.getAnimations({ subtree })) animation.finish();
            }, subtree);
        const key = async (value: 'Tab' | 'Shift+Tab') => {
            const macWebkit =
                page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
            await page.keyboard.press(macWebkit ? `Alt+${value}` : value);
        };

        await driver.panelCheckpoint('initial panel state', { selected: [0], activations: [0, 0], changes: [] });
        await tab(1).press('Enter');
        await expect(tab(1)).toHaveAttribute('aria-selected', 'true');

        if (settings.motion === 'held') {
            await expect(panel(0)).toHaveAttribute('data-ending-style', '');
            await expect(content(0)).toBeVisible();
            await driver.panelCheckpoint('outgoing panel is inert during exit', { selected: [1], focus: 'tab-1' });

            await page.getByTestId('field-0').evaluate((element) => element.focus());
            await expect(tab(1)).toBeFocused();
            await driver.panelCheckpoint('outgoing focus request ignored', { focus: 'tab-1' });

            const bounds = (await page.getByTestId('action-0').boundingBox())!;
            await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
            await driver.panelCheckpoint('outgoing pointer action blocked', { activations: [0, 0] });

            await tab(1).focus();
            for (const id of ['panel-1', 'field-1', 'action-1', 'after']) {
                await key('Tab');
                await expect(page.getByTestId(id)).toBeFocused();
            }
            for (const id of ['action-1', 'field-1', 'panel-1', 'tab-1']) {
                await key('Shift+Tab');
                await expect(page.getByTestId(id)).toBeFocused();
            }
            await driver.panelCheckpoint('forward and backward Tab exclude outgoing content', { focus: 'tab-1' });

            if (settings.nested) {
                await page.getByTestId('nested-0').evaluate((element) => {
                    for (const animation of element.getAnimations()) animation.finish();
                });
                await driver.panelCheckpoint('child completion keeps parent exit', { selected: [1] });
                await expect(content(0)).toBeVisible();
            }
            if (settings.reselect) {
                await tab(0).press('Enter');
                await expect(tab(0)).toHaveAttribute('aria-selected', 'true');
                await driver.panelCheckpoint('reselected panel stays interactive', { selected: [0], focus: 'tab-0' });
                await finish(1);
                await expect(content(1)).toBeHidden();
                await page.getByTestId('field-0').focus();
                await expect(page.getByTestId('field-0')).toBeFocused();
                await page.getByTestId('action-0').click();
                await driver.panelCheckpoint('reselection survives old completion', {
                    selected: [0],
                    activations: [1, 0]
                });
                return;
            }
            await finish(0);
        }

        if (retained) await expect(panel(0)).toBeHidden();
        else await expect(content(0)).toHaveCount(0);
        await driver.panelCheckpoint('exit settled', { selected: [1], activations: [0, 0] });
        await page.getByTestId('field-1').focus();
        await expect(page.getByTestId('field-1')).toBeFocused();
        await page.getByTestId('action-1').click();
        await driver.panelCheckpoint('active panel accepts input', { selected: [1], activations: [0, 1] });
    }
}));
