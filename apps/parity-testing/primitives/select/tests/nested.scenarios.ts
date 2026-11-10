import { expect } from '@playwright/test';
import { nestedConfig, nestedNames } from '../src/nested';
import type { Scenario } from './scenario';

export const nestedScenarios: Scenario[] = nestedNames.map((fixture) => ({
    name: `nested: ${fixture.slice('nested-'.length)}`,
    fixture,
    viewport: { width: 800, height: 720 },
    async run(d) {
        const config = nestedConfig(fixture)!;
        const point = { x: 780, y: 680 };
        await d.open();
        await d.checkpoint('child opened', { open: true, shellOpen: true, popupInShell: config.customPortal });
        if (config.modalSelect) await d.wheelPage(false, point);
        await d.key('Escape');
        await d.closed(true);
        await expect(d.trigger).toBeFocused();
        await d.checkpoint('child escaped', { open: false, shellOpen: true });
        await d.open();
        const control = d.page.getByTestId('before');
        const after = (await control.boundingBox())!;
        await d.page.mouse.click(after.x + after.width / 2, after.y + after.height / 2);
        await d.closed(true);
        // Ancestor controls belong to the active floating chain, including for a modal child.
        await d.checkpoint('parent control pressed', { open: false, shellOpen: true, backgroundActivations: 1 });
        if (d.page.context().browser()!.browserType().name() !== 'webkit') await expect(control).toBeFocused();
        await d.open();
        await d.choose('banana');
        await d.closed(true);
        await d.checkpoint('child selected', { open: false, shellOpen: true, entries: [['choice', 'banana']] });
        await d.wheelPage(config.kind === 'popover', point);
        await expect(d.page.getByTestId('shell-popup')).toBeVisible();
        await d.key('Escape');
        await expect(d.page.getByTestId('shell-popup')).toHaveCount(0);
        await expect(d.page.getByTestId('shell-trigger')).toBeFocused();
        d.measurements.push({
            name: 'parent closed',
            bounds: await d.page.evaluate(() => ({
                parentVisible: !!document.querySelector('[data-testid="shell-popup"]'),
                childVisible: !!document.querySelector('[data-testid="popup"]'),
                focus: document.activeElement?.getAttribute('data-testid')
            }))
        });
    }
}));
