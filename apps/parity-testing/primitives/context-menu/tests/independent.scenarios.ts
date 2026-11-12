import { expect } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
import { independentConfig, type independentCases } from '../src/independent';
import type { ContextMenuDriver } from './scenarios';

export async function runIndependent(d: ContextMenuDriver, name: (typeof independentCases)[number]) {
    const settings = independentConfig(name)!;
    const outerArea = d.page.getByTestId('area');
    const innerArea = d.page.getByTestId('inner-area');
    const outer = d.page.getByTestId('outer-popup');
    const inner = d.page.getByTestId('inner-popup');
    const open = async (area = innerArea) => {
        const box = (await area.boundingBox())!;
        const point = { x: Math.round(box.x + 16), y: Math.round(box.y + 16) };
        await d.page.mouse.click(point.x, point.y, { button: 'right' });
        return point;
    };
    await d.page.getByTestId('before').focus();
    if (settings.popup) {
        await open(outerArea);
        await expect(outer).toBeVisible();
        await d.checkpoint('outer root opened', { open: ['outer'] });
    }
    const point = await open();
    if (name.endsWith('-cancel-open')) {
        await d.checkpoint('independent inner opening canceled', { open: settings.popup ? ['outer'] : [] });
        await d.page.keyboard.press('F5');
        await open();
    }
    if (settings.innerDisabled) {
        await expect(outer).toBeVisible();
        await d.checkpoint('disabled inner area falls through to outer', { open: ['outer'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('outer root closed', { open: [] });
        return;
    }
    await expect(inner).toBeVisible();
    await expect
        .poll(async () => {
            const box = (await inner.boundingBox())!;
            return Math.max(Math.abs(box.x - point.x - 4), Math.abs(box.y - point.y));
        })
        .toBeLessThanOrEqual(2);
    await d.checkpoint('independent inner opened');
    if (name.endsWith('-submenu')) {
        await d.page.getByTestId('inner-more').press('ArrowRight');
        await expect(d.page.getByTestId('inner-sub-alpha')).toBeFocused();
        await d.checkpoint('inner submenu opened');
        await d.page.keyboard.press('Escape');
        await expect(d.page.getByTestId('inner-more')).toBeFocused();
        await d.checkpoint('inner submenu escaped');
    }
    if (name.endsWith('-switch')) {
        const box = (await outerArea.boundingBox())!;
        await pauseClockBeforeInteraction(d.page);
        await d.page.mouse.click(box.x + 8, box.y + 8, { button: 'right' });
        await d.page.clock.runFor(100);
        await d.page.clock.resume();
        await expect(outer).toBeVisible();
        await d.checkpoint('native switch from inner to outer');
        await d.page.keyboard.press('Escape');
    } else if (name.endsWith('-owner-close')) {
        await d.page.keyboard.press('F6');
        await d.checkpoint('outer application close');
    } else if (name.endsWith('-remount')) {
        await d.page.keyboard.press('F3');
        await expect(innerArea).toHaveCount(0);
        await expect(inner).toHaveCount(0);
        await d.checkpoint('inner root removed');
        await d.page.keyboard.press('F4');
        await open();
        await expect(inner).toBeVisible();
        await d.checkpoint('inner root recreated');
        await d.page.keyboard.press('Escape');
    } else if (name.endsWith('-select')) {
        await d.page.getByTestId('inner-alpha').click();
        await d.checkpoint('inner command selected', { selected: ['inner-alpha'] });
    } else if (name.endsWith('-outside')) {
        await d.page.mouse.click(700, 500);
        await d.checkpoint('outside independent roots');
    } else {
        await d.page.keyboard.press('Escape');
        if (name.endsWith('-cancel-close')) {
            await expect(inner).toBeVisible();
            await d.checkpoint('independent inner close canceled');
            await d.page.keyboard.press('F5');
            await d.page.keyboard.press('Escape');
        }
        await d.checkpoint('inner root escaped');
        if (settings.popup && settings.retained) {
            await open();
            await expect(inner).toBeVisible();
            // Select in a completed open session; a fast protocol click can otherwise precede the
            // reference's next-paint completion callback and test a different lifecycle boundary.
            await expect
                .poll(() => d.page.evaluate(() => window.contextMenuParity.completions.inner.filter(Boolean).length))
                .toBe(2);
            await d.page.getByTestId('inner-alpha').click();
            await expect(outer).toBeVisible();
            await d.checkpoint('retained inner command selected', { selected: ['inner-alpha'], open: ['outer'] });
        }
    }
    await d.page.keyboard.press('Escape');
    await d.checkpoint('independent session finished');
}
