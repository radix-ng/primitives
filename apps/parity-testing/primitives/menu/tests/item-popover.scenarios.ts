import { expect } from '@playwright/test';
import { itemPopoverCases, itemPopoverConfig } from '../src/item-popover';
import type { MenuDriver } from './driver';

async function popoverReady(d: MenuDriver, anchoredToItem: boolean) {
    await expect(d.item('item-popup')).toBeVisible();
    await expect.poll(() => d.page.evaluate(() => window.menuParity.popover?.completions.at(-1))).toBe(true);
    await expect(d.item('popover-cancel')).toBeFocused();
    const anchor = d.item(anchoredToItem ? 'alpha' : 'primary');
    await expect
        .poll(async () => {
            const a = (await anchor.boundingBox())!;
            const p = (await d.item('item-popup').boundingBox())!;
            return Math.max(Math.abs(p.x - a.x - a.width - 8), Math.abs(p.y - a.y));
        }, 'popover tracks the surviving native anchor')
        .toBeLessThan(2);
    d.measurements.push({
        name: 'popover anchor geometry',
        bounds: {
            anchor: await anchor.boundingBox(),
            popup: await d.item('item-popup').boundingBox()
        }
    });
}

export const itemPopoverScenarios = itemPopoverCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const settings = itemPopoverConfig(name)!;
        if (settings.drag) {
            const box = (await d.trigger.boundingBox())!;
            await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const pressedAt = await d.page.evaluate(() => performance.now());
            await d.page.mouse.down();
            await expect(d.popup).toBeVisible();
            await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(true);
            // The pin's native opening guard accepts a release after 200 ms.
            await expect
                .poll(() => d.page.evaluate((start) => performance.now() - start, pressedAt))
                .toBeGreaterThan(210);
            await d.hoverItem('alpha');
            await d.page.mouse.up();
        } else {
            await d.open(name === 'item-popover-pointer' ? 'mouse' : 'Enter');
            if (settings.nested) await d.openSub();
            if (name === 'item-popover-pointer') await d.item('alpha').click();
            else await d.page.keyboard.press(name === 'item-popover-space' ? 'Space' : 'Enter');
        }
        if (settings.canceledOpen) {
            await expect(d.item('item-popup')).toHaveCount(0);
            await d.checkpoint('popover opening vetoed', { open: true, selected: ['alpha'] });
            return;
        }
        await popoverReady(d, settings.stayOpen && !settings.composed);
        await d.checkpoint('popover owns focus after menu item activation', {
            selected: [settings.nested ? 'sub-alpha' : 'alpha'],
            popover: expect.objectContaining({ open: true, visible: true, isolated: false })
        });
        if (settings.stayOpen || settings.canceledClose) {
            await expect(d.popup).toBeVisible();
            if (name === 'item-popover-stay-tab') {
                await d.page.keyboard.press('Shift+Tab');
                await expect(d.item('popover-confirm')).toBeFocused();
                await d.checkpoint('Shift Tab stays in trapping popover', { open: true });
                await d.page.keyboard.press('Tab');
                await expect(d.item('popover-cancel')).toBeFocused();
            }
            if (name.startsWith('item-popover-stay-hover')) {
                await d.hoverItem('omega');
                await d.checkpoint('hover returns focus to the menu', { open: true });
                // The pin rejects WebKit's zero movement deltas despite a trusted coordinate path.
                // Preserve that observation; it cannot establish parent-focused Escape in the pin.
                if (d.page.context().browser()?.browserType().name() === 'webkit') return;
                await expect(d.item('omega')).toBeFocused();
                await d.page.keyboard.press('Escape');
                await d.closed();
                if (settings.retained) {
                    await expect(d.item('item-popup')).toBeVisible();
                    await d.checkpoint('retained menu preserves its popover root', { open: false });
                } else {
                    await expect(d.item('item-popup')).toHaveCount(0);
                    await d.checkpoint('menu escape removes its owned popover', { open: false });
                }
                return;
            }
        } else if (settings.animated || settings.deferred) {
            await expect(d.popup).toHaveAttribute('data-ending-style', '');
            await d.checkpoint('menu exit does not steal popover focus', { open: false, mounted: true });
            if (settings.deferred) await d.page.keyboard.press('F3');
            else {
                await expect
                    .poll(() => d.popup.evaluate((el) => el.getAnimations({ subtree: true }).length))
                    .toBeGreaterThan(0);
                await d.popup.evaluate((el) => {
                    for (const animation of el.getAnimations({ subtree: true })) animation.finish();
                });
            }
            await expect(d.popup).toHaveCount(0);
            await expect(d.item('popover-cancel')).toBeFocused();
            await d.checkpoint('menu completion preserves popover focus', { open: false });
        } else if (settings.retained) await expect(d.popup).toBeHidden();
        else await expect(d.popup).toHaveCount(0);
        if (name === 'item-popover-stay-outside') {
            const box = (await d.popup.boundingBox())!;
            // Use the bottom padding's center, away from rounded-corner hit testing and the items.
            const point = { x: box.x + box.width / 2, y: box.y + box.height - 2 };
            expect(
                await d.page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.getAttribute('data-testid'), point)
            ).toBe('popup');
            await d.page.mouse.click(point.x, point.y);
        } else if (name === 'item-popover-outside') await d.item('after').click();
        else if (name === 'item-popover-pointer') await d.item('popover-cancel').click();
        else await d.page.keyboard.press('Escape');
        await expect(d.item('item-popup')).toHaveCount(0);
        await expect.poll(() => d.page.evaluate(() => window.menuParity.popover?.completions.at(-1))).toBe(false);
        await d.checkpoint('popover closed and native focus returned');
        if (name === 'item-popover-outside') await expect(d.item('after')).toBeFocused();
        else if (name !== 'item-popover-stay-outside')
            await expect(settings.stayOpen || settings.canceledClose ? d.item('alpha') : d.trigger).toBeFocused();
        if (settings.stayOpen) {
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.trigger).toBeFocused();
            await d.checkpoint('menu closes after popover');
        } else if (!settings.canceledClose) {
            await d.open();
            await d.checkpoint('menu can reopen after popover', { open: true });
        }
    }
}));
