import { expect, Page, test } from '@playwright/test';
import { holdExitAnimations } from '../helpers/exit-animations';

/**
 * Behavioral check for the structural `*rdxNavigationMenuPortal` (ADR 0010): the positioner is
 * relocated directly into `<body>` with no portal wrapper element. Drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('navigation menu teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-navigation-menu--default');

    await page.locator('[rdxNavigationMenuTrigger]').first().click();
    await expect(page.locator('[rdxNavigationMenuPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxNavigationMenuPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

/**
 * ADR 0015/0017 Phase-4 migration of Navigation Menu onto the new floating dismissal engine
 * (node-optional capability: one shared popup, `node === null`).
 */
test.describe('Navigation Menu — new floating engine migration', () => {
    const trigger = '[rdxNavigationMenuTrigger]';
    const popup = '[rdxNavigationMenuPopup]';

    test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);
        await expect(page.locator(trigger).first()).toBeFocused();
    });

    test('closing popup animation holds its final frame until unmount', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        const exit = await holdExitAnimations(page, [popup], 'data-ending-style');

        await page.keyboard.press('Escape');

        const closingPopup = page.locator(`${popup}[data-ending-style]`);
        await expect(closingPopup).toBeVisible();
        await expect(closingPopup).toHaveCSS('animation-fill-mode', 'forwards');
        await expect(page.locator('[rdxNavigationMenuViewport] > [data-current]')).toHaveCount(1);
        await expect(page.locator('[rdxNavigationMenuViewport] > [data-previous]')).toHaveCount(0);
        await expect.poll(exit.count).toBeGreaterThan(0);
        await exit.finish();
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('an outside press closes the menu', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.mouse.click(5, 5);
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('pressing a sibling trigger switches items instead of dismissing', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();

        // A sibling trigger is a registered "inside" element, so opening it switches the shared popup
        // rather than counting as an outside press / focus-out that would dismiss.
        await triggers.nth(1).click();
        await expect(page.locator(popup)).toBeVisible();
    });

    test('ArrowLeft and ArrowRight move focus inside the open popup', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        const links = page.locator(`${popup} a`);
        await links.nth(0).focus();
        await expect(links.nth(0)).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(links.nth(1)).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(links.nth(0)).toBeFocused();
    });

    test('ArrowLeft and ArrowRight include top-level links in list navigation', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        const githubLink = page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")');

        await triggers.nth(1).focus();
        await expect(triggers.nth(1)).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(githubLink).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(triggers.nth(1)).toBeFocused();
    });

    test('ArrowLeft and ArrowRight move between open dropdown triggers and top-level links', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        const githubLink = page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")');

        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();
        await expect(triggers.first()).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(triggers.nth(1)).toBeFocused();
        await expect(page.locator(popup)).toContainText('Quick Start');

        await page.keyboard.press('ArrowRight');
        await expect(githubLink).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(triggers.nth(1)).toBeFocused();

        await page.keyboard.press('ArrowDown');
        await expect(page.locator(popup)).toContainText('Styling');
        await expect(triggers.nth(1)).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.locator(`${popup} a`).first()).toBeFocused();
    });

    test('top-level list navigation does not loop at either boundary', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        const githubLink = page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")');

        await triggers.first().focus();
        await page.keyboard.press('ArrowLeft');
        await expect(triggers.first()).toBeFocused();

        await githubLink.focus();
        await page.keyboard.press('ArrowRight');
        await expect(githubLink).toBeFocused();
    });

    test('popup links keep their natural tab order outside the top-level composite list', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        const firstPopupLink = page.locator(`${popup} a[rdxNavigationMenuLink]`).first();
        await expect(firstPopupLink).not.toHaveAttribute('tabindex', /.+/);
    });

    test('Tab exits the popup through the top-level navigation order', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);

        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.locator(`${popup} a`).last().focus();
        await page.keyboard.press('Tab');
        await expect(triggers.nth(1)).toBeFocused();
        await expect(page.locator(popup)).toContainText('Quick Start');

        await page.keyboard.press('ArrowDown');
        await expect(page.locator(popup)).toContainText('Styling');

        await page.locator(`${popup} a`).last().focus();
        await page.keyboard.press('Tab');
        await expect(page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")')).toBeFocused();
    });

    test('ArrowRight reaches a top-level link after Tab exits the popup to a dropdown trigger', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        const triggers = page.locator(trigger);
        const githubLink = page.locator('a[rdxNavigationMenuLink]:has-text("GitHub")');

        await triggers.first().click();
        await expect(page.locator(popup)).toBeVisible();

        await page.locator(`${popup} a`).last().focus();
        await page.keyboard.press('Tab');
        await expect(triggers.nth(1)).toBeFocused();
        await expect(page.locator(popup)).toContainText('Quick Start');

        await page.keyboard.press('ArrowRight');
        await expect(githubLink).toBeFocused();
    });
});

test('nested navigation menu keeps parent and nested popups open when hovering the nested trigger', async ({
    page
}) => {
    await gotoStory(page, 'primitives-navigation-menu--nested');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Overview")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Quick Start")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Handbook")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Styling")')).toBeVisible();

    await page.waitForTimeout(120);
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Quick Start")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Styling")')).toBeVisible();
});

test('nested navigation menu keeps parent popup open when hovering a nested popup link', async ({ page }) => {
    await gotoStory(page, 'primitives-navigation-menu--nested');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Overview")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Quick Start")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Handbook")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Styling")')).toBeVisible();

    await page.locator('[rdxNavigationMenuLink]:has-text("Styling")').hover();
    await page.waitForTimeout(120);

    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Quick Start")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Styling")')).toBeVisible();
});

test('nested navigation menu opens with Enter, enters with Tab and keeps arrows inside the panel', async ({ page }) => {
    await gotoStory(page, 'primitives-navigation-menu--nested');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Overview")').click();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Quick Start")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Handbook")').focus();
    await page.keyboard.press('Enter');

    const nestedPopup = page.locator('[rdxNavigationMenuPopup]').filter({ hasText: 'Styling' });
    await expect(nestedPopup).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuTrigger]:has-text("Handbook")')).toBeFocused();
    await page.keyboard.press('Tab');

    const nestedLinks = nestedPopup.locator('a[rdxNavigationMenuLink]');
    await expect(nestedLinks.nth(0)).toHaveCSS('text-align', 'left');
    await expect(nestedLinks.nth(0)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(nestedLinks.nth(1)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(nestedLinks.nth(2)).toBeFocused();
});

test('nested inline navigation menu keeps the parent popup open when hovering the last nested trigger', async ({
    page
}) => {
    await gotoStory(page, 'primitives-navigation-menu--nested-inline');

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Browse")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Learn")')).toBeVisible();

    await page.locator('[rdxNavigationMenuTrigger]:has-text("Resources")').hover();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Blog")')).toBeVisible();

    await page.waitForTimeout(120);
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Resources")')).toBeVisible();
    await expect(page.locator('[rdxNavigationMenuPopup]:has-text("Blog")')).toBeVisible();
});

test.describe('Navigation Menu content composition and demo layout', () => {
    let errors: string[];

    test.beforeEach(({ page }) => {
        errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
    });

    test.afterEach(() => expect(errors).toEqual([]));

    for (const [story, labels, arrow] of [
        ['default', ['Overview', 'Handbook', 'GitHub'], 'ArrowRight'],
        ['vertical', ['Account', 'Workspace', 'Support'], 'ArrowDown'],
        ['links', ['Home', 'Docs', 'Pricing', 'Blog'], 'ArrowRight']
    ] as const) {
        test(`${story}: closed Tab order visits every item, exits and returns in reverse`, async ({
            page,
            browserName
        }) => {
            const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
            const reverseTab = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
            await gotoStory(page, `primitives-navigation-menu--${story}`);
            const root = page.locator('[rdxNavigationMenuRoot]').first();
            await expect(root).toBeVisible();
            await root.evaluate((element) => {
                for (const position of ['beforebegin', 'afterend'] as const) {
                    const button = element.ownerDocument.createElement('button');
                    button.tabIndex = 0;
                    button.textContent = position === 'beforebegin' ? 'Before menu' : 'After menu';
                    element.insertAdjacentElement(position, button);
                }
            });
            await page.keyboard.press(tab);
            await expect(page.getByRole('button', { name: 'Before menu', exact: true })).toBeFocused();
            const parts = root.locator('[rdxNavigationMenuTrigger], [rdxNavigationMenuLink]');
            for (const label of labels) {
                await page.keyboard.press(tab);
                await expect(parts.filter({ hasText: label })).toBeFocused();
            }
            await page.keyboard.press(tab);
            await expect(page.getByRole('button', { name: 'After menu', exact: true })).toBeFocused();
            for (const label of [...labels].reverse()) {
                await page.keyboard.press(reverseTab);
                await expect(parts.filter({ hasText: label })).toBeFocused();
            }
            await page.keyboard.press(reverseTab);
            await expect(page.getByRole('button', { name: 'Before menu', exact: true })).toBeFocused();
            await page.keyboard.press(tab);
            await page.keyboard.press(arrow);
            await expect(parts.nth(1)).toBeFocused();
            await page.keyboard.press(tab);
            await expect(parts.nth(2)).toBeFocused();
            expect(
                await parts.evaluateAll((elements) => elements.map((element) => (element as HTMLElement).tabIndex))
            ).toEqual(labels.map(() => 0));
            await expect(page.locator('[rdxNavigationMenuPopup]')).toHaveCount(0);
        });
    }

    test('Tab traverses open content, then every remaining top-level item', async ({ page, browserName }) => {
        const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
        const reverseTab = browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab';
        await gotoStory(page, 'primitives-navigation-menu--default');
        const overview = page.getByRole('button', { name: 'Overview', exact: true });
        await overview.press('Enter');
        const links = page.locator('[rdxNavigationMenuPopup] a');
        await expect(links).toHaveCount(4);
        await expect(links.first()).toBeVisible();
        await expect(overview).toBeFocused();
        for (let index = 0; index < 4; index++) {
            await page.keyboard.press(tab);
            await expect(links.nth(index)).toBeFocused();
        }
        await page.keyboard.press(tab);
        await expect(page.getByRole('button', { name: 'Handbook', exact: true })).toBeFocused();
        await page.keyboard.press(tab);
        await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toBeFocused();
        await page.keyboard.press(reverseTab);
        await expect(page.getByRole('button', { name: 'Handbook', exact: true })).toBeFocused();
        for (let index = 3; index >= 0; index--) {
            await page.keyboard.press(reverseTab);
            await expect(links.nth(index)).toBeFocused();
        }
        await page.keyboard.press(reverseTab);
        await expect(overview).toBeFocused();
    });

    for (const activation of ['click', 'Enter', 'Space', 'ArrowDown']) {
        test(`opening with ${activation} keeps trigger focus; Tab enters and Shift+Tab returns`, async ({ page }) => {
            await gotoStory(page, 'primitives-navigation-menu--default');
            const overview = page.getByRole('button', { name: 'Overview', exact: true });
            const quickStart = page.getByRole('link', { name: /^Quick Start/ });
            await expect(overview).toBeVisible();
            await page.keyboard.press('Tab');
            await expect(overview).toBeFocused();

            if (activation === 'click') await overview.click();
            else await page.keyboard.press(activation);

            await expect(quickStart).toBeVisible();
            // Check beyond positioning and the next frame, where the old entry request stole focus.
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            );
            await expect(overview).toBeFocused();

            if (activation === 'Enter' || activation === 'Space') {
                await page.keyboard.press(activation);
                await expect(overview).toHaveAttribute('aria-expanded', 'false');
                await page.keyboard.press(activation);
                await expect(quickStart).toBeVisible();
                await expect(overview).toBeFocused();
            }

            await page.keyboard.press('Tab');
            await expect(quickStart).toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(overview).toBeFocused();
        });
    }

    for (const activation of ['click', 'Enter', 'Space']) {
        test(`nested ${activation} opens without focusing its popup`, async ({ page }) => {
            await gotoStory(page, 'primitives-navigation-menu--nested');
            const handbook = page.getByRole('button', { name: /Handbook/ });
            const styling = page.getByRole('link', { name: /^Styling/ });
            await page.getByRole('button', { name: 'Overview', exact: true }).press('ArrowDown');
            await page.keyboard.press('Tab');
            await expect(page.getByRole('link', { name: /^Quick Start/ })).toBeFocused();
            await page.keyboard.press('End');
            await expect(handbook).toBeFocused();

            if (activation === 'click') await handbook.click();
            else await page.keyboard.press(activation);

            await expect(styling).toBeVisible();
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            );
            // Safari can natively blur a button when its inner paragraph is clicked. Opening must
            // leave that browser behavior intact, and must never focus the new panel's contents.
            const nestedPopup = page.locator('[rdxNavigationMenuPopup]').filter({ hasText: 'Styling' });
            expect(await nestedPopup.evaluate((element) => element.contains(element.ownerDocument.activeElement))).toBe(
                false
            );
            if (activation === 'click') return;

            await expect(handbook).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(styling).toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(handbook).toBeFocused();
            await expect(styling).toBeVisible();
            await page.keyboard.press('Tab');
            await expect(styling).toBeFocused();
        });
    }

    test('arrows reach Handbook, enter its popup and return to the parent collection', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--nested');
        const overview = page.getByRole('button', { name: 'Overview', exact: true });
        const handbook = page.getByRole('button', { name: /Handbook/ });
        const quickStart = page.getByRole('link', { name: /^Quick Start/ });
        const releases = page.getByRole('link', { name: /^Releases/ });

        await overview.press('ArrowDown');
        await expect(overview).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(quickStart).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('link', { name: /^Accessibility/ })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(releases).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(handbook).toBeFocused();
        await page.keyboard.press('ArrowUp');
        await expect(releases).toBeFocused();
        await page.keyboard.press('End');
        await expect(handbook).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('[rdxNavigationMenuPopup]').filter({ hasText: 'Styling' })).toBeVisible();
        await expect(handbook).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: /^Styling/ })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('link', { name: /^Animation/ })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(handbook).toBeFocused();
        await expect(quickStart).toBeVisible();
        await page.keyboard.press('ArrowUp');
        await expect(releases).toBeFocused();
    });

    test('inline nested content owns its arrows and Tab leaves through the parent list', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--nested-inline');
        const resources = page.getByRole('button', { name: 'Resources', exact: true });
        await page.getByRole('button', { name: 'Browse', exact: true }).press('ArrowDown');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Learn', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('button', { name: 'Develop', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(resources).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('link', { name: /^Blog/ })).toBeVisible();
        await expect(resources).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: /^Blog/ })).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(resources).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: /^Blog/ })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('link', { name: /^Changelog/ })).toBeFocused();
        await page.keyboard.press('Home');
        await expect(page.getByRole('link', { name: /^Blog/ })).toBeFocused();
        await page.keyboard.press('ArrowUp');
        await expect(resources).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(resources).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: /^Blog/ })).toBeFocused();
        await page.keyboard.press('End');
        await expect(page.getByRole('link', { name: /^Community/ })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Pricing', exact: true })).toBeFocused();
    });

    test('the arrow uses the popup surface color in both themes', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--default');
        await page.locator('[rdxNavigationMenuTrigger]').first().press('ArrowDown');
        const popup = page.locator('[rdxNavigationMenuPopup]');
        await expect(popup).toBeVisible();
        for (const theme of ['light', 'dark']) {
            await page.locator('html').evaluate((element, value) => element.setAttribute('data-theme', value), theme);
            await expect
                .poll(() =>
                    popup.evaluate((element) => {
                        const polygon = element.querySelector('[rdxNavigationMenuArrow] polygon')!;
                        return getComputedStyle(polygon).fill === getComputedStyle(element).backgroundColor;
                    })
                )
                .toBe(true);
        }
    });

    test('Large Menu keeps padding outside its scrollable list', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--large-menu');
        await page.getByRole('button', { name: 'Components', exact: true }).press('ArrowDown');
        await page.keyboard.press('Tab');
        const popup = page.locator('[rdxNavigationMenuPopup]');
        const list = popup.locator('ul');
        await expect(popup).toBeVisible();
        expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
        await page.keyboard.press('End');
        const last = page.getByRole('link', { name: /^Tooltip/ });
        await expect(last).toBeFocused();
        await expect
            .poll(() =>
                popup.evaluate((element) => {
                    const outer = element.getBoundingClientRect();
                    const inner = element.querySelector('ul')!.getBoundingClientRect();
                    return Math.min(inner.top - outer.top, outer.bottom - inner.bottom);
                })
            )
            .toBeGreaterThanOrEqual(16);
        expect(
            await list.evaluate((element) => {
                const listBox = element.getBoundingClientRect();
                const lastBox = element.querySelector('li:last-child')!.getBoundingClientRect();
                return lastBox.bottom <= listBox.bottom + 1 && lastBox.top >= listBox.top;
            })
        ).toBe(true);
    });

    test('Vertical rows fill the list, align chevrons and keep vertical keyboard navigation', async ({ page }) => {
        await gotoStory(page, 'primitives-navigation-menu--vertical');
        const rows = page.locator('[rdxNavigationMenuList] > li');
        await expect(rows).toHaveCount(3);
        await expect(rows.first()).toBeVisible();
        expect(
            await rows.evaluateAll((elements) =>
                elements.every((element) => {
                    const button = element.querySelector('button')!;
                    return Math.abs(element.getBoundingClientRect().width - button.getBoundingClientRect().width) < 1;
                })
            )
        ).toBe(true);
        const rightEdges = await rows
            .locator('svg')
            .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().right));
        expect(Math.max(...rightEdges) - Math.min(...rightEdges)).toBeLessThan(1);
        const account = page.getByRole('button', { name: 'Account', exact: true });
        await account.press('ArrowRight');
        await expect(account).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Profile', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('link', { name: 'Billing', exact: true })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(account).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('button', { name: 'Workspace', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Members', exact: true })).toBeFocused();
    });
});
