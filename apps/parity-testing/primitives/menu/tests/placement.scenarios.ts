import { expect } from '@playwright/test';
import { placementCases, placementConfig } from '../src/placement';
import type { MenuDriver } from './driver';

export const placementScenarios = placementCases
    .filter((name) => !placementConfig(name)!.viewport)
    .map((name) => ({
        name,
        async run(d: MenuDriver) {
            const p = placementConfig(name)!;
            const rtl = name.endsWith('-rtl');
            let point: { x: number; y: number } | undefined;
            if (p.kind === 'context') {
                const box = (await d.trigger.boundingBox())!;
                point = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
                await d.page.mouse.click(point.x, point.y, { button: 'right' });
                await expect(d.popup).toBeVisible();
            } else await d.open();

            const record = async (phase: string, nested = false) => {
                const surface = nested ? d.subPopup : d.popup;
                const positioner = d.item(nested ? 'sub-positioner' : 'positioner');
                const anchor = (await (nested ? d.item('more') : d.trigger).boundingBox())!;
                const side = nested
                    ? p.override
                        ? 'top'
                        : p.fallback
                          ? 'bottom'
                          : 'inline-end'
                    : p.kind === 'bar' && (p.vertical || phase === 'orientation changed')
                      ? 'inline-end'
                      : 'bottom';
                const align = nested
                    ? p.override
                        ? 'end'
                        : 'start'
                    : (p.align ?? (p.kind === 'menu' ? 'center' : 'start'));
                await expect(positioner).toHaveAttribute('data-side', side);
                await expect(positioner).toHaveAttribute('data-align', align);
                await expect(positioner).toHaveCSS('position', p.kind === 'context' ? 'fixed' : 'absolute');
                // Wait for the geometry to follow the requested policy, including a retained orientation change.
                await expect
                    .poll(async () => {
                        const box = (await surface.boundingBox())!;
                        const physical = side === 'inline-end' ? (rtl ? 'left' : 'right') : side;
                        if (point && !nested)
                            return Math.abs(
                                box.y - point.y - (p.side || p.align === 'center' || p.offset === 0 ? 0 : -5)
                            );
                        if (physical === 'right') return Math.abs(box.x - anchor.x - anchor.width);
                        if (physical === 'left') return Math.abs(box.x + box.width - anchor.x);
                        if (physical === 'top') return Math.abs(box.y + box.height + (p.override ? 9 : 0) - anchor.y);
                        return Math.abs(box.y - anchor.y - anchor.height);
                    })
                    .toBeLessThan(1);
                const box = (await surface.boundingBox())!;
                const origin = (!nested && point) || anchor;
                const geometry = {
                    side,
                    align,
                    x: Math.round(box.x - origin.x),
                    y: Math.round(box.y - origin.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height)
                };
                d.measurements.push({ name: phase, bounds: { anchor, box, point } });
                d.checkpoints.push({ name: phase, state: geometry });
                expect(d.errors).toEqual([]);
            };
            await record('root placed');
            if (p.nested) {
                await d.openSub(rtl);
                await record('submenu placed', true);
            }
            if (p.switchOrientation) {
                await d.page.keyboard.press('F3');
                await record('orientation changed');
            }
        }
    }));
