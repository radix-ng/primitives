import { expect, type Page, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

async function story(page: Page, name: string, theme: string) {
    await page.goto(`/iframe.html?id=primitives-${name}&viewMode=story&globals=theme:${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

const motionCases = [
    {
        story: 'popover--default',
        trigger: 'Shipping information',
        popup: '[rdxPopoverPopup]',
        entry: 'transition:scale',
        closing: 'data-ending-style'
    },
    {
        story: 'dialog--default',
        trigger: 'Edit profile',
        popup: '[rdxDialogPopup]',
        entry: 'transition:scale',
        closing: 'data-ending-style'
    },
    {
        story: 'drawer--default',
        trigger: 'Open drawer',
        popup: '[rdxDrawerPopup]',
        entry: 'transition:transform',
        closing: 'data-ending-style'
    },
    {
        story: 'menu--animated',
        trigger: 'Animated',
        popup: '[rdxMenuPopup]',
        entry: 'animation:popover-popup-in',
        closing: 'data-closed'
    }
] as const;

test('Native checkbox labels activate the button in standalone and grouped stories', async ({ page }) => {
    await story(page, 'checkbox--default', 'light');
    const terms = page.getByRole('checkbox', { name: 'Accept terms and conditions.' });
    await expect(terms).toBeChecked();
    await page.locator('label').filter({ hasText: 'Accept terms and conditions.' }).click();
    await expect(terms).not.toBeChecked();

    await story(page, 'checkbox--group', 'light');
    const bananas = page.getByRole('checkbox', { name: 'Bananas', exact: true });
    await expect(bananas).not.toBeChecked();
    await page.getByText('Bananas', { exact: true }).click();
    await expect(bananas).toBeChecked();
});

test('A wrapping native label selects its radio option', async ({ page }) => {
    await story(page, 'radio-group--default', 'light');
    const comfortable = page.getByRole('radio', { name: 'Comfortable', exact: true });
    await expect(comfortable).not.toBeChecked();
    await page.getByText('Comfortable', { exact: true }).click();
    await expect(comfortable).toBeChecked();
});

for (const theme of ['light', 'dark']) {
    test(`Switch hero toggles with the keyboard and shows focus in ${theme}`, async ({ page, browserName }) => {
        await story(page, 'switch--default', theme);
        const control = page.getByRole('switch', { name: 'Notifications', exact: true });
        const thumb = page.locator('[rdxSwitchThumb]');
        const thumbOffset = () =>
            thumb.evaluate((node) =>
                Math.round(node.getBoundingClientRect().left - node.parentElement!.getBoundingClientRect().left)
            );
        const checkedColor = await control.evaluate((node) => getComputedStyle(node).backgroundColor);

        await expect(control).toHaveCSS('width', '36px');
        await expect(control).toHaveAttribute('aria-checked', 'true');
        await expect.poll(thumbOffset).toBe(19);
        // On macOS, WebKit uses Option+Tab to include switches in the full Tab order.
        await page.keyboard.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS('outline-width', '2px');
        await control.press('Space');
        await expect(control).toHaveAttribute('aria-checked', 'false');
        await expect.poll(thumbOffset).toBe(3);
        await expect(control).not.toHaveCSS('background-color', checkedColor);
        await page.getByText('Notifications', { exact: true }).click();
        await expect(control).toHaveAttribute('aria-checked', 'true');
    });

    test(`Accordion hero animates the panel and can reopen during exit in ${theme}`, async ({ page }) => {
        await story(page, 'accordion--default', theme);
        const trigger = page.getByRole('button', { name: 'What is Radix NG?', exact: true });
        const selector = '[rdxAccordionPanel]';
        const panel = page.locator(selector);
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await page.keyboard.press('Tab');
        await expect(trigger).toBeFocused();
        await expect(trigger).toHaveCSS('outline-width', '2px');
        await trigger.press('Enter');
        await expect(panel).toBeVisible();
        const exit = await holdExitAnimations(page, [selector], 'data-ending-style');
        await panel.evaluate((node) => node.setAttribute('data-test-retained', ''));
        await trigger.press('Enter');
        await expect(panel).toHaveAttribute('data-ending-style', '');
        await expect.poll(exit.count).toBeGreaterThan(0);
        await exit.seek(0.4);
        await exit.dispose();
        await trigger.press('Enter');
        await expect(panel).not.toHaveAttribute('data-ending-style');
        await expect(panel).toHaveAttribute('data-test-retained', '');
        const finalExit = await holdExitAnimations(page, [selector], 'data-ending-style');
        await trigger.press('Enter');
        await expect.poll(finalExit.count).toBeGreaterThan(0);
        await finalExit.finish();
        await expect(panel).toHaveCount(0);
    });

    test(`shared controls, utility overrides, focus-visible and disabled in ${theme}`, async ({ page }) => {
        await story(page, 'button--default', theme);
        const button = page.getByRole('button', { name: 'Button', exact: true });
        await expect(button).toHaveCSS('height', '32px');
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
        await expect(button).toHaveCSS('outline-width', '2px');

        await story(page, 'input--default', theme);
        const input = page.getByRole('textbox', { name: 'Email' });
        await expect(input).toBeVisible();
        await page.keyboard.press('Tab');
        await expect(input).toBeFocused();
        await expect(input).toHaveCSS('height', '32px');
        await expect(input).toHaveCSS('outline-width', '2px');
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
            await page.evaluate(
                ({ selector, expected }) => {
                    const record = (event: AnimationEvent | TransitionEvent, kind: string, name: string) => {
                        if (
                            event.target instanceof HTMLElement &&
                            event.target.matches(selector) &&
                            event.target.hasAttribute('data-open') &&
                            `${kind}:${name}` === expected
                        ) {
                            event.target.dataset['testEntry'] = `${kind}:${name}`;
                        }
                    };
                    document.addEventListener('animationstart', (event) =>
                        record(event, 'animation', event.animationName)
                    );
                    document.addEventListener('transitionrun', (event) =>
                        record(event, 'transition', event.propertyName)
                    );
                },
                { selector: example.popup, expected: example.entry }
            );
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
