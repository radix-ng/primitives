import { expect, type Page, test } from '@playwright/test';

async function selectDocs(page: Page) {
    await page.goto('/iframe.html?id=primitives-select--docs&viewMode=docs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.toc-wrapper a').first()).toBeAttached();
}

async function expectNoOverflow(page: Page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerWidth)
    );
}

test('desktop TOC preserves anchors and expands only the active section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await selectDocs(page);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();
    await expect(page.getByRole('button', { name: 'On this page' })).toBeHidden();
    await expect(toc.getByRole('link', { name: 'RdxSelectRoot', exact: true })).toBeHidden();

    await toc.getByRole('link', { name: 'Anatomy', exact: true }).click();
    await expect(toc.getByRole('link', { name: 'Popper', exact: true })).toBeVisible();
    await expect(toc.getByRole('link', { name: 'RdxSelectRoot', exact: true })).toBeHidden();
    await toc.getByRole('link', { name: 'Examples', exact: true }).click();
    const events = toc.getByRole('link', { name: 'Events', exact: true });
    await expect(events).toBeVisible();
    await expect(events).toHaveAttribute('href', '#change-details-and-interaction-state');
    await expect(
        page.getByRole('heading', { name: 'Change details and interaction state', exact: true })
    ).toHaveAttribute('id', 'change-details-and-interaction-state');
    await expect(toc.getByRole('link', { name: 'Popper', exact: true })).toBeHidden();

    await expect
        .poll(() =>
            page
                .getByRole('heading', { name: 'Examples', exact: true })
                .evaluate((el) => el.getBoundingClientRect().top)
        )
        .toBeLessThan(66);
    await page
        .getByRole('heading', { name: 'Item-aligned with scroll', exact: true })
        .evaluate((el) => el.scrollIntoView({ block: 'start' }));
    const lastExample = toc.getByRole('link', { name: 'Item alignment + scroll', exact: true });
    await expect(lastExample).toHaveClass(/is-active-link/);
    await expect(lastExample).toBeInViewport();

    // Long API names remain readable and contained, even when no curated short label exists.
    await toc.getByRole('link', { name: 'API Reference', exact: true }).click();
    const longName = toc.getByRole('link', { name: 'RdxSelectScrollDownButton', exact: true });
    await expect(longName).toBeVisible();
    const [linkBounds, tocBounds] = await Promise.all([longName.boundingBox(), toc.boundingBox()]);
    expect(linkBounds!.x + linkBounds!.width).toBeLessThanOrEqual(tocBounds!.x + tocBounds!.width);
    await expectNoOverflow(page);
});

for (const width of [1000, 390]) {
    test(`compact TOC is a keyboard disclosure at ${width}px`, async ({ page, browserName }) => {
        await page.setViewportSize({ width, height: 844 });
        await selectDocs(page);
        const toggle = page.getByRole('button', { name: 'On this page' });
        const firstLink = page.locator('.toc-wrapper a').first();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(firstLink).toBeHidden();
        await toggle.focus();
        // macOS Safari's native full-link keyboard navigation uses Option+Tab.
        const tab = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
        await page.keyboard.press(tab);
        expect(await page.locator('.toc-wrapper').evaluate((el) => el.contains(document.activeElement))).toBe(false);
        await toggle.focus();
        await page.keyboard.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(firstLink).toBeVisible();
        await page.keyboard.press(tab);
        await expect(firstLink).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(toggle).toBeFocused();
        await expect(firstLink).toBeHidden();
        await page.keyboard.press('Space');
        await expect(firstLink).toBeVisible();
        await firstLink.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expectNoOverflow(page);

        // A collapsed narrow-screen state must not hide the desktop navigation after resizing.
        await page.setViewportSize({ width: 1280, height: 900 });
        await expect(toggle).toBeHidden();
        await expect(firstLink).toBeVisible();
    });
}

test('navigation fits beside the manager sidebar on a laptop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?path=/docs/primitives-select--docs', { waitUntil: 'domcontentloaded' });
    const preview = page.frameLocator('#storybook-preview-iframe');
    const toggle = preview.getByRole('button', { name: 'On this page' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await preview
        .getByRole('navigation', { name: 'On this page' })
        .getByRole('link', { name: 'Anatomy', exact: true })
        .click();
    await expect(page).toHaveURL(/#anatomy$/);
    expect(
        await preview.locator('html').evaluate((el) => el.scrollWidth - el.ownerDocument.defaultView!.innerWidth)
    ).toBeLessThanOrEqual(0);
});
