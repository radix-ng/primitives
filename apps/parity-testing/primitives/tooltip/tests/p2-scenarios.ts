import { expect } from '@playwright/test';
import type { TooltipDriver } from './tooltip.parity.spec';

const popupSelector = '[data-identity-popup]';
const positionerSelector = '[data-identity-positioner]';

async function checkpoint<T>(driver: TooltipDriver, name: string, read: () => Promise<T>, expected: T): Promise<void> {
    await expect.poll(read, name).toEqual(expected);
    driver.checkpoints.push({ name, state: await read() });
}

function resizeScenario(side: 'top' | 'left') {
    return {
        name: `identity-${side}-resize`,
        async run(driver: TooltipDriver) {
            await driver.page.addStyleTag({
                content: `
                    [data-identity-triggers] {
                        flex-direction: ${side === 'top' ? 'row' : 'column'};
                        align-items: flex-start; gap: 60px !important; margin: 180px 0 0 350px !important;
                    }
                    [data-identity-positioner] {
                        width: var(--positioner-width, max-content);
                        height: var(--positioner-height, auto);
                        transition: top 350ms, left 350ms, right 350ms, bottom 350ms;
                    }
                    [data-identity-popup] {
                        width: var(--popup-width, auto); height: var(--popup-height, auto);
                        max-width: 160px; box-sizing: border-box; padding: 4px 8px; font: 16px monospace;
                        transition: width 350ms, height 350ms;
                    }`
            });
            const anchor = () =>
                driver.page.locator(positionerSelector).evaluate((positioner, side) => {
                    const popup = positioner.querySelector('[data-identity-popup]')!;
                    const trigger = document.querySelector('[data-identity-triggers] [data-popup-open]')!;
                    const popupBounds = popup.getBoundingClientRect();
                    const triggerBounds = trigger.getBoundingClientRect();
                    return {
                        side: positioner.getAttribute('data-side'),
                        resizing: popup.getAnimations().some((animation) => animation instanceof CSSTransition),
                        anchored:
                            Math.abs(
                                side === 'top'
                                    ? popupBounds.bottom - triggerBounds.top
                                    : popupBounds.right - triggerBounds.left
                            ) < 3
                    };
                }, side);

            await driver.set('Open Copy via handle');
            await checkpoint(driver, 'first popup reaches the trigger edge', anchor, {
                side,
                anchored: true,
                resizing: false
            });
            const popup = driver.page.locator(popupSelector);
            const before = (await popup.boundingBox())!;
            await driver.set('Update Paste payload');
            await driver.set('Use Paste trigger');
            await expect(popup).toHaveText(/Updated Paste payload/);
            await checkpoint(driver, 'popup stays anchored while resizing', anchor, {
                side,
                anchored: true,
                resizing: true
            });
            await checkpoint(
                driver,
                'popup settles at the new size',
                () =>
                    popup.evaluate((node, before) => {
                        const bounds = node.getBoundingClientRect();
                        return (
                            !node.getAnimations().length &&
                            (bounds.width > before.width + 5 || bounds.height > before.height + 5)
                        );
                    }, before),
                true
            );
            await checkpoint(driver, 'resized popup reaches the new trigger edge', anchor, {
                side,
                anchored: true,
                resizing: false
            });
        }
    };
}

export const p2Scenarios = [
    {
        name: 'identity-lifecycle',
        async run(driver: TooltipDriver) {
            const read = () =>
                driver.page.evaluate(() => {
                    const node = document.querySelector<HTMLElement>('[data-identity-positioner]');
                    return {
                        mounted: !!node,
                        hidden: node?.hidden ?? null,
                        open: node?.hasAttribute('data-open') ?? false,
                        sameNode: node?.hasAttribute('data-test-retained') ?? false,
                        completions: JSON.parse(document.querySelector('[data-identity-completions]')!.textContent)
                    };
                });
            const closed = { mounted: true, hidden: true, open: false, sameNode: true };
            const open = { ...closed, hidden: false, open: true };
            await driver.page
                .locator(positionerSelector)
                .evaluate((node) => node.setAttribute('data-test-retained', ''));
            await checkpoint(driver, 'closed portal is retained and hidden', read, { ...closed, completions: [] });
            await driver.set('Open Copy via handle');
            await checkpoint(driver, 'opening completes once', read, { ...open, completions: [true] });
            await driver.set('Cancel next close');
            await driver.set('Close via handle');
            await checkpoint(driver, 'a canceled close leaves the current popup open', read, {
                ...open,
                completions: [true]
            });
            await driver.set('Hold next close');
            await driver.set('Close via handle');
            await checkpoint(driver, 'a held close has no completion', read, {
                ...closed,
                hidden: false,
                completions: [true]
            });
            await driver.set('Finish close');
            await checkpoint(driver, 'unmount completes the held close', read, {
                ...closed,
                completions: [true, false]
            });
            await driver.set('Open Copy via handle');
            await checkpoint(driver, 'reopening reuses the retained node', read, {
                ...open,
                completions: [true, false, true]
            });
            await driver.page.addStyleTag({
                content: `
                @keyframes tooltip-exit { from { opacity: 1; } to { opacity: 0; } }
                [data-identity-popup][data-ending-style] { animation: tooltip-exit 10s linear paused; }`
            });
            await driver.set('Close via handle');
            const popup = driver.page.locator(popupSelector);
            await expect.poll(() => popup.evaluate((node) => node.getAnimations().length)).toBe(1);
            await checkpoint(driver, 'completion waits for popup exit motion', read, {
                ...closed,
                hidden: false,
                completions: [true, false, true]
            });
            await popup.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
            await checkpoint(driver, 'normal close completes', read, {
                ...closed,
                completions: [true, false, true, false]
            });
            await driver.set('Remove retention');
            await checkpoint(driver, 'disabling retention removes the closed portal', read, {
                mounted: false,
                hidden: null,
                open: false,
                sameNode: false,
                completions: [true, false, true, false]
            });
        }
    },
    resizeScenario('top'),
    resizeScenario('left'),
    {
        name: 'identity-arrow',
        async run(driver: TooltipDriver) {
            await driver.page.addStyleTag({
                content: `
                    #copy-format { position: fixed; left: 0; top: 120px; width: 12px; padding: 0; }
                    [data-identity-triggers] { margin: 120px 140px !important; }
                    [data-identity-popup] { min-width: 150px; padding: 8px; }
                    [data-identity-arrow] { width: 12px; height: 6px; }`
            });
            const read = () =>
                driver.page.locator('[data-identity-arrow]').evaluate((arrow) => {
                    const bounds = arrow.getBoundingClientRect();
                    const popup = arrow.closest('[data-identity-popup]')!.getBoundingClientRect();
                    const trigger = document
                        .querySelector('[data-identity-triggers] [data-popup-open]')!
                        .getBoundingClientRect();
                    const center = bounds.left + bounds.width / 2;
                    return {
                        uncentered: arrow.hasAttribute('data-uncentered'),
                        centered: Math.abs(center - trigger.left - trigger.width / 2) < 2,
                        fits: bounds.left >= popup.left && bounds.right <= popup.right
                    };
                });
            await driver.set('Open Copy via handle');
            await checkpoint(driver, 'collision keeps the uncentered arrow inside the popup', read, {
                uncentered: true,
                centered: false,
                fits: true
            });
            await driver.set('Open Paste via handle');
            await checkpoint(driver, 'arrow centers again when the collision clears', read, {
                uncentered: false,
                centered: true,
                fits: true
            });
        }
    },
    {
        name: 'identity-pointer',
        async run(driver: TooltipDriver) {
            await driver.page.addStyleTag({
                content: `
                    [data-identity-triggers] { margin-left: 180px !important; }
                    [data-identity-popup] { min-width: 140px; padding: 12px; }`
            });
            const popup = driver.page.locator(popupSelector);
            const read = () =>
                driver.page.evaluate(() => {
                    const positioner = document.querySelector('[data-identity-positioner]');
                    return {
                        open: positioner?.hasAttribute('data-open') ?? false,
                        hoverable:
                            !!positioner &&
                            !positioner.hasAttribute('inert') &&
                            getComputedStyle(positioner).pointerEvents !== 'none'
                    };
                });
            const open = { open: true, hoverable: true };
            const passThrough = { open: true, hoverable: false };
            const closed = { open: false, hoverable: false };
            await driver.move('Copy');
            await checkpoint(driver, 'hover opens an interactive popup', read, open);
            const bounds = (await popup.boundingBox())!;
            await driver.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { steps: 5 });
            await driver.page.waitForTimeout(300);
            await checkpoint(driver, 'crossing the gap keeps the popup open', read, open);
            const trigger = (await driver.trigger.boundingBox())!;
            await driver.page.mouse.move(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2, { steps: 5 });
            await driver.page.waitForTimeout(300);
            await checkpoint(driver, 'returning across the gap keeps the popup open', read, open);
            await driver.move();
            await checkpoint(driver, 'leaving the safe area closes the popup', read, closed);

            const point = { x: trigger.x + trigger.width - 4, y: trigger.y + 3 };
            const tracked = (axis: 'x' | 'y' | 'both') =>
                popup.evaluate(
                    (node, { trigger, point, axis }) => {
                        const bounds = node.getBoundingClientRect();
                        const x = axis === 'y' ? trigger.x + trigger.width / 2 : point.x;
                        const y = axis === 'x' ? trigger.y + trigger.height : point.y;
                        return Math.abs(bounds.left + bounds.width / 2 - x) < 2 && Math.abs(bounds.top - y - 24) < 2;
                    },
                    { trigger, point, axis }
                );
            await driver.set('Track X');
            await driver.page.mouse.move(point.x, point.y);
            await checkpoint(driver, 'horizontal tracking allows popup hover', read, open);
            await checkpoint(driver, 'horizontal tracking preserves the vertical anchor', () => tracked('x'), true);
            await driver.set('Track Y');
            await driver.page.mouse.move(point.x - 2, point.y + 2);
            point.x -= 2;
            point.y += 2;
            await checkpoint(driver, 'vertical tracking allows popup hover', read, open);
            await checkpoint(driver, 'vertical tracking preserves the horizontal anchor', () => tracked('y'), true);
            await driver.set('Track both');
            await driver.page.mouse.move(point.x + 2, point.y + 2);
            point.x += 2;
            point.y += 2;
            await checkpoint(driver, 'tracking both axes lets the pointer pass through', read, passThrough);
            await checkpoint(driver, 'both axes follow the same pointer movement', () => tracked('both'), true);
            await driver.set('Stop tracking');
            await checkpoint(driver, 'stopping cursor tracking restores hover', read, open);
            await driver.set('Close via handle');
            await checkpoint(driver, 'handle closes the pointer-through test popup', read, closed);
            await driver.set('Disable popup hover');
            await driver.move();
            await driver.move('Copy');
            await checkpoint(driver, 'disabling popup hover lets the pointer pass through', read, passThrough);
            await driver.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { steps: 5 });
            await checkpoint(driver, 'crossing the gap closes when popup hover is disabled', read, closed);
        }
    }
];
