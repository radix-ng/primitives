import { expect } from '@playwright/test';
import { cases } from '../src/contract';
import type { AccordionDriver } from './driver';
export const motionScenarios = Object.entries(cases)
    .filter(([, s]) => s.motion)
    .map(([name, s]) => ({
        name,
        async run(d: AccordionDriver) {
            const { page } = d;
            const panel = page.getByTestId('a-panel');
            const read = () =>
                panel.evaluate((node: HTMLElement) => {
                    const css = getComputedStyle(node);
                    return {
                        height: css.getPropertyValue('--accordion-panel-height').trim(),
                        width: css.getPropertyValue('--accordion-panel-width').trim(),
                        starting: node.hasAttribute('data-starting-style'),
                        ending: node.hasAttribute('data-ending-style'),
                        hidden: node.getAttribute('hidden'),
                        open: node.hasAttribute('data-open'),
                        running: node.getAnimations().some((animation) => animation.playState !== 'finished')
                    };
                });
            const checkpoint = async (name: string, expected: Record<string, unknown>) => {
                // Retain the exact snapshot accepted by the phase assertion. A second read could
                // cross a starting-style frame during rapid reopen.
                let state = await read();
                await expect
                    .poll(async () => {
                        state = await read();
                        return state;
                    })
                    .toMatchObject({ starting: false, ...expected });
                d.checkpoints.push({ name, state });
                d.measurements.push({
                    name,
                    dom: await page.locator('body').innerHTML(),
                    layout: await panel.evaluate((node: HTMLElement) => ({
                        scrollHeight: node.scrollHeight,
                        scrollWidth: node.scrollWidth,
                        rect: node.getBoundingClientRect().toJSON()
                    }))
                });
                expect(d.errors).toEqual([]);
            };
            const pause = async () => {
                await expect.poll(() => panel.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.pause()));
            };
            const finish = async () => {
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
                await checkpoint('settled open sizes', {
                    height: 'auto',
                    width: 'auto',
                    starting: false,
                    ending: false,
                    open: true,
                    running: false
                });
            };
            if (s.motion === 'initial') {
                await checkpoint('initial open has no keyframe motion', {
                    height: 'auto',
                    width: 'auto',
                    running: false,
                    open: true,
                    starting: false
                });
            }
            if (s.motion === 'search') {
                await panel.evaluate((node: HTMLElement) =>
                    node.style.setProperty('transition-duration', '800ms', 'important')
                );
                const immediate = await panel.evaluate(async (node: HTMLElement) => {
                    node.dispatchEvent(new Event('beforematch', { bubbles: true }));
                    node.removeAttribute('hidden');
                    const height = node.getBoundingClientRect().height;
                    await new Promise<void>((resolve) =>
                        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                    );
                    return {
                        height,
                        running: node.getAnimations().some((animation) => animation.playState !== 'finished')
                    };
                });
                expect(immediate).toEqual({ height: 80, running: false });
                d.checkpoints.push({ name: 'same-task search geometry', state: immediate });
                await checkpoint('search reveals immediately', {
                    height: 'auto',
                    width: 'auto',
                    running: false,
                    starting: false,
                    open: true
                });
                await page.getByTestId('a-trigger').click();
                await expect(panel).toHaveAttribute('data-ending-style', '');
                await pause();
                expect(
                    await panel.evaluate((node: HTMLElement) => node.style.getPropertyPriority('transition-duration'))
                ).toBe('important');
                await checkpoint('search close restores motion', {
                    height: '80px',
                    width: '300px',
                    ending: true,
                    running: true
                });
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
                await expect(panel).toHaveAttribute('hidden', 'until-found');
            }
            const height = s.motion === 'decorated' ? '104px' : '80px';
            const width = s.motion === 'decorated' ? '324px' : s.motion === 'horizontal' ? '240px' : '300px';
            if (s.motion !== 'initial') {
                await page.getByTestId('a-trigger').click();
                await pause();
                await expect(panel).not.toHaveAttribute('data-starting-style');
                await checkpoint('measured opening', { height, width, ending: false, open: true, running: true });
                await finish();
            }
            if (s.motion === 'dynamic') {
                await page.getByTestId('grow').click();
                await expect.poll(() => panel.evaluate((node) => node.getBoundingClientRect().height)).toBe(160);
                await checkpoint('content grows after open', { height: 'auto', width: 'auto' });
            }
            if (s.motion === 'switch') {
                await page.getByTestId('b-trigger').click();
                await expect(panel).toHaveAttribute('data-ending-style', '');
                await pause();
                const sibling = page.getByTestId('b-panel');
                await expect.poll(() => sibling.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
                await sibling.evaluate((node) => node.getAnimations().forEach((animation) => animation.pause()));
                await checkpoint('switch holds outgoing panel', {
                    height: '80px',
                    width: '300px',
                    ending: true,
                    open: false,
                    running: true
                });
                await page.evaluate(() =>
                    document
                        .querySelectorAll<HTMLElement>('.motion-panel')
                        .forEach((node) => node.getAnimations().forEach((animation) => animation.finish()))
                );
                await expect(panel).toHaveCount(0);
                await expect
                    .poll(() =>
                        sibling.evaluate((node) =>
                            getComputedStyle(node).getPropertyValue('--accordion-panel-height').trim()
                        )
                    )
                    .toBe('auto');
                d.checkpoints.push({ name: 'sibling settles', state: { outgoing: false, height: 'auto' } });
                return;
            }
            await page.getByTestId('a-trigger').click();
            await expect(panel).toHaveAttribute('data-ending-style', '');
            await pause();
            await checkpoint('measured exit', {
                height: s.motion === 'dynamic' ? '160px' : height,
                width,
                ending: true,
                open: false,
                running: true
            });
            if (s.motion === 'rapid') {
                await page.getByTestId('a-trigger').click();
                await expect(panel).toHaveAttribute('data-open', '');
                await expect(panel).not.toHaveAttribute('data-ending-style');
                await pause();
                await checkpoint('reopen retains motion ownership', { open: true, ending: false, running: true });
                await finish();
            } else {
                await panel.evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
                if (s.motion === 'search') {
                    await expect(panel).toHaveAttribute('hidden', 'until-found');
                    d.checkpoints.push({ name: 'search retains hidden panel', state: { hidden: 'until-found' } });
                } else {
                    await expect(panel).toHaveCount(0);
                    d.checkpoints.push({ name: 'exit removes panel', state: { present: false } });
                }
                if (s.motion === 'initial') {
                    await page.getByTestId('a-trigger').click();
                    await pause();
                    await expect(panel).not.toHaveAttribute('data-starting-style');
                    await checkpoint('later user open animates', {
                        height: '80px',
                        width: '300px',
                        open: true,
                        running: true
                    });
                    await finish();
                }
            }
        }
    }));
