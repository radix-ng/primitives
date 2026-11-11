import { expect, type Locator } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
import type { compositionCases } from '../src/composition';
import type { ContextMenuDriver } from './scenarios';

async function rightClick(d: ContextMenuDriver, area: Locator, x = 24, y = 16) {
    const box = (await area.boundingBox())!;
    const point = { x: Math.round(box.x + x), y: Math.round(box.y + y) };
    await d.page.mouse.click(point.x, point.y, { button: 'right' });
    return point;
}

async function pointAnchor(d: ContextMenuDriver, point: { x: number; y: number }) {
    const popup = d.page.getByTestId('context-popup');
    await expect(popup).toBeVisible();
    await expect
        .poll(async () => {
            const box = (await popup.boundingBox())!;
            return Math.max(Math.abs(box.x - point.x - 4), Math.abs(box.y - point.y));
        })
        .toBeLessThanOrEqual(2);
    d.measurements.push({ name: 'context point anchor', point, popup: await popup.boundingBox() });
}

async function switchArea(d: ContextMenuDriver, area: Locator) {
    await pauseClockBeforeInteraction(d.page);
    const point = await rightClick(d, area);
    await d.page.clock.runFor(100);
    await d.page.clock.resume();
    return point;
}

export async function runComposition(d: ContextMenuDriver, name: (typeof compositionCases)[number]) {
    const area = d.page.getByTestId('area');
    const second = d.page.getByTestId('area-two');
    const popup = d.page.getByTestId('context-popup');
    const child = d.page.getByTestId('context-sub-popup');
    const more = d.page.getByTestId('context-more');
    const rtl = name.endsWith('-rtl');
    const enter = rtl ? 'ArrowLeft' : 'ArrowRight';
    await d.page.getByTestId('before').focus();

    if (name.startsWith('areas-')) {
        const nested = name.startsWith('areas-nested');
        const origin = await rightClick(d, nested ? second : area);
        if (name.includes('cancel-open')) {
            await d.checkpoint('area opening canceled', { open: [], mounted: [] });
            await d.page.keyboard.press('F5');
            const retry = await rightClick(d, second);
            await pointAnchor(d, retry);
            await d.checkpoint('area opening retried', { open: ['context'] });
        } else {
            await pointAnchor(d, origin);
            await d.checkpoint('first context area opened', { open: ['context'], selected: [] });
        }
        const firstView = await popup.elementHandle();
        if (name.startsWith('areas-switch')) {
            // Observe a real outside right-press; no forced action bypasses the modal backdrop.
            // Deliver the gesture within one paint frame instead of letting protocol latency decide
            // whether the old view unmounts between pointerdown and the native contextmenu event.
            let next = await switchArea(d, second);
            if (name === 'areas-switch-cancel-close') {
                await d.checkpoint('area switch closing canceled', { open: ['context'] });
                await pointAnchor(d, origin);
                await d.page.keyboard.press('F5');
                next = await switchArea(d, second);
            }
            await d.checkpoint('outside right press at second area');
            await pointAnchor(d, next);
            await d.checkpoint('second area after right press', { open: ['context'] });
        }
        await d.page.keyboard.press('Escape');
        if (name === 'areas-cancel-close') {
            await d.checkpoint('area close canceled', { open: ['context'] });
            await d.page.keyboard.press('F5');
            await d.page.keyboard.press('Escape');
        }
        await d.checkpoint('first area session closed', { open: [] });
        if (name === 'areas-return-focus') await d.page.getByTestId('before').focus();
        const next = await rightClick(d, second);
        await pointAnchor(d, next);
        if (name === 'areas-keep-mounted')
            expect(await firstView!.evaluate((element) => element.isConnected)).toBe(true);
        await d.checkpoint('second context area opened', { open: ['context'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('area sessions closed', { open: [] });
        return;
    }

    await pointAnchor(d, await rightClick(d, area));
    await d.checkpoint('context parent ready', { open: ['context'], focus: 'context-popup' });
    if (name.includes('hover')) {
        await more.hover();
    } else {
        await d.page.keyboard.press('End');
        await expect(more).toBeFocused();
        await d.page.keyboard.press(enter);
    }
    if (name === 'composition-cancel-child-open') {
        await d.checkpoint('context child opening canceled', { open: ['context'] });
        await d.page.keyboard.press('F5');
        await more.press(enter);
    }
    await expect(child).toBeVisible();
    await d.checkpoint('context child opened', { open: ['context', 'context-sub'] });
    if (name.includes('hover')) {
        const before = await d.page.evaluate(() => window.contextMenuParity.pointerMoves.at(-1));
        const start = await d.page.evaluate(() => window.contextMenuParity.pointerMoves.length);
        await d.page.getByTestId('context-sub-alpha').hover();
        const moves = await d.page.evaluate((start) => window.contextMenuParity.pointerMoves.slice(start), start);
        expect(moves.length).toBeGreaterThan(0);
        expect(moves.every((move) => move.trusted)).toBe(true);
        expect(moves.some((move) => move.clientX !== before?.clientX || move.clientY !== before?.clientY)).toBe(true);
        d.measurements.push({ name: 'native child hover travel', before, moves });
        await d.checkpoint('context child reached by mouse', { open: ['context', 'context-sub'] });
    } else {
        await expect(d.page.getByTestId('context-sub-alpha')).toBeFocused();
        await d.page.keyboard.press('ArrowDown');
        await expect(d.page.getByTestId('context-sub-bravo')).toBeFocused();
        await d.page.keyboard.press('Escape');
        if (name === 'composition-cancel-child-close') {
            await d.checkpoint('context child closing canceled', {
                open: ['context', 'context-sub'],
                focus: 'context-sub-bravo'
            });
            await d.page.keyboard.press('F5');
            await d.page.keyboard.press('Escape');
        }
        await expect(child).toHaveCount(0);
        await d.checkpoint('only child closed', { open: ['context'], focus: 'context-more' });
        await more.press(enter);
        await expect(d.page.getByTestId('context-sub-alpha')).toBeFocused();
    }
    await d.page.getByTestId('context-sub-alpha').click();
    if (name === 'composition-cancel-parent-select') {
        await d.checkpoint('parent selection closing canceled', { open: ['context'], selected: ['context-sub-alpha'] });
        await d.page.keyboard.press('F5');
        await more.press(enter);
        await expect(d.page.getByTestId('context-sub-alpha')).toBeFocused();
        await d.page.getByTestId('context-sub-alpha').click();
    }
    await d.checkpoint('context chain selected', {
        open: [],
        selected:
            name === 'composition-cancel-parent-select'
                ? ['context-sub-alpha', 'context-sub-alpha']
                : ['context-sub-alpha']
    });
}
