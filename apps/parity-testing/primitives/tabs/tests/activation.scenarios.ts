import { expect } from '@playwright/test';
import { activationCases } from '../src/activation';
import type { TabsDriver } from './driver';

export const activationScenarios = (Object.keys(activationCases) as (keyof typeof activationCases)[]).map((name) => ({
    name,
    async run(d: TabsDriver) {
        const p = activationCases[name].activation!;
        const target = d.page.getByTestId('tab-1');
        await d.page.getByTestId('before').focus();
        await d.page.keyboard.press('Tab');
        await expect(d.page.getByTestId('tab-0')).toBeFocused();
        if (!p.click && !p.secondary) {
            await d.page.keyboard.press('ArrowRight');
            await expect(target).toBeFocused();
        }
        const zero = { selected: ['tab-0'], callbacks: [], hash: '', scrolled: false };
        const key = p.key ?? 'Enter';
        const request = (canceled = false, type = 'click') =>
            expect.objectContaining({
                value: 'one',
                reason: 'none',
                direction: 'right',
                canceled,
                type,
                trusted: type === 'focusin' || (key === 'Enter' && (p.host === 'button' || p.host === 'link')),
                target: 'tab-1',
                shift: !!p.modified,
                ctrl: !!p.modified,
                alt: false,
                meta: false
            });
        if (p.secondary) {
            const box = (await target.boundingBox())!;
            await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await d.page.mouse.down({ button: p.secondary });
            // Browsers differ in whether a secondary press focuses a button; exercise the actual
            // focus event while the native press is held, then native keyboard focus after release.
            await target.focus();
            await d.activationCheckpoint('secondary press does not activate', { ...zero, focus: 'tab-1' });
            await d.page.mouse.up({ button: p.secondary });
            await expect
                .poll(() =>
                    d.page.evaluate(() =>
                        window.tabsActivation.timeline.some(
                            (event) => event.type === 'pointerup' && event.phase === 'bubble'
                        )
                    )
                )
                .toBe(true);
            await d.page.keyboard.press('ArrowLeft');
            await d.page.keyboard.press('ArrowRight');
            await d.activationCheckpoint('focus activates after release', {
                selected: ['tab-1'],
                callbacks: [request(false, 'focusin')],
                focus: 'tab-1',
                clicks: 0,
                scrolled: false
            });
            return;
        }
        if (p.click) {
            const box = (await target.boundingBox())!;
            await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await d.activationCheckpoint('disabled pointer activation', { ...zero, focus: 'tab-0', tabStops: [0, -1] });
            return;
        }
        if (p.descendant) {
            await d.page.getByTestId('child').press(key);
            await d.activationCheckpoint('descendant key keeps native defaults', {
                ...zero,
                focus: 'child',
                scrolled: key === 'Space'
            });
            return;
        }
        if (p.repeat) {
            await d.page.keyboard.down(key);
            await d.page.keyboard.down(key);
            await d.page.keyboard.down(key);
            const nativeLink = p.host === 'link' && key === 'Enter';
            const held = await d.activationCheckpoint('held key requests once per keydown', {
                selected: ['tab-0'],
                callbacks: nativeLink
                    ? expect.arrayContaining([request(true)])
                    : [request(true), request(true), request(true)],
                clicks: nativeLink ? expect.any(Number) : 3,
                scrolled: false
            });
            for (const callback of held.callbacks) expect(callback).toEqual(request(true));
            await d.page.keyboard.up(key);
            await d.activationCheckpoint('keyup does not duplicate activation', {
                selected: ['tab-0'],
                callbacks: held.callbacks,
                clicks: held.clicks,
                scrolled: false
            });
            return;
        }
        await d.page.keyboard.press(`${p.modified ? 'Control+Shift+' : ''}${key}`);
        if (p.disabled || p.prevent) {
            await d.activationCheckpoint('blocked activation', {
                ...zero,
                scrolled: false
            });
            return;
        }
        if (p.cancel) {
            await d.activationCheckpoint('first request canceled', {
                selected: ['tab-0'],
                callbacks: [request(true)],
                clicks: 1,
                scrolled: false
            });
            await d.page.keyboard.press(key);
            await d.activationCheckpoint('next physical request accepted', {
                selected: ['tab-1'],
                callbacks: [request(true), request()],
                clicks: 2,
                scrolled: false
            });
            return;
        }
        await d.activationCheckpoint('native request accepted', {
            selected: ['tab-1'],
            callbacks: [request()],
            clicks: 1,
            scrolled: false
        });
        await d.page.keyboard.press(key);
        await d.activationCheckpoint('selected tab does not request again', {
            selected: ['tab-1'],
            callbacks: [request()],
            clicks: 2,
            scrolled: false
        });
    }
}));
