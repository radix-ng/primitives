import { expect } from '@playwright/test';
import { cases } from '../src/contract';
import type { AccordionDriver } from './driver';
import { findInPage, searchNeedle } from './search-capability';

export const searchScenarios = Object.entries(cases)
    .filter(([, s]) => s.search)
    .map(([name, s]) => ({
        name,
        async run(d: AccordionDriver) {
            const { page } = d;
            // The paired runner creates both pages up front; search targets the active tab.
            await page.bringToFront();
            const panel = page.getByTestId('a-panel');
            const trigger = page.getByTestId('a-trigger');
            const duration = s.search!.motion === 'transition' ? 'transition-duration' : 'animation-duration';
            const refused = !!s.veto || (s.controlled && !s.acceptControlled);
            const read = () =>
                panel.evaluate(
                    (node: HTMLElement, duration) => ({
                        height: getComputedStyle(node).getPropertyValue('--accordion-panel-height').trim(),
                        width: getComputedStyle(node).getPropertyValue('--accordion-panel-width').trim(),
                        hidden: node.getAttribute('hidden'),
                        starting: node.hasAttribute('data-starting-style'),
                        ending: node.hasAttribute('data-ending-style'),
                        open: node.hasAttribute('data-open'),
                        running: node.getAnimations().some((animation) => animation.playState !== 'finished'),
                        duration: node.style.getPropertyValue(duration),
                        priority: node.style.getPropertyPriority(duration),
                        trace: window.accordionParity.trace
                    }),
                    duration
                );
            const checkpoint = async (name: string, expected: Record<string, unknown>, searchReveal = false) => {
                let state = await read();
                try {
                    await expect.poll(async () => (state = await read())).toMatchObject(expected);
                } finally {
                    d.measurements.push({ name, lastObserved: state, dom: await page.locator('body').innerHTML() });
                }
                // The pin can lose its one-shot suppression before committing in WebKit. Keep
                // raw style/motion evidence, compare settled phases, and require suppression on
                // Angular below. Authored style restoration is compared on every later close.
                const compared: Record<string, unknown> = { ...state };
                if (searchReveal) {
                    delete compared['duration'];
                    delete compared['priority'];
                }
                d.checkpoints.push({ name, state: compared });
                expect(d.errors).toEqual([]);
            };
            const settleReveal = async () => {
                await expect.poll(read).toMatchObject({ open: true, starting: false, ending: false });
                if (d.framework === 'angular') {
                    await expect
                        .poll(read)
                        .toMatchObject({ running: false, duration: '0s', height: 'auto', width: 'auto' });
                }
                d.measurements.push({ name: 'search motion before settling', state: await read() });
                // Apply the same action to both fixtures. The reference can still be animating
                // after beforematch, so finish it before comparing the settled selection/lifetime.
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
            };
            const frames = () =>
                page.evaluate(
                    () =>
                        new Promise<void>((resolve) =>
                            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                        )
                );
            const reveal = async (accepted: boolean) => {
                if (s.search!.source === 'event') {
                    const immediate = await panel.evaluate((node: HTMLElement) => {
                        node.dispatchEvent(new Event('beforematch', { bubbles: true }));
                        node.removeAttribute('hidden');
                        return node.getBoundingClientRect().height;
                    });
                    d.measurements.push({ name: 'same-task reveal geometry', height: immediate });
                    if (accepted && (d.framework === 'angular' || s.search!.motion === 'transition'))
                        expect(immediate).toBe(80);
                } else if (s.search!.source === 'find') {
                    expect(await findInPage(page, searchNeedle)).toBe(true);
                } else {
                    await page.evaluate(() => {
                        location.hash = '#a-match';
                    });
                }
                await frames();
                if (accepted && s.search!.source === 'find') {
                    await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe(searchNeedle);
                }
            };
            const openRequests = [
                {
                    part: 'a',
                    next: true,
                    reason: 'none',
                    type: 'beforematch',
                    target: 'a-panel',
                    shared: true
                },
                {
                    part: 'root',
                    next: ['a'],
                    reason: 'none',
                    type: 'beforematch',
                    target: 'a-panel',
                    shared: true
                }
            ];
            const close = async () => {
                await trigger.click();
                await expect(panel).toHaveAttribute('data-ending-style', '');
                await expect.poll(() => panel.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.pause()));
                await checkpoint('later close preserves authored motion', {
                    height: '80px',
                    width: '300px',
                    open: false,
                    ending: true,
                    running: true,
                    duration: '30s',
                    priority: 'important'
                });
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
                await checkpoint('close remains searchable', {
                    height: 'auto',
                    width: 'auto',
                    hidden: 'until-found',
                    open: false,
                    ending: false,
                    running: false,
                    duration: '30s',
                    priority: 'important'
                });
            };

            await panel.evaluate(
                (node: HTMLElement, duration) => node.style.setProperty(duration, '30s', 'important'),
                duration
            );
            // Base UI installs its native beforematch listener in a passive effect.
            await frames();
            await checkpoint('closed animated search panel', { hidden: 'until-found', open: false, trace: [] });
            const native = await panel.evaluateHandle((node: HTMLElement) => {
                const events: { trusted: boolean; hidden: string | null }[] = [];
                node.addEventListener('beforematch', (event) =>
                    events.push({ trusted: event.isTrusted, hidden: node.getAttribute('hidden') })
                );
                return events;
            });
            await reveal(!refused);
            if (refused) {
                await checkpoint('refused search restores hidden state', {
                    height: 'auto',
                    width: 'auto',
                    hidden: 'until-found',
                    starting: true,
                    ending: false,
                    open: false,
                    running: false,
                    duration: '30s',
                    priority: 'important',
                    trace: s.veto === 'item' ? openRequests.slice(0, 1) : openRequests
                });
                await page.getByTestId('allow').click();
            } else {
                await settleReveal();
                await checkpoint(
                    'settled search reveal',
                    {
                        height: 'auto',
                        width: 'auto',
                        hidden: null,
                        starting: false,
                        ending: false,
                        open: true,
                        running: false,
                        trace: openRequests
                    },
                    true
                );
                expect(await panel.evaluate((node: HTMLElement) => node.getBoundingClientRect().height)).toBe(80);
                if (s.search!.source !== 'event') {
                    const matchGeometry = () =>
                        page.locator('#a-match').evaluate((node) => {
                            const rect = node.getBoundingClientRect();
                            // Native fragment scrolling rounds offsets while DOMRect keeps
                            // fractional font/layout coordinates. Allow one CSS pixel at edges.
                            const roundingTolerance = 1;
                            return {
                                top: rect.top,
                                bottom: rect.bottom,
                                height: rect.height,
                                viewport: innerHeight,
                                scrollY,
                                fonts: document.fonts.status,
                                roundingTolerance,
                                inViewport:
                                    rect.top >= -roundingTolerance && rect.bottom <= innerHeight + roundingTolerance
                            };
                        });
                    let geometry = await matchGeometry();
                    const observeGeometry = async () => (geometry = await matchGeometry());
                    const nativeFind = s.search!.source === 'find';
                    try {
                        // The pin's opening keyframe can clip the fragment target during native
                        // measurement. Chromium can leave scrollY at zero even after beforematch.
                        if (d.framework === 'angular' || nativeFind || s.search!.motion === 'transition') {
                            await expect.poll(async () => (await observeGeometry()).scrollY).toBeGreaterThan(0);
                        }
                        if (d.framework === 'angular' || nativeFind) {
                            await expect.poll(async () => (await observeGeometry()).inViewport).toBe(true);
                        }
                    } finally {
                        d.measurements.push({ name: 'browser match geometry', state: geometry });
                    }
                    if (nativeFind) {
                        d.checkpoints.push({
                            name: 'browser match visibility',
                            state: { inViewport: geometry.inViewport }
                        });
                    }
                }
                await page.getByTestId('a-input').fill('edited');
                await close();
            }
            const events = await native.jsonValue();
            expect(events).toEqual([{ trusted: s.search!.source !== 'event', hidden: 'until-found' }]);
            d.checkpoints.push({ name: 'browser reveal event', state: { events } });

            // A refused search must not consume motion on the next accepted user request.
            // A successful search suppresses just that open cycle.
            await trigger.click();
            await expect.poll(() => panel.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
            await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.pause()));
            await checkpoint('ordinary opening still animates', {
                height: '80px',
                width: '300px',
                hidden: null,
                starting: false,
                ending: false,
                open: true,
                running: true,
                duration: '30s',
                priority: 'important'
            });
            await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
            await checkpoint('ordinary opening completes', { height: 'auto', width: 'auto', running: false });
            if (refused) await page.getByTestId('a-input').fill('edited');
            await close();

            // Exercise a second reveal after keyframe motion type discovery and native edits.
            await page.evaluate(() => {
                window.accordionParity.trace = [];
                location.hash = '';
            });
            await reveal(true);
            await settleReveal();
            await checkpoint(
                'repeated search preserves native state',
                {
                    height: 'auto',
                    width: 'auto',
                    hidden: null,
                    starting: false,
                    ending: false,
                    open: true,
                    running: false,
                    trace: openRequests
                },
                true
            );
            await expect(page.getByTestId('a-input')).toHaveValue('edited');
            await expect(page.getByTestId('b-panel')).toHaveAttribute('hidden', 'until-found');
        }
    }));
