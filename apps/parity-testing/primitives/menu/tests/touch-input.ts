import { expect, type Locator } from '@playwright/test';
import type { MenuDriver } from './driver';

export async function tap(d: MenuDriver, target: Locator) {
    const box = (await target.boundingBox())!;
    await d.page.touchscreen.tap(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
}
export async function open(d: MenuDriver) {
    await tap(d, d.trigger);
    await expect(d.popup).toBeVisible();
    await expect.poll(() => d.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(true);
}

export async function assertTrustedTouch(d: MenuDriver, options: { nativeCallbacks?: boolean } = {}) {
    const events = await d.page.evaluate(() => window.menuParity.inputEvents);
    expect(events.some((event) => event.type === 'touchstart' && event.trusted)).toBe(true);
    expect(events.every((event) => event.trusted)).toBe(true);
    if (options.nativeCallbacks !== false)
        expect((await d.page.evaluate(() => window.menuParity.nativeEvents)).every((event) => event.trusted)).toBe(
            true
        );
    return events;
}
