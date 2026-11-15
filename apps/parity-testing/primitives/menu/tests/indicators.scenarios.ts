import { expect, type Locator } from '@playwright/test';
import { indicatorCases, indicatorConfig } from '../src/indicators';
import type { MenuDriver } from './driver';

const settled = async (indicator: Locator) => {
    await expect(indicator).toBeVisible();
    await expect(indicator).not.toHaveAttribute('data-starting-style', '');
    await expect(indicator).not.toHaveAttribute('data-ending-style', '');
    await expect(indicator).toHaveAttribute('aria-hidden', 'true');
};

export const indicatorScenarios = indicatorCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const config = indicatorConfig(name)!;
        const currentId = config.radio ? 'radio-one' : 'check';
        const alternateId = config.radio ? 'radio-two' : 'check';
        const current = d.item(`${currentId}-indicator`);
        const alternate = d.item(`${alternateId}-indicator`);
        const absent = async (node: Locator) => {
            if (config.retained) await settled(node);
            else await expect(node).toBeHidden();
        };
        const checkpoint = async (phase: string) => {
            d.measurements.push({
                name: phase,
                bounds: await d.page.locator('[data-testid$="-indicator"]').evaluateAll((nodes) =>
                    nodes.map((node) => ({
                        id: node.getAttribute('data-testid'),
                        display: getComputedStyle(node).display,
                        animations: node.getAnimations().map((animation) => animation.playState)
                    }))
                )
            });
            await d.checkpoint(phase);
        };

        await d.open();
        // The decorative glyph must not change the native accessible item name.
        await expect(
            d.page.getByRole(config.radio ? 'menuitemradio' : 'menuitemcheckbox', {
                name: config.radio ? 'Small' : 'Notifications',
                exact: true
            })
        ).toBeVisible();
        if (config.radio) await settled(current);
        else await absent(current);
        await checkpoint('initial indicator state');

        if (!config.radio) {
            await d.item(currentId).press('Space');
            await settled(current);
            await checkpoint('indicator selected');
        }
        if (config.natural) {
            await current.evaluate((node) => {
                node.addEventListener('animationend', () => (document.body.dataset['indicatorExitEnded'] = 'true'), {
                    once: true
                });
            });
        }
        await d.item(alternateId).press('Space');
        if (config.radio) await settled(alternate);
        if (config.animated) {
            await expect(current).toHaveAttribute('data-ending-style', '');
            await expect(current).toBeVisible();
            await expect.poll(() => current.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
            await checkpoint('indicator exit pending');

            // Recheck/reselect through native input before the old exit settles.
            await d.item(currentId).press('Space');
            await settled(current);
            if (config.radio) {
                await alternate.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
                await absent(alternate);
            }
            await checkpoint('indicator exit interrupted');
            await d.item(alternateId).press('Space');
            await expect(current).toHaveAttribute('data-ending-style', '');
            await current.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
        }
        await absent(current);
        if (config.natural) await expect(d.page.locator('body')).toHaveAttribute('data-indicator-exit-ended', 'true');
        if (config.radio) await settled(alternate);
        await checkpoint('indicator exit completed');
        await d.page.keyboard.press('Escape');
        await d.closed();
        await checkpoint('menu closed after indicator exit');
    }
}));
