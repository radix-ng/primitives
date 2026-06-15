import { expect, Page, test } from '@playwright/test';

/**
 * Behavioral checks for the structural `*rdxDialogPortal` (ADR 0010), exercising the **multi-root**
 * exit: the portal relocates backdrop + popup (two root nodes) with no wrapper element, and the
 * presence machine keeps the view mounted until the exit `@keyframes` on *both* roots finish. Needs a
 * real browser (jsdom runs no CSS); drives the built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

const trigger = '[rdxDialogTrigger]';
const backdrop = '[rdxDialogBackdrop]';
const popup = '[rdxDialogPopup]';

test.describe('Dialog structural portal', () => {
    test('teleports backdrop and popup directly into <body> with no wrapper element', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Both roots are relocated as direct children of <body> — the old wrapper portal div is gone.
        const backdropParent = await page.locator(backdrop).evaluate((el) => el.parentElement?.tagName);
        const popupParent = await page.locator(popup).evaluate((el) => el.parentElement?.tagName);
        expect(backdropParent).toBe('BODY');
        expect(popupParent).toBe('BODY');
    });

    test('keeps both roots mounted through the exit animation, then unmounts them', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Close via the popup's X button.
        await page.locator('[rdxDialogClose][aria-label="Close"]').click();

        // Both roots run their closed-state exit keyframes (backdrop overlay-out, popup zoom-out); the
        // presence machine keeps them mounted until both finish.
        await expect(page.locator(backdrop)).toHaveAttribute('data-closed', '');
        await expect(page.locator(popup)).toHaveAttribute('data-closed', '');

        // Once the exit animations end, the whole view is destroyed — no orphans in <body>.
        await expect(page.locator(backdrop)).toHaveCount(0);
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('holds the scroll lock through the exit animation, releasing it only on unmount', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        // Slow the 150ms exit keyframes to a comfortable window so the transitional state below is
        // observable without a race (the bug — releasing the lock the instant `isOpen` flips — would
        // restore `overflow` synchronously, well before the animation finishes).
        await page.addStyleTag({
            content: `[rdxDialogBackdrop][data-closed], [rdxDialogPopup][data-closed] { animation-duration: 2000ms !important; }`
        });

        const htmlOverflow = () => page.locator('html').evaluate((el) => el.style.overflow);

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        // Modal dialog locks page scroll while open.
        expect(await htmlOverflow()).toBe('hidden');

        await page.locator('[rdxDialogClose][aria-label="Close"]').click();

        // Mid-exit: the popup is closing but still mounted — the scroll lock must stay held so the
        // page scrollbar doesn't reappear and reflow the page (the judder) while the dialog animates.
        await expect(page.locator(popup)).toHaveAttribute('data-closed', '');
        expect(await htmlOverflow()).toBe('hidden');

        // Only once the view unmounts does the lock release and the original overflow return.
        await expect(page.locator(popup)).toHaveCount(0);
        expect(await htmlOverflow()).toBe('');
    });
});

/**
 * The outside-scroll story composes the custom `ScrollArea` primitive inside the dialog viewport (a
 * 1-1 port of the Base UI example). These guard the two things jsdom can't see: a real overlay
 * scrollbar appearing on scroll, and — critically — that the modal's `body { pointer-events: none }`
 * doesn't make the wheel dead when the cursor sits over the viewport *outside* the popup.
 */
test.describe('Dialog outside-scroll (custom scroll area)', () => {
    const scrollArea = '[rdxScrollAreaViewport]';
    const scrollbar = '[rdxScrollAreaScrollbar]';

    async function openTallDialog(page: Page) {
        await gotoStory(page, 'primitives-dialog--outside-scroll');
        await page.setViewportSize({ width: 900, height: 600 });
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        // Let the entrance animation settle so opacity/transform don't skew measurements.
        await expect(page.locator(popup)).not.toHaveAttribute('data-starting-style', '');
    }

    test('scrolls the whole dialog and shows the overlay scrollbar on scroll', async ({ page }) => {
        await openTallDialog(page);

        // Content is taller than the viewport, so the scroll area is actually scrollable.
        const { clientHeight, scrollHeight } = await page
            .locator(scrollArea)
            .evaluate((el) => ({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight }));
        expect(scrollHeight).toBeGreaterThan(clientHeight);

        // The custom scrollbar is hidden at rest and fades in while scrolling.
        await expect(page.locator(scrollbar)).toHaveCSS('opacity', '0');
        await page.locator(scrollArea).evaluate((el) => (el.scrollTop = el.scrollHeight));
        await expect(page.locator(scrollbar)).not.toHaveCSS('opacity', '0');
    });

    test('wheel over the viewport OUTSIDE the popup still scrolls (modal pointer-events)', async ({ page }) => {
        await openTallDialog(page);

        const scroller = page.locator(scrollArea);
        const before = await scroller.evaluate((el) => el.scrollTop);

        // Cursor in the far-left empty area — outside the centered popup, inside the viewport.
        await page.mouse.move(60, 300);
        await page.mouse.wheel(0, 600);
        await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
    });

    test('clicking the empty viewport area outside the popup still dismisses', async ({ page }) => {
        await openTallDialog(page);

        await page.mouse.click(60, 200);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});

/**
 * ⚠️ **NOT YET VERIFIED — ADR 0015/0017 Phase-4 Dialog migration onto the new floating engine.** These
 * are the browser checks the migrated `RdxDialogPopup` must pass before merge (jsdom cannot exercise
 * focus trap / live focus / focus-out / aria-hidden). Run with `pnpm test-visual` (or the local loop
 * against `:4400`). Some tests below intentionally encode **known gaps** in the first-cut wiring — see
 * the `KNOWN GAP` notes; they are expected to FAIL until the wiring is fixed in the verification session.
 */
test.describe('Dialog — new floating engine migration', () => {
    const closeButton = '[rdxDialogClose][aria-label="Close"]';

    const focusInsidePopup = (page: Page) =>
        page.locator(popup).evaluate((el) => el.contains(el.ownerDocument.activeElement));

    test('modal dialog moves focus into the popup on open', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        expect(await focusInsidePopup(page)).toBe(true);
    });

    test('modal dialog traps focus — Tab keeps focus inside the popup', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Tab repeatedly: focus must cycle within the popup, never escaping to the trigger / page.
        for (let i = 0; i < 8; i++) {
            await page.keyboard.press('Tab');
            expect(await focusInsidePopup(page)).toBe(true);
        }
    });

    test('returns focus to the trigger after closing', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');
        const triggerEl = page.locator(trigger).first();
        await triggerEl.click();
        await expect(page.locator(popup)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);

        await expect(triggerEl).toBeFocused();
    });

    test('Escape and outside-press still close (dismissal regression)', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);

        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        await page.locator(closeButton).click();
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('non-modal dialog closes when focus leaves to an unrelated element', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--non-modal');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // Tab focus out of the popup to a page element unrelated to the dialog → focus-out close (§3).
        await page.locator('body').press('Tab');
        await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
        // (Browser session: assert the dialog closes once focus lands on an unrelated tabbable.)
        await expect(page.locator(popup)).toHaveCount(0);
    });

    test('nested dialog: Escape closes only the inner dialog (deepest-first ownership)', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--nested');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup).first()).toBeVisible();

        // Open the nested dialog from inside the first.
        await page.locator(popup).first().locator(trigger).first().click();
        await expect(page.locator(popup)).toHaveCount(2);

        // Escape closes the deepest (inner) layer only — the outer stays open.
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(1);
    });

    test('does not aria-hide / mark the dialog backdrop (it is an owned root)', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--default');
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();

        // The backdrop is a second portal root (sibling of the popup); it registers as an owned floating
        // element, so the manager's markOthers keep-set covers it (Fix #1).
        await expect(page.locator(backdrop)).not.toHaveAttribute('aria-hidden', 'true');
        await expect(page.locator(backdrop)).not.toHaveAttribute('data-rdx-floating-inert', '');
    });
});

/**
 * The "uncontained" story renders the close button outside the visible content card while keeping it
 * inside the popup (and thus inside the focus trap). Guards the layout (close above the card) and that
 * every dismissal path still works in a modal where the popup is a viewport-filling frame.
 */
test.describe('Dialog uncontained (elements outside the popup)', () => {
    const close = '[rdxDialogClose]';

    async function open(page: Page) {
        await page.locator(trigger).first().click();
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator(popup)).not.toHaveAttribute('data-starting-style', '');
    }

    test('renders the close button above the content card', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--uncontained');
        await page.setViewportSize({ width: 900, height: 700 });
        await open(page);

        const closeBox = (await page.locator(close).boundingBox())!;
        const cardTop = await page
            .locator('[rdxDialogTitle]')
            .evaluate((el) => el.closest('div')!.getBoundingClientRect().top);
        // The close button's bottom edge sits at or above the card's top edge.
        expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(cardTop + 1);
    });

    test('dismisses via Escape, the outside close button, and outside-press', async ({ page }) => {
        await gotoStory(page, 'primitives-dialog--uncontained');
        await page.setViewportSize({ width: 900, height: 700 });

        await open(page);
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveCount(0);

        await open(page);
        await page.locator(close).click();
        await expect(page.locator(popup)).toHaveCount(0);

        await open(page);
        // Dimmed padding above the frame, away from the close button (top-right).
        await page.mouse.click(300, 12);
        await expect(page.locator(popup)).toHaveCount(0);
    });
});
