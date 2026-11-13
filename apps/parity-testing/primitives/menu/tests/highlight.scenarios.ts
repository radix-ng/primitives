import { expect } from '@playwright/test';
import { highlightCases } from '../src/highlight';
import type { MenuDriver } from './driver';

async function reported(d: MenuDriver, item: string | null, reason: string, layer: 'main' | 'sub' = 'main') {
    await expect
        .poll(() =>
            d.page.evaluate(
                (layer) => window.menuParity.highlights?.changes.filter((change) => change.layer === layer).at(-1),
                layer
            )
        )
        .toMatchObject({ item, reason });
}

export const highlightScenarios = highlightCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const pointer = ['highlight-pointer', 'highlight-disabled-hover'].includes(name);
        await d.open(pointer ? 'mouse' : 'Enter');
        await d.checkpoint('opened');
        if (pointer) {
            const target = name === 'highlight-disabled-hover' ? 'blocked' : 'bravo';
            await d.hoverItem(target);
            // The pin drops WebKit's trusted coordinate travel with zero movement deltas.
            // Observe that existing limitation rather than synthesizing mouse movement.
            const dropsTravel =
                d.framework === 'react' && d.page.context().browser()?.browserType().name() === 'webkit';
            if (dropsTravel) await expect(d.item(target)).not.toHaveAttribute('data-highlighted');
            else await reported(d, target, 'pointer');
            await d.checkpoint('hovered');
            await d.page.mouse.move(790, 590, { steps: 3 });
            if (!dropsTravel) await reported(d, null, 'pointer');
            await d.checkpoint('pointer left');
            return;
        }
        if (name.includes('submenu')) {
            for (const item of ['blocked', 'bravo', 'more']) {
                await d.page.keyboard.press('ArrowDown');
                await reported(d, item, 'keyboard');
            }
            await d.page.keyboard.press(name.endsWith('-rtl') ? 'ArrowLeft' : 'ArrowRight');
            await expect(d.subPopup).toBeVisible();
            await reported(d, 'sub-alpha', 'none', 'sub');
            await reported(d, null, 'none');
            await d.checkpoint('entered child');
            await d.page.keyboard.press('ArrowDown');
            await reported(d, 'sub-bravo', 'keyboard', 'sub');
            await d.checkpoint('child navigation');
            await d.page.keyboard.press('Escape');
            await expect(d.item('more')).toBeFocused();
            await reported(d, 'more', 'none');
            await reported(d, null, 'none', 'sub');
            await d.checkpoint('returned to parent');
            return;
        }
        if (['highlight-typeahead', 'highlight-explicit-label'].includes(name)) {
            await d.page.keyboard.press('End');
            await reported(d, 'omega', 'keyboard');
            const key = name === 'highlight-explicit-label' ? 'z' : 'b';
            await d.page.keyboard.press(key);
            await reported(d, key === 'z' ? 'alpha' : 'blocked', 'keyboard');
            await d.checkpoint('typeahead match');
            return;
        }
        if (
            [
                'highlight-insert',
                'highlight-replace',
                'highlight-reorder',
                'highlight-label-update',
                'highlight-explicit-label-update'
            ].includes(name)
        ) {
            const before = await d.page.evaluate(() => window.menuParity.highlights!.changes.length);
            await d.page.keyboard.press('F3');
            if (name.endsWith('label-update')) {
                await expect(d.item('alpha')).toHaveText('Updated action');
                expect(await d.page.evaluate(() => window.menuParity.highlights!.changes.length)).toBe(before);
                await d.page.keyboard.press('ArrowDown');
                await reported(d, 'blocked', 'keyboard');
                await d.page.keyboard.press('Home');
                await reported(d, 'alpha', 'keyboard');
            } else {
                await reported(d, name === 'highlight-reorder' ? 'bravo' : 'new', 'none');
            }
            await d.checkpoint('collection updated');
            return;
        }
        await d.page.keyboard.press('ArrowDown');
        await reported(d, 'blocked', 'keyboard');
        await d.checkpoint('disabled keyboard item');
        await d.page.keyboard.press('End');
        await reported(d, 'omega', 'keyboard');
        await d.checkpoint('last item');
        await d.page.keyboard.press('End');
        await d.checkpoint('same item does not repeat');
        await d.page.keyboard.press('Escape');
        await d.closed();
        await reported(d, null, 'none');
        await d.checkpoint('closed');
        if (name === 'highlight-retained') {
            await d.open();
            await d.checkpoint('retained reopened');
        }
    }
}));
