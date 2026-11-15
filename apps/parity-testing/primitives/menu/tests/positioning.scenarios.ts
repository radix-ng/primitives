import { expect } from '@playwright/test';
import { positioningCases, positioningConfig } from '../src/positioning';
import type { MenuDriver } from './driver';

async function wheel(d: MenuDriver, target: 'document' | 'inner', x: number, y: number) {
    if (target === 'document') await d.page.mouse.move(760, 550);
    else {
        const box = (await d.item('boundary-inner').boundingBox())!;
        await d.page.mouse.move(box.x + box.width - 8, box.y + 12);
    }
    const read = () =>
        d.page.evaluate((target) => {
            const node =
                target === 'document'
                    ? document.scrollingElement!
                    : document.querySelector('[data-testid="boundary-inner"]')!;
            return {
                x: node.scrollLeft,
                y: node.scrollTop,
                maxX: node.scrollWidth - node.clientWidth,
                maxY: node.scrollHeight - node.clientHeight
            };
        }, target);
    // Firefox caps a vertical wheel impulse to the scrollport height. Small native impulses
    // reach the same destination in every engine without assigning scrollTop/scrollLeft.
    const steps = Math.ceil(Math.max(Math.abs(x), Math.abs(y)) / 120);
    for (let step = 0; step < steps; step++) {
        const deltaX = Math.sign(x) * Math.min(120, Math.max(0, Math.abs(x) - step * 120));
        const deltaY = Math.sign(y) * Math.min(120, Math.max(0, Math.abs(y) - step * 120));
        const before = await read();
        const expected = {
            x: Math.max(0, Math.min(before.maxX, before.x + deltaX)),
            y: Math.max(0, Math.min(before.maxY, before.y + deltaY))
        };
        await d.page.mouse.wheel(deltaX, deltaY);
        // Observe the actual native wheel destination; scrollend is not reliable in every engine.
        await expect
            .poll(async () => {
                const state = await read();
                return Math.max(Math.abs(state.x - expected.x), Math.abs(state.y - expected.y));
            })
            .toBeLessThan(0.01);
    }
    await d.page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
}

export const positioningScenarios = positioningCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = positioningConfig(name)!;
        const positioner = d.item('positioner');
        if (p.documentScroll) await wheel(d, 'document', 0, 120);
        await d.open('mouse');

        const record = async (phase: string, sticky = p.sticky, method = p.method ?? 'absolute') => {
            await expect(positioner).toHaveCSS('position', method);
            const anchor = (await d.trigger.boundingBox())!;
            const popup = (await d.popup.boundingBox())!;
            const boundary = (await d.item('boundary-inner').boundingBox())!;
            if (p.documentScroll) {
                await expect
                    .poll(async () => {
                        const measured = (await d.popup.boundingBox())!;
                        const trigger = (await d.trigger.boundingBox())!;
                        return Math.abs(measured.y - trigger.y - trigger.height - 4);
                    })
                    .toBeLessThan(1);
            } else if (phase !== 'initial' && phase !== 'anchor restored') {
                await expect(positioner).toHaveAttribute('data-anchor-hidden', '');
                const coordinate = p.horizontal ? popup.x : popup.y;
                const edge = p.horizontal ? boundary.x : boundary.y;
                if (sticky) expect(coordinate).toBeGreaterThanOrEqual(edge + 4);
                else expect(coordinate).toBeLessThan(edge - 20);
            }
            d.measurements.push({
                name: phase,
                bounds: {
                    anchor,
                    popup,
                    boundary,
                    arrow: p.arrow ? await d.item('arrow').boundingBox() : null,
                    scroll: await d.page.evaluate(() => ({ x: scrollX, y: scrollY })),
                    styles: await positioner.evaluate((node) => {
                        const style = getComputedStyle(node);
                        return { top: style.top, left: style.left, transform: style.transform };
                    })
                }
            });
            d.checkpoints.push({
                name: phase,
                state: {
                    method,
                    side: await positioner.getAttribute('data-side'),
                    x: Math.round(popup.x - anchor.x) + 0,
                    y: Math.round(popup.y - anchor.y) + 0,
                    width: Math.round(popup.width),
                    height: Math.round(popup.height),
                    anchorHidden: (await positioner.getAttribute('data-anchor-hidden')) === ''
                }
            });
            expect(d.errors).toEqual([]);
        };

        await record('initial');
        if (p.documentScroll) {
            await wheel(d, 'document', 0, 80);
            await record('document scrolled');
            if (p.switchMethod) {
                await d.page.keyboard.press('F3');
                await record('method switched', false, 'fixed');
            }
        } else {
            await wheel(d, 'inner', p.horizontal ? 320 : 0, p.horizontal ? 0 : 320);
            await record('anchor outside boundary');
            if (p.toggleSticky) {
                await d.page.keyboard.press('F3');
                await expect
                    .poll(async () => (await d.popup.boundingBox())!.y)
                    .toBeGreaterThanOrEqual((await d.item('boundary-inner').boundingBox())!.y + 4);
                await record('sticky enabled', true);
            }
            const amount = await d
                .item('boundary-inner')
                .evaluate((node, horizontal) => (horizontal ? node.scrollLeft : node.scrollTop), p.horizontal);
            await wheel(d, 'inner', p.horizontal ? -amount : 0, p.horizontal ? 0 : -amount);
            await expect(positioner).not.toHaveAttribute('data-anchor-hidden', '');
            await record('anchor restored', p.toggleSticky || p.sticky);
        }
        await d.item('alpha').click();
        await d.closed();
    }
}));
