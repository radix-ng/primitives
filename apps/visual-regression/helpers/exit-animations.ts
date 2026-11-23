import type { Page } from '@playwright/test';

/** Hold real CSS exits before the next Playwright round trip, then finish through native WAAPI. */
export async function holdExitAnimations(
    page: Page,
    roots: string[],
    closingAttribute: 'data-closed' | 'data-ending-style' | 'data-state' = 'data-closed'
) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await page.locator(roots.join(',')).evaluateAll(async (elements) => {
        await Promise.all(
            elements
                .flatMap((element) => element.getAnimations({ subtree: true }))
                .map((animation) => animation.finished.catch(() => undefined))
        );
    });
    const closing = closingAttribute === 'data-state' ? '[data-state="closed"]' : `[${closingAttribute}]`;
    const selector = roots.map((root) => `${root}${closing}`).join(',');
    const handle = await page.evaluateHandle(
        ({ selector, closingAttribute }) => {
            const animations = new Set<Animation>();
            const observer = new MutationObserver(() => {
                for (const element of document.querySelectorAll(selector)) {
                    for (const animation of element.getAnimations()) {
                        animations.add(animation);
                        animation.pause();
                    }
                }
            });
            observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: [closingAttribute] });
            return {
                disconnect: () => observer.disconnect(),
                count: () => animations.size,
                seek: (fraction: number) => {
                    for (const animation of animations) {
                        const duration = animation.effect?.getComputedTiming().activeDuration;
                        if (typeof duration === 'number' && Number.isFinite(duration))
                            animation.currentTime = duration * fraction;
                    }
                },
                finish: () => {
                    observer.disconnect();
                    for (const animation of animations) animation.finish();
                }
            };
        },
        { selector, closingAttribute }
    );
    return {
        count: () => handle.evaluate((hold) => hold.count()),
        seek: (fraction: number) => handle.evaluate((hold, fraction) => hold.seek(fraction), fraction),
        dispose: async () => {
            await handle.evaluate((hold) => hold.disconnect());
            await handle.dispose();
        },
        finish: async () => {
            await handle.evaluate((hold) => hold.finish());
            await handle.dispose();
        }
    };
}
