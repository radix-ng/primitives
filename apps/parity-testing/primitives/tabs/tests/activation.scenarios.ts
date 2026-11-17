import { expect, type Page } from '@playwright/test';
import { touchGesture } from '../../../../../tools/playwright/touch';
import { activationCases, type ActivationSettings } from '../src/activation';
import type { TabsDriver } from './driver';

async function formActivation(d: TabsDriver, p: ActivationSettings) {
    await d.page.getByTestId('form-input').fill('edited');
    await d.page.getByTestId('before').focus();
    await d.page.keyboard.press('Tab');
    const target = d.page.getByTestId('tab-1');
    if (p.click) {
        const box = (await target.boundingBox())!;
        await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
        await d.page.keyboard.press('ArrowRight');
        await expect(target).toBeFocused();
        await d.page.keyboard.press(p.key!);
    }
    await d.activationCheckpoint('authored button type preserves native form action', {
        selected: [p.disabled || p.cancel ? 'tab-0' : 'tab-1'],
        callbacks: p.disabled
            ? []
            : [
                  expect.objectContaining({
                      value: 'one',
                      reason: 'none',
                      direction: 'right',
                      canceled: !!p.cancel,
                      type: 'click',
                      trusted: p.click || p.key === 'Enter'
                  })
              ],
        submits: !p.disabled && p.buttonType === 'submit' ? 1 : 0,
        resets: !p.disabled && p.buttonType === 'reset' ? 1 : 0,
        formValue: !p.disabled && p.buttonType === 'reset' ? 'initial' : 'edited',
        host: expect.objectContaining({ type: p.buttonType, disabled: false }),
        scrolled: false
    });
}

async function gestureActivation(d: TabsDriver, p: ActivationSettings) {
    const target = d.page.getByTestId('tab-1');
    await d.page.getByTestId('before').focus();
    await d.page.keyboard.press('Tab');
    const zero = { selected: ['tab-0'], callbacks: [], hash: '', submits: 0, scrolled: false };
    if (p.gesture!.endsWith('link')) {
        const pages: Page[] = [];
        const observe = (page: Page) => pages.push(page);
        d.page.context().on('page', observe);
        // The pin suppresses primary activation while disabled, but leaves native middle-click
        // navigation to the browser. Observe that policy independently from selection.
        const opens = !p.disabled || p.gesture === 'middle-link';
        const popup = opens ? d.page.context().waitForEvent('page') : undefined;
        await target.click(
            p.gesture === 'middle-link'
                ? { button: 'middle', force: true }
                : { modifiers: ['ControlOrMeta'], force: true }
        );
        let openedHash: string | null = null;
        let openedUrl: string | null = null;
        if (popup) {
            const opened = await popup;
            await opened.waitForURL('**#activated');
            openedUrl = opened.url();
            openedHash = new URL(openedUrl).hash;
            await opened.close();
        }
        const state = await d.activationCheckpoint('auxiliary link follows its native destination', {
            selected: [!p.disabled && p.gesture === 'modified-link' ? 'tab-1' : 'tab-0'],
            callbacks:
                !p.disabled && p.gesture === 'modified-link'
                    ? [
                          expect.objectContaining({
                              value: 'one',
                              type: expect.stringMatching(/^(click|focusin)$/),
                              trusted: true
                          })
                      ]
                    : [],
            hash: '',
            scrolled: false
        });
        d.page.context().off('page', observe);
        expect(pages).toHaveLength(opens ? 1 : 0);
        // Observe the native new browsing context; never replace link activation with window.open.
        d.checkpoints.push({ name: 'native destination', state: { openedHash } });
        d.measurements.push({
            name: 'native destination',
            dom: await target.evaluate((element) => element.outerHTML),
            focus: state.focus,
            frames: { openedUrl }
        });
        expect(openedHash).toBe(opens ? '#activated' : null);
        expect(state.timeline).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ phase: 'capture', type: 'pointerdown', trusted: true, pointerType: 'mouse' })
            ])
        );
        return;
    }
    if (p.gesture!.startsWith('remove-')) {
        const button = p.gesture === 'remove-right' ? 'right' : 'middle';
        const box = (await target.boundingBox())!;
        await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await d.page.mouse.down({ button });
        await target.focus();
        await d.activationCheckpoint('held secondary press keeps selection', { ...zero, focus: 'tab-1' });
        await d.page.keyboard.press('F2');
        await expect(target).toHaveCount(0);
        await d.page.mouse.up({ button });
        await d.page.keyboard.press('F3');
        await expect(target).toBeVisible();
        await d.activationCheckpoint('replacement does not inherit a held press', zero);
        await d.page.getByTestId('tab-0').focus();
        await d.page.keyboard.press('ArrowRight');
        await d.activationCheckpoint('native focus activates the replacement', {
            selected: ['tab-1'],
            focus: 'tab-1',
            hash: '',
            clicks: 0,
            callbacks: [expect.objectContaining({ value: 'one', type: 'focusin', trusted: true })]
        });
        return;
    }
    if (p.gesture === 'touch-cancel') {
        await touchGesture(d.page, target, 'cancel');
        const state = await d.activationCheckpoint('native touch cancellation does not click', { ...zero, clicks: 0 });
        expect(state.timeline).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ phase: 'bubble', type: 'pointercancel', pointerType: 'touch', trusted: true })
            ])
        );
        await d.page.getByTestId('tab-0').focus();
        await d.page.keyboard.press('ArrowRight');
        if (!p.automatic) await d.page.keyboard.press('Enter');
        await d.activationCheckpoint('activation remains available after cancellation', {
            selected: ['tab-1'],
            focus: 'tab-1',
            callbacks: [
                expect.objectContaining({ value: 'one', type: p.automatic ? 'focusin' : 'click', trusted: true })
            ]
        });
        return;
    }
    const box = (await target.boundingBox())!;
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    if (p.gesture === 'touch-tap') await d.page.touchscreen.tap(point.x, point.y);
    else {
        const session = await d.page.context().newCDPSession(d.page);
        try {
            await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point, pointerType: 'pen' });
            await session.send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                ...point,
                pointerType: 'pen',
                button: 'left',
                buttons: 1,
                clickCount: 1
            });
            await session.send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                ...point,
                pointerType: 'pen',
                button: 'left',
                buttons: 0,
                clickCount: 1
            });
        } finally {
            await session.detach();
        }
    }
    const state = await d.activationCheckpoint('native pointer tap preserves selection and event metadata', {
        selected: [p.disabled ? 'tab-0' : 'tab-1'],
        callbacks: p.disabled
            ? []
            : [
                  expect.objectContaining({
                      value: 'one',
                      reason: 'none',
                      direction: 'right',
                      canceled: false,
                      type: expect.stringMatching(/^(click|focusin)$/),
                      trusted: true
                  })
              ],
        clicks:
            p.disabled && p.gesture === 'touch-tap' && d.page.context().browser()!.browserType().name() === 'webkit'
                ? 0
                : 1,
        hash: '',
        scrolled: false
    });
    expect(state.timeline).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                phase: 'capture',
                type: 'pointerdown',
                trusted: true,
                pointerType: p.gesture === 'touch-tap' ? 'touch' : 'pen'
            })
        ])
    );
}

export const activationScenarios = (Object.keys(activationCases) as (keyof typeof activationCases)[]).map((name) => ({
    name,
    async run(d: TabsDriver) {
        const p = activationCases[name].activation!;
        if (p.buttonType) return formActivation(d, p);
        if (p.gesture) return gestureActivation(d, p);
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
