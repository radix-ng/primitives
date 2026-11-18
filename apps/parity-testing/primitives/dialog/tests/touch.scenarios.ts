import { expect } from '@playwright/test';
import { touchGesture } from '../../../../../tools/playwright/touch';
import type { CaseName } from '../src/contract';
import type { DialogDriver } from './driver';

type Scenario = { name: CaseName; run(driver: DialogDriver): Promise<void> };

const triggerPress = { open: true, reason: 'trigger-press', trigger: 'primary', canceled: false };
const closePress = { ...triggerPress, open: false, reason: 'close-press' };
const outsidePress = { ...triggerPress, open: false, reason: 'outside-press' };
const dismissed = { open: false, visible: false, mounted: false, completions: [true, false] };

async function openByTap(d: DialogDriver, focus = 'popup') {
    await d.tap('primary');
    await d.opened(focus);
}

async function nativeTouchEvents(d: DialogDriver) {
    const events = await d.page.evaluate(() => window.dialogParity.touchEvents);
    expect(events.some(({ type, pointerType }) => type === 'pointerdown' && pointerType === 'touch')).toBe(true);
    expect(events.some(({ type }) => type === 'touchstart')).toBe(true);
    expect(events.every(({ trusted }) => trusted)).toBe(true);
    expect(await d.page.evaluate(() => window.dialogParity.nativeEvents.every(({ trusted }) => trusted))).toBe(true);
    return events;
}

const outsideTaps = [
    'touch-outside-modal',
    'touch-outside-internal-backdrop',
    'touch-outside-nonmodal',
    'touch-outside-trap-focus'
] as const;

export const touchScenarios: Scenario[] = [
    {
        name: 'touch-default-focus',
        async run(d) {
            await openByTap(d);
            await d.checkpoint('default tap focuses the popup', {
                open: true,
                focus: 'popup',
                changes: [triggerPress]
            });
            await d.tap('close');
            await d.closed();
            await d.checkpoint('touch Close restores the opener', {
                ...dismissed,
                focus: 'primary',
                changes: [triggerPress, closePress]
            });
            await nativeTouchEvents(d);
        }
    },
    {
        name: 'touch-focus-policy',
        async run(d) {
            await openByTap(d, 'field');
            const initial = { phase: 'initial', interaction: 'touch' } as const;
            await d.checkpoint('explicit true selects the first tabbable control on touch', {
                open: true,
                focus: 'field',
                focusPolicies: [initial]
            });
            await d.tap('close');
            await d.closed();
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            const events = await nativeTouchEvents(d);
            expect(events).toContainEqual(
                expect.objectContaining({ type: 'pointerdown', pointerType: 'touch', target: 'close' })
            );
            const closeClick = events.find(({ type, target }) => type === 'click' && target === 'close');
            expect(closeClick).toBeDefined();
            const interaction = closeClick?.pointerType ?? 'mouse';
            expect(['touch', 'mouse']).toContain(interaction);
            await d.checkpoint('final policy reflects the trusted close click', {
                ...dismissed,
                focus: 'final-target',
                focusPolicies: [initial, { phase: 'final', interaction }],
                changes: [triggerPress, closePress]
            });
        }
    },
    ...outsideTaps.map(
        (name): Scenario => ({
            name,
            async run(d) {
                await openByTap(d);
                const modal = name === 'touch-outside-modal' || name === 'touch-outside-internal-backdrop';
                await d.checkpoint('open before outside tap', {
                    open: true,
                    focus: 'popup',
                    scrollLocked: modal,
                    changes: [triggerPress]
                });
                await d.tap('outside');
                await d.closed();
                await d.checkpoint('outside tap dismisses once', {
                    ...dismissed,
                    backgroundIsolated: false,
                    scrollLocked: false,
                    activations: modal ? 0 : 1,
                    changes: [triggerPress, outsidePress]
                });
                await nativeTouchEvents(d);
            }
        })
    ),
    {
        name: 'touch-dismissal-disabled',
        async run(d) {
            await openByTap(d);
            await d.tap('outside');
            await d.checkpoint('outside activation can leave the dialog open', {
                open: true,
                activations: 1,
                backgroundIsolated: true,
                scrollLocked: false,
                changes: [triggerPress],
                completions: [true]
            });
            await d.tap('close');
            await d.closed();
            await d.checkpoint('Close still accepts a tap', { ...dismissed, changes: [triggerPress, closePress] });
            await nativeTouchEvents(d);
        }
    },
    {
        name: 'touch-pan-popup',
        async run(d) {
            await openByTap(d);
            const scroll = d.page.getByTestId('popup-scroll');
            await touchGesture(d.page, scroll, 'pan');
            await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
            await d.checkpoint('native pan scrolls the popup and keeps it open', {
                open: true,
                activations: 0,
                changes: [triggerPress],
                completions: [true]
            });
            const events = await nativeTouchEvents(d);
            expect(events.some(({ type }) => type === 'pointercancel')).toBe(true);
        }
    },
    ...(['touch-pan-outside-nonmodal', 'touch-pan-outside-modal'] as const).map(
        (name): Scenario => ({
            name,
            async run(d) {
                await openByTap(d);
                await touchGesture(d.page, { x: 24, y: 380 }, 'pan');
                if (name === 'touch-pan-outside-nonmodal') {
                    await expect.poll(() => d.page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
                    await d.closed();
                    await d.checkpoint('outside scroll dismisses the non-modal dialog', {
                        ...dismissed,
                        activations: 0,
                        changes: [triggerPress, outsidePress]
                    });
                } else {
                    await d.checkpoint('outside pan leaves the modal open', {
                        open: true,
                        activations: 0,
                        scrollLocked: true,
                        changes: [triggerPress]
                    });
                    expect(await d.page.evaluate(() => window.scrollY)).toBe(0);
                }
                const events = await nativeTouchEvents(d);
                expect(events.some(({ type }) => type === 'touchmove')).toBe(true);
            }
        })
    ),
    {
        name: 'touch-cancel-outside',
        async run(d) {
            await openByTap(d);
            await touchGesture(d.page, d.page.getByTestId('outside'), 'cancel');
            await d.checkpoint('canceled contact leaves the dialog open', {
                open: true,
                activations: 0,
                changes: [triggerPress]
            });
            expect((await nativeTouchEvents(d)).some(({ type }) => type === 'touchcancel')).toBe(true);
            await d.tap('outside');
            await d.closed();
            await d.checkpoint('next completed tap can dismiss', {
                ...dismissed,
                activations: 1,
                changes: [triggerPress, outsidePress]
            });
        }
    },
    {
        name: 'touch-multitouch-outside',
        async run(d) {
            await openByTap(d);
            const { x, y } = await d.pointAt('outside-surface');
            const points = [
                { x: x - 6, y, id: 1 },
                { x: x + 6, y, id: 2 }
            ];
            const session = await d.page.context().newCDPSession(d.page);
            try {
                await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
                for (const movement of [8, 20]) {
                    const start = await d.page.evaluate(() => window.dialogParity.touchEvents.length);
                    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
                    await session.send('Input.dispatchTouchEvent', {
                        type: 'touchMove',
                        touchPoints: points.map((point) => ({ ...point, y: point.y + movement }))
                    });
                    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                    const events = (await nativeTouchEvents(d)).slice(start);
                    expect(events.some(({ type, touches }) => type === 'touchmove' && touches === 2)).toBe(true);
                    expect(events).toContainEqual(
                        expect.objectContaining({ type: 'touchend', touches: 1, changedTouches: 1 })
                    );
                    await d.checkpoint(`two contacts stay open after moving ${movement}px`, {
                        open: true,
                        activations: 0,
                        changes: [triggerPress],
                        completions: [true]
                    });
                }
            } finally {
                await session.detach();
            }
            await d.tap('outside');
            await d.closed();
            await d.checkpoint('a fresh single touch dismisses', {
                ...dismissed,
                activations: 1,
                changes: [triggerPress, outsidePress]
            });
        }
    }
];
