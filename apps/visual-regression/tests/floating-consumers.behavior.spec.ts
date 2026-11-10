import { expect, test } from '@playwright/test';

// Exercise the shared Popper contract through actual consumer stories. These checks are Angular
// regressions; only suites in apps/parity-testing compare against the pinned Base UI implementation.
const consumers = [
    { name: 'popover', part: 'Popover', action: 'click' },
    { name: 'menu', part: 'Menu', action: 'keyboard' },
    { name: 'tooltip', part: 'Tooltip', action: 'focus' },
    { name: 'preview-card', part: 'PreviewCard', action: 'focus' },
    { name: 'combobox', part: 'Combobox', action: 'input' },
    { name: 'autocomplete', part: 'Autocomplete', action: 'search' },
    { name: 'navigation-menu', part: 'NavigationMenu', action: 'keyboard' },
    { name: 'toast', part: 'Toast', action: 'toast' }
] as const;

for (const consumer of consumers) {
    test(`${consumer.name}: tracks the live anchor and reports clipping without hiding by default`, async ({
        page
    }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(String(error)));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await page.setViewportSize({ width: 1280, height: 1000 });
        await page.goto(
            `/iframe.html?id=primitives-${consumer.name}--${consumer.action === 'toast' ? 'anchored' : 'default'}&viewMode=story`
        );
        const anchor =
            consumer.action === 'toast'
                ? page.getByRole('button', { name: 'Anchored toast', exact: true })
                : page
                      .locator(
                          `[rdx${consumer.part}${['input', 'search'].includes(consumer.action) ? 'Input' : 'Trigger'}]`
                      )
                      .first();
        // The Preview Card example uses an ordinary inline link. CSS translate/min-width apply
        // to an inline-block box; this is test layout instrumentation, not a primitive requirement.
        if (consumer.name === 'preview-card')
            await anchor.evaluate((el: HTMLElement) => {
                el.style.display = 'inline-block';
            });
        if (consumer.action === 'focus') await anchor.focus();
        else if (consumer.action === 'keyboard') await anchor.press('Enter');
        else if (consumer.action === 'search') await anchor.pressSequentially('f');
        else await anchor.click();

        const positioner = page.locator(`[rdx${consumer.part}Positioner]`).first();
        const popup = page.locator(`[rdx${consumer.part}${consumer.action === 'toast' ? 'Root' : 'Popup'}]`).first();
        await expect(popup).toBeVisible();
        await expect
            .poll(() =>
                positioner.evaluate((el) =>
                    parseFloat(getComputedStyle(el).getPropertyValue('--radix-popper-anchor-width'))
                )
            )
            .toBeGreaterThan(0);
        const initial = (await positioner.boundingBox())!;
        await anchor.evaluate((el: HTMLElement) => {
            el.style.translate = '32px 16px';
        });
        await expect
            .poll(async () => {
                const box = (await positioner.boundingBox())!;
                return Math.max(Math.abs(box.x - initial.x - 32), Math.abs(box.y - initial.y - 16));
            })
            .toBeLessThan(2);

        const width = await anchor.evaluate((el) => el.getBoundingClientRect().width);
        await anchor.evaluate((el: HTMLElement, value) => {
            el.style.minWidth = `${value + 24}px`;
        }, width);
        await expect
            .poll(() =>
                positioner.evaluate((el) =>
                    parseFloat(getComputedStyle(el).getPropertyValue('--radix-popper-anchor-width'))
                )
            )
            .toBeGreaterThanOrEqual(width + 23);

        // Native layout changes, without calling updatePosition or mutating primitive state.
        await anchor.evaluate((el: HTMLElement) => {
            el.style.translate = '-2000px -2000px';
        });
        await expect(positioner).toHaveAttribute('data-anchor-hidden', '');
        await expect(popup).toBeVisible();
        await anchor.evaluate((el: HTMLElement) => {
            el.style.removeProperty('translate');
        });
        await expect(positioner).not.toHaveAttribute('data-anchor-hidden', '');
        await expect(popup).toBeVisible();
        expect(errors).toEqual([]);
    });
}

test('navigation-menu: a pending keyboard entry does not steal a later focus move', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-navigation-menu--default&viewMode=story');
    const trigger = page.locator('[rdxNavigationMenuTrigger]').first();
    await trigger.click();
    await expect(page.locator('[rdxNavigationMenuPopup]')).toBeVisible();
    const github = page.getByRole('link', { name: 'GitHub', exact: true });
    // Deliberately move focus before the positioning RAF can finish, as fast Tab/AT navigation can.
    await trigger.evaluate((el: HTMLElement) => {
        el.focus();
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        (document.querySelector('a[rdxNavigationMenuLink][href*="github"]') as HTMLElement).focus();
    });
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            })
    );
    await expect(github).toBeFocused();
});
