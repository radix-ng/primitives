import { expect, type Page } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../tools/playwright/clock.ts';
import { rootRemovalCases, rootRemovalConfig } from './root-removal.ts';

interface RemovalDriver {
    readonly page: Page;
    readonly measurements: unknown[];
    readonly checkpoints: { name: string; state: Record<string, unknown> }[];
    checkpoint(name: string, expected?: Record<string, unknown>): Promise<void>;
}

/** Observe resource ownership through DOM and native input; do not emulate a framework store. */
async function resources(page: Page) {
    return page.evaluate(() => {
        const html = getComputedStyle(document.documentElement);
        const body = getComputedStyle(document.body);
        const outside = document.querySelector<HTMLElement>('[data-testid="outside"]')!;
        const rect = outside.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return {
            backgroundHidden: !!outside.closest('[inert], [aria-hidden="true"]'),
            backgroundMarked: !!outside.closest('[data-rdx-floating-inert], [data-base-ui-inert]'),
            backgroundPointerBlocked: !hit || !outside.contains(hit),
            scrollLocked: /hidden|clip/.test(html.overflowY === 'visible' ? body.overflowY : html.overflowY),
            bodyPointerBlocked: body.pointerEvents === 'none'
        };
    });
}

async function artifacts(page: Page) {
    return page.evaluate(() => ({
        inert: document.querySelectorAll('[inert]').length,
        hidden: document.querySelectorAll('[aria-hidden="true"]').length,
        marked: document.querySelectorAll('[data-rdx-floating-inert], [data-base-ui-inert]').length,
        guards: document.querySelectorAll('[data-rdx-focus-guard], [data-base-ui-focus-guard]').length,
        backdrops: [...document.querySelectorAll('[role="presentation"]')].filter((el) => {
            const style = getComputedStyle(el);
            return style.position === 'fixed' && style.inset === '0px';
        }).length
    }));
}

export function rootRemovalScenarios<Driver extends RemovalDriver>(parts: {
    popup: string;
    child: string;
    more: string;
    alpha: string;
    backgroundFocus: string;
    open(d: Driver): Promise<void>;
}) {
    return rootRemovalCases.map((name) => ({
        name,
        async run(d: Driver) {
            const settings = rootRemovalConfig(name)!;
            const popup = d.page.getByTestId(parts.popup);
            const child = d.page.getByTestId(parts.child);
            const baseline = await resources(d.page);
            expect(Object.values(baseline).every((value) => !value)).toBe(true);
            const cssBefore = await d.page.evaluate(() => ({
                html: document.documentElement.style.cssText,
                body: document.body.style.cssText
            }));
            const record = async (label: string) => {
                await d.checkpoint(label);
                d.checkpoints.at(-1)!.state.resources = await resources(d.page);
                d.measurements.push({ name: label + ': raw resource markup', bounds: await artifacts(d.page) });
            };
            await d.page.getByTestId('before').focus();
            await parts.open(d);
            await expect(popup).toBeVisible();
            if (settings.nested && !settings.hoverPending) {
                await d.page.getByTestId(parts.more).press('ArrowRight');
                await expect(child).toBeVisible();
            }
            await record('before whole-root removal');
            if (settings.animated || settings.deferred) {
                await (settings.nested ? child.getByRole('menuitem').first() : d.page.getByTestId(parts.alpha)).press(
                    'Enter'
                );
                await expect(popup).toHaveAttribute('data-closed', '');
                if (settings.animated) {
                    await expect
                        .poll(() =>
                            popup.evaluate((el) =>
                                el.getAnimations().some((animation) => animation.playState === 'paused')
                            )
                        )
                        .toBe(true);
                }
                await record('closing before whole-root removal');
            }
            if (settings.hoverPending) {
                // The application removes the Root before its hover deadline, independent of
                // runner latency between native pointer movement and the application command.
                await pauseClockBeforeInteraction(d.page);
                await d.page.getByTestId(parts.more).hover();
                await expect(child).toHaveCount(0);
                await d.page.keyboard.press('F3');
                await d.page.clock.runFor(100);
                await d.page.clock.resume();
            } else await d.page.keyboard.press('F3');
            await expect(popup).toHaveCount(0);
            await expect(child).toHaveCount(0);
            await record('whole root removed');
            if (settings.finalFocus) {
                await expect(
                    settings.missingFocus ? d.page.locator('body') : d.page.getByTestId('before')
                ).toBeFocused();
            }
            expect(await resources(d.page)).toEqual(baseline);
            expect(Object.values(await artifacts(d.page)).every((count) => count === 0)).toBe(true);
            expect(
                await d.page.evaluate(() => ({
                    html: document.documentElement.style.cssText,
                    body: document.body.style.cssText
                }))
            ).toEqual(cssBefore);
            await d.page.keyboard.press('Escape');
            const background = d.page.getByTestId(parts.backgroundFocus);
            await background.focus();
            await expect(background).toBeFocused();
            await d.page.keyboard.press('Tab');
            await record('keyboard active without a root');
            await d.page.getByTestId('outside').click();
            await record('background active without a root');
            await d.page.mouse.move(750, 450);
            await d.page.mouse.wheel(0, 240);
            await expect.poll(() => d.page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
            await d.page.mouse.wheel(0, -1200);
            await expect.poll(() => d.page.evaluate(() => window.scrollY)).toBe(0);
            await d.page.keyboard.press('F4');
            await parts.open(d);
            await expect(popup).toBeVisible();
            // Expire old hover/exit deadlines after a fresh Root has acquired its own resources.
            await d.page.clock.fastForward(31_000);
            await expect(popup).toBeVisible();
            await expect(child).toHaveCount(0);
            await record('new root survives old deadlines');
            await d.page.keyboard.press('F3');
            await expect(popup).toHaveCount(0);
            await record('recreated root removed');
            expect(await resources(d.page)).toEqual(baseline);
            expect(Object.values(await artifacts(d.page)).every((count) => count === 0)).toBe(true);
        }
    }));
}
