import { expect, type Page, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

async function story(page: Page, name: string, theme: string) {
    await page.goto(`/iframe.html?id=primitives-${name}&viewMode=story&globals=theme:${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

const motionCases = [
    {
        story: 'popover--default',
        trigger: 'Add details',
        popup: '[rdxPopoverPopup]',
        entry: 'animation:popover-popup-in',
        closing: 'data-ending-style'
    },
    {
        story: 'dialog--default',
        trigger: 'Edit profile',
        popup: '[rdxDialogPopup]',
        entry: 'animation:dialog-popup-in',
        closing: 'data-closed'
    },
    {
        story: 'drawer--default',
        trigger: 'Open drawer',
        popup: '[rdxDrawerPopup]',
        entry: 'transition:transform',
        closing: 'data-closed'
    },
    {
        story: 'menu--animated',
        trigger: 'Animated',
        popup: '[rdxMenuPopup]',
        entry: 'animation:popover-popup-in',
        closing: 'data-closed'
    }
] as const;

for (const theme of ['light', 'dark']) {
    test(`shared controls, utility overrides, focus-visible and disabled in ${theme}`, async ({ page }) => {
        await story(page, 'button--default', theme);
        const button = page.getByRole('button', { name: 'Button', exact: true });
        await expect(button).toHaveCSS('height', '36px');
        const overrides = await button.evaluate((element) => {
            const reference = document.createElement('button');
            reference.className = 'bg-muted border border-transparent shadow-none';
            element.after(reference);
            const read = (element: Element) => {
                const css = getComputedStyle(element);
                return { background: css.backgroundColor, border: css.borderTopColor, shadow: css.boxShadow };
            };
            const expected = read(reference);
            const classes = element.className;
            element.className = `${classes} ${reference.className}`;
            element.getAnimations().forEach((animation) => animation.finish());
            const after = read(element);
            element.className = `${reference.className} ${classes}`;
            element.getAnimations().forEach((animation) => animation.finish());
            const before = read(element);
            element.className = classes;
            element.getAnimations().forEach((animation) => animation.finish());
            reference.remove();
            return { expected, before, after };
        });
        expect(overrides.before).toEqual(overrides.expected);
        expect(overrides.after).toEqual(overrides.expected);
        await page.keyboard.press('Tab');
        await expect(button).toBeFocused();
        expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
        await expect(button).not.toHaveCSS('box-shadow', 'none');

        await story(page, 'input--default', theme);
        const input = page.locator('input');
        await expect(input).toBeVisible();
        await page.keyboard.press('Tab');
        await expect(input).toBeFocused();
        await expect(input).toHaveCSS('height', '36px');
        await expect(input).not.toHaveCSS('box-shadow', 'none');
        await input.fill('Keyboard input');
        await expect(input).toHaveValue('Keyboard input');

        await story(page, 'button--disabled', theme);
        const native = page.getByRole('button', { name: 'Disabled', exact: true });
        const focusable = page.getByRole('button', { name: 'Disabled (focusable)', exact: true });
        await expect(native).toBeDisabled();
        await expect(native).toHaveCSS('opacity', '0.5');
        await expect(focusable).toHaveAttribute('aria-disabled', 'true');
        expect(await focusable.evaluate((element: HTMLButtonElement) => element.disabled)).toBe(false);
        await page.keyboard.press('Tab');
        await expect(focusable).toBeFocused();
        await expect(focusable).toHaveCSS('opacity', '0.5');
        await focusable.press('Enter');
        await expect(focusable).toHaveAttribute('aria-disabled', 'true');

        await story(page, 'input--disabled', theme);
        await expect(page.locator('input')).toBeDisabled();
    });

    for (const example of motionCases) {
        test(`${example.story}: native entry, exit and reopen during exit in ${theme}`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await story(page, example.story, theme);
            await page.evaluate((selector) => {
                const record = (event: AnimationEvent | TransitionEvent, kind: string, name: string) => {
                    if (
                        event.target instanceof HTMLElement &&
                        event.target.matches(selector) &&
                        event.target.hasAttribute('data-open')
                    ) {
                        event.target.dataset['testEntry'] = `${kind}:${name}`;
                    }
                };
                document.addEventListener('animationstart', (event) => record(event, 'animation', event.animationName));
                document.addEventListener('transitionrun', (event) => record(event, 'transition', event.propertyName));
            }, example.popup);
            const trigger = page.getByRole('button', { name: example.trigger, exact: true });
            await trigger.click();
            const popup = page.locator(example.popup);
            await expect(popup).toBeVisible();
            await expect(popup).toHaveAttribute('data-test-entry', example.entry);
            const exit = await holdExitAnimations(page, [example.popup], example.closing);
            await popup.evaluate((element) => {
                element.setAttribute('data-test-retained', 'true');
                element.removeAttribute('data-test-entry');
            });
            await page.keyboard.press('Escape');
            await expect(popup).toHaveAttribute(example.closing, '');
            await expect.poll(exit.count).toBeGreaterThan(0);
            await exit.seek(0.4);
            await expect(popup).toBeAttached();
            await exit.dispose();
            await trigger.press('Enter');
            await expect(popup).not.toHaveAttribute(example.closing);
            await expect(popup).toHaveAttribute('data-test-retained', 'true');
            await expect(popup).toHaveAttribute('data-test-entry', example.entry);
            await popup.evaluate(async (element) => {
                await Promise.all(
                    element.getAnimations().map((animation) => animation.finished.catch(() => undefined))
                );
            });
            await expect(popup).toBeVisible();
            await expect(popup).toHaveCSS('opacity', '1');
            const finalExit = await holdExitAnimations(page, [example.popup], example.closing);
            await page.keyboard.press('Escape');
            await expect.poll(finalExit.count).toBeGreaterThan(0);
            await finalExit.finish();
            await expect(popup).toHaveCount(0);
            expect(errors).toEqual([]);
        });
    }
}
