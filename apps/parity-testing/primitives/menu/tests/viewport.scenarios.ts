import { expect } from '@playwright/test';
import { placementConfig, viewportCases } from '../src/placement';
import type { MenuDriver } from './driver';

export const viewportScenarios = viewportCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = placementConfig(name)!;
        const session = await d.page.context().newCDPSession(d.page);
        const readViewport = () =>
            d.page.evaluate(() => ({
                scale: visualViewport!.scale,
                x: visualViewport!.offsetLeft,
                y: visualViewport!.offsetTop,
                width: visualViewport!.width,
                height: visualViewport!.height,
                layoutWidth: document.documentElement.clientWidth,
                layoutHeight: document.documentElement.clientHeight
            }));
        const settle = () =>
            d.page.evaluate(
                () =>
                    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            );
        const record = async (phase: string) => {
            await settle();
            const popup = (await d.popup.boundingBox())!;
            const viewport = await readViewport();
            const positioner = d.item('positioner');
            d.measurements.push({
                name: phase,
                bounds: {
                    popup,
                    viewport,
                    clientRect: await d.popup.evaluate((node) => node.getBoundingClientRect().toJSON())
                }
            });
            d.checkpoints.push({
                name: phase,
                state: {
                    x: Math.round(popup.x) + 0,
                    y: Math.round(popup.y) + 0,
                    side: await positioner.getAttribute('data-side'),
                    method: await positioner.evaluate((node) => getComputedStyle(node).position),
                    availableWidth: Math.round(
                        await positioner.evaluate((node) =>
                            parseFloat(getComputedStyle(node).getPropertyValue('--available-width'))
                        )
                    ),
                    availableHeight: Math.round(
                        await positioner.evaluate((node) =>
                            parseFloat(getComputedStyle(node).getPropertyValue('--available-height'))
                        )
                    ),
                    scale: viewport.scale,
                    viewportX: Math.round(viewport.x),
                    viewportY: Math.round(viewport.y)
                }
            });
            expect(d.errors).toEqual([]);
            return popup;
        };
        try {
            if (p.kind === 'context') {
                await d.trigger.click({ button: 'right' });
                await expect(d.popup).toBeVisible();
            } else await d.open('mouse');
            if (p.nested) await d.openSub();
            const initial = await record('unzoomed');
            await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
            await expect.poll(async () => (await readViewport()).scale).toBe(2);
            await expect.poll(async () => (await readViewport()).width).toBeLessThan(410);
            const zoomed = await record('zoomed');
            if (p.kind === 'context') expect(Math.abs(zoomed.x - initial.x)).toBeLessThan(1);
            else expect(zoomed.x).toBeLessThan(initial.x - 20);
            if (p.boundary) expect(zoomed.x + zoomed.width).toBeLessThanOrEqual(500);
            if (p.pan) {
                const viewport = await readViewport();
                await session.send('Input.synthesizeScrollGesture', {
                    x: zoomed.x + 20 - viewport.x,
                    y: zoomed.y + 20 - viewport.y,
                    xDistance: -60,
                    yDistance: -40,
                    // A native wheel gesture pans the desktop visual viewport on Linux and macOS.
                    // Chromium's synthesized touch scroll can complete without moving it on Linux.
                    gestureSourceType: 'mouse',
                    speed: 400
                });
                await expect.poll(async () => (await readViewport()).x).toBeGreaterThan(0);
                const panned = await record('visual viewport panned');
                const afterPan = await readViewport();
                // Playwright bounds follow the visual origin; the native pan must not add a shift
                // in layout coordinates. Retain both raw boxes and viewport offsets in the report.
                expect(Math.abs(panned.x + afterPan.x - zoomed.x - viewport.x)).toBeLessThan(1);
                expect(Math.abs(panned.y + afterPan.y - zoomed.y - viewport.y)).toBeLessThan(1);
            }
            if (p.nested) {
                const child = (await d.subPopup.boundingBox())!;
                const viewport = await readViewport();
                // Descendant menus retain the visual-viewport shift policy.
                expect(child.x).toBeGreaterThanOrEqual(0);
                expect(child.x + child.width).toBeLessThanOrEqual(viewport.width + 1);
                d.measurements.push({ name: 'zoomed submenu', bounds: { child, viewport } });
                d.checkpoints.push({
                    name: 'zoomed submenu',
                    state: {
                        x: Math.round(child.x),
                        y: Math.round(child.y),
                        side: await d.item('sub-positioner').getAttribute('data-side')
                    }
                });
            }
            await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
            await expect.poll(async () => (await readViewport()).scale).toBe(1);
            await record('zoom reset');
            await d.page.keyboard.press('Escape');
            if (p.nested) {
                await expect(d.subPopup).toHaveCount(0);
                await expect(d.item('more')).toBeFocused();
                await d.page.keyboard.press('Escape');
            }
            if (p.kind === 'context') {
                await expect(d.popup).toHaveCount(0);
                await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(false);
            } else await d.closed();
        } finally {
            await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
            await session.detach();
        }
    }
}));
