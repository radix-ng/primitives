import { expect, Page, test } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../helpers/clock';

/**
 * Behavioral checks for the structural `*rdxMenuPortal` (ADR 0010) — the net-new menu portal that
 * replaces the consumer-owned `@if (root.open())` mount, adding teleport + exit animations. Drives the
 * built Storybook.
 */
async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
}

for (const [retained, deferred] of [
    [false, false],
    [true, false],
    [true, true]
]) {
    test(`Menu opens Popover: keeps a live anchor and focus through close; retained=${retained}, deferred=${deferred}`, async ({
        page
    }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--open-popover');
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        if (deferred) await page.getByRole('checkbox', { name: 'Defer menu exit', exact: true }).check();
        const trigger = page.getByRole('button', { name: 'Document actions', exact: true });
        await trigger.press('Enter');
        await expect(page.locator('output')).toHaveText('Menu completed: open');
        await page.getByRole('menuitem', { name: 'Rename document…', exact: true }).press('Enter');
        const field = page.getByRole('textbox', { name: 'Document name', exact: true });
        await expect(field).toBeFocused();
        await expect
            .poll(async () => {
                const anchor = (await trigger.boundingBox())!;
                const popup = (await page.locator('[rdxPopoverPopup]').boundingBox())!;
                const side = await page.locator('[rdxPopoverPositioner]').getAttribute('data-side');
                const arrowHeight = await page
                    .locator('[rdxPopoverArrow]')
                    .evaluate((el: HTMLElement) => el.offsetHeight);
                return Math.abs(
                    side === 'right'
                        ? popup.x - anchor.x - anchor.width - 8 - arrowHeight
                        : anchor.x - popup.x - popup.width - 8 - arrowHeight
                );
            })
            .toBeLessThan(2);
        if (deferred) {
            await expect(page.locator('[rdxMenuPopup]')).toHaveAttribute('data-ending-style', '');
            await page.getByRole('button', { name: 'Finish menu exit', exact: true }).press('Enter');
        }
        await expect(page.locator('output')).toHaveText('Menu completed: open → closed');
        await field.press('Escape');
        await expect(page.locator('[rdxPopoverPopup]')).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.press('Enter');
        await expect(page.getByRole('menuitem', { name: 'Rename document…', exact: true })).toBeFocused();
        expect(errors).toEqual([]);
    });
}

for (const retained of [false, true]) {
    test(`Menu nested Popover: returns to its item before closing the menu; retained=${retained}`, async ({ page }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--nested-popover');
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        const trigger = page.getByRole('button', { name: 'Quick actions', exact: true });
        await trigger.press('Enter');
        const item = page.getByRole('menuitem', { name: 'Quick rename…', exact: true });
        await item.press('Enter');
        await expect(page.getByRole('textbox', { name: 'Document name', exact: true })).toBeFocused();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('[rdxPopoverPopup]')).toHaveCount(0);
        await expect(item).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(trigger).toBeFocused();
        expect(errors).toEqual([]);
    });
}

for (const retained of [false, true]) {
    test(`Menu nested Popover: hovering returns native Escape ownership to Menu; retained=${retained}`, async ({
        page
    }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--nested-popover');
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        await page.getByRole('button', { name: 'Quick actions', exact: true }).press('Enter');
        await page.getByRole('menuitem', { name: 'Quick rename…', exact: true }).press('Enter');
        await expect(page.getByRole('textbox', { name: 'Document name', exact: true })).toBeFocused();
        const item = (await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).boundingBox())!;
        // Move across the item: the menu intentionally ignores a stationary first pointer event.
        await page.mouse.move(item.x + 4, item.y + item.height / 2);
        await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 3 });
        await expect(page.getByRole('menuitem', { name: 'Duplicate', exact: true })).toBeFocused();
        await expect(page.locator('[rdxPopoverPopup]')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(page.locator('[rdxPopoverPopup]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Quick actions', exact: true })).toBeFocused();
        expect(errors).toEqual([]);
    });
}

for (const modal of [false, true]) {
    for (const retained of [false, true]) {
        test(`Menu inside Popover: layered focus, selection and outside dismissal; modal=${modal}, retained=${retained}`, async ({
            page
        }) => {
            const errors = collectRuntimeDiagnostics(page);
            await gotoStory(page, 'primitives-menu--in-popover');
            if (modal) await page.getByRole('checkbox', { name: 'Modal popover', exact: true }).check();
            if (retained) await page.getByRole('checkbox', { name: 'Keep menu mounted', exact: true }).check();
            const hostTrigger = page.getByRole('button', { name: 'Workspace tools', exact: true });
            await hostTrigger.click();
            await expect(page.getByRole('textbox', { name: 'Workspace name', exact: true })).toBeFocused();
            const trigger = page.getByRole('button', { name: 'Actions', exact: true });
            await trigger.press('Enter');
            await expect(page.getByRole('menuitem', { name: 'Rename', exact: true })).toBeFocused();
            await page.getByRole('menuitem', { name: 'Share', exact: true }).press('ArrowRight');
            await expect(page.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeFocused();
            await page.keyboard.press('Escape');
            await expect(page.getByRole('menuitem', { name: 'Share', exact: true })).toBeFocused();
            await page.keyboard.press('Escape');
            await expect(trigger).toBeFocused();
            await expect(page.getByRole('dialog')).toBeVisible();
            await trigger.click();
            await page.getByRole('menuitem', { name: 'Rename', exact: true }).click();
            await expect(page.locator('output').first()).toHaveText('Selected: Rename');
            await expect(trigger).toBeFocused();
            await expect(page.getByRole('dialog')).toBeVisible();
            await trigger.click();
            await expect(page.getByRole('menu')).toBeVisible();
            await page.mouse.click(5, 5);
            await expect(page.getByRole('menu')).toHaveCount(0);
            if (modal) {
                await expect(page.getByRole('dialog')).toBeVisible();
                await expect(trigger).toBeFocused();
                await page.mouse.click(5, 5);
            }
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(hostTrigger).toBeFocused();
            expect(errors).toEqual([]);
        });
    }
}

test('Menu inside Popover: deferred completion preserves focus in the host', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--in-popover');
    await page.getByRole('checkbox', { name: 'Keep menu mounted', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Defer menu exit', exact: true }).check();
    await page.getByRole('button', { name: 'Workspace tools', exact: true }).click();
    await page.getByRole('button', { name: 'Actions', exact: true }).press('Enter');
    await expect(page.locator('output').last()).toHaveText('Menu completed: open');
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]').first()).toHaveAttribute('data-ending-style', '');
    await expect(page.getByRole('dialog')).toBeVisible();
    const finish = page.getByRole('button', { name: 'Finish menu exit', exact: true });
    await finish.press('Enter');
    await expect(page.locator('output').last()).toHaveText('Menu completed: open → closed');
    await expect(page.locator('[rdxMenuPopup]').first()).toBeHidden();
    await expect(finish).toBeFocused();
    await page.getByRole('button', { name: 'Close workspace', exact: true }).press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(errors).toEqual([]);
});

for (const retained of [false, true]) {
    test(`Menu opens Dialog: keeps focus through menu completion and returns to its trigger, retained=${retained}`, async ({
        page
    }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--open-dialog');
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        const trigger = page.getByRole('button', { name: 'Document actions', exact: true });
        await trigger.press('Enter');
        await expect(page.locator('output')).toHaveText('Menu completed: open');
        await page.getByRole('menuitem', { name: 'Rename document…', exact: true }).press('Enter');
        const field = page.getByRole('textbox', { name: 'Document name', exact: true });
        await expect(field).toBeFocused();
        await expect(page.locator('output')).toHaveText('Menu completed: open → closed');
        await expect(field).toBeFocused();
        await page.getByRole('button', { name: 'Cancel', exact: true }).press('Enter');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.press('Enter');
        await expect(page.getByRole('menuitem', { name: 'Rename document…', exact: true })).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('Menu opens Dialog: deferred menu completion preserves deliberate dialog focus', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--open-dialog');
    await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Defer menu exit', exact: true }).check();
    const trigger = page.getByRole('button', { name: 'Document actions', exact: true });
    await trigger.press('Enter');
    await expect(page.locator('output')).toHaveText('Menu completed: open');
    await page.getByRole('menuitem', { name: 'Rename document…', exact: true }).press('Enter');
    await expect(page.getByRole('textbox', { name: 'Document name', exact: true })).toBeFocused();
    await expect(page.locator('[rdxMenuPopup]')).toHaveAttribute('data-ending-style', '');
    await expect(page.locator('output')).toHaveText('Menu completed: open');
    const finish = page.getByRole('button', { name: 'Finish menu exit', exact: true });
    await finish.press('Enter');
    await expect(page.locator('output')).toHaveText('Menu completed: open → closed');
    await expect(finish).toBeFocused();
    await page.getByRole('button', { name: 'Cancel', exact: true }).press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

for (const retained of [false, true]) {
    test(`Menu inside Dialog: Escape and backdrop close one layer at a time, retained=${retained}`, async ({
        page
    }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--in-dialog');
        const dialogTrigger = page.getByRole('button', { name: 'Open workspace', exact: true });
        await dialogTrigger.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        const trigger = page.getByRole('button', { name: 'Actions', exact: true });
        await trigger.press('Enter');
        await expect(page.getByRole('menuitem', { name: 'Rename', exact: true })).toBeFocused();
        await page.getByRole('menuitem', { name: 'Share', exact: true }).press('ArrowRight');
        await expect(page.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menuitem', { name: 'Share', exact: true })).toBeFocused();
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect(dialog).toBeVisible();
        await trigger.click();
        await expect(page.getByRole('menuitem', { name: 'Rename', exact: true })).toBeVisible();
        await page.mouse.click(5, 5);
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(dialog).toBeVisible();
        await expect(trigger).toBeFocused();
        await page.mouse.click(5, 5);
        await expect(dialog).toHaveCount(0);
        await expect(dialogTrigger).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('Menu inside Dialog: completes a deferred retained exit without closing its host', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--in-dialog');
    await page.getByRole('button', { name: 'Open workspace', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Defer menu exit', exact: true }).check();
    await page.getByRole('button', { name: 'Actions', exact: true }).press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Rename', exact: true })).toBeFocused();
    await expect(page.locator('output').last()).toHaveText('Completed: open');
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]').first()).toHaveAttribute('data-ending-style', '');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('output').last()).toHaveText('Completed: open');
    const finish = page.getByRole('button', { name: 'Finish menu exit', exact: true });
    await finish.press('Enter');
    await expect(page.locator('output').last()).toHaveText('Completed: open → closed');
    await expect(page.locator('[rdxMenuPopup]').first()).toBeHidden();
    await expect(finish).toBeFocused();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(errors).toEqual([]);
});

const trigger = '[rdxMenuTrigger]';
const popup = '[rdxMenuPopup]';

for (const retained of [false, true]) {
    test(`Menu switch during exit: model/handle reopening with keepMounted=${retained}`, async ({ page }) => {
        const errors = collectRuntimeDiagnostics(page);
        await gotoStory(page, 'primitives-menu--switch-during-exit');
        if (retained) await page.getByLabel('Keep mounted', { exact: true }).check();
        await page.getByRole('button', { name: 'Inbox', exact: true }).click();
        await expect(page.getByRole('menuitem', { name: 'New message', exact: true })).toBeVisible();
        await expect(page.locator('output')).toHaveText('Completed: open');
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveAttribute('data-ending-style', '');
        await expect(page.locator('output')).toHaveText('Completed: open');
        await page.getByRole('button', { name: 'Open Archive', exact: true }).click();
        await expect(page.getByRole('menuitem', { name: 'Restore message', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Archive', exact: true })).toHaveAttribute(
            'aria-expanded',
            'true'
        );
        await expect(page.locator('output')).toHaveText('Completed: open → open');
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(page.locator(popup)).toHaveAttribute('data-ending-style', '');
        await page.getByRole('button', { name: 'Open Inbox', exact: true }).click();
        await expect(page.getByRole('menuitem', { name: 'New message', exact: true })).toBeVisible();
        await expect(page.locator('output')).toHaveText('Completed: open → open → open');
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(page.locator(popup)).toHaveAttribute('data-ending-style', '');
        await page.getByRole('button', { name: 'Finish exit', exact: true }).press('Enter');
        if (retained) await expect(page.locator(popup)).toBeHidden();
        else await expect(page.locator(popup)).toHaveCount(0);
        await expect(page.locator('output')).toHaveText('Completed: open → open → open → closed');
        await expect(page.getByRole('button', { name: 'Finish exit', exact: true })).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('Menu item highlight: previews keyboard, explicit labels, disabled hover and clearing', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--item-highlight');
    const trigger = page.getByRole('button', { name: 'Command preview', exact: true });
    const output = page.locator('output');
    await trigger.press('Enter');
    await expect(output).toContainText('Highlighted: Open file');
    await page.keyboard.press('ArrowDown');
    await expect(output).toContainText('Highlighted: Save file');
    await expect(output).toContainText('Reason: keyboard');
    await page.keyboard.press('e');
    await expect(output).toContainText('Highlighted: Export document');
    const print = (await page.getByRole('menuitem', { name: 'Print document', exact: true }).boundingBox())!;
    // The first zero-delta move has no known cursor origin; travel across the item before asserting hover.
    await page.mouse.move(print.x + 4, print.y + print.height / 2);
    await page.mouse.move(print.x + print.width / 2, print.y + print.height / 2, { steps: 3 });
    await expect(output).toContainText('Highlighted: Print document');
    await expect(output).toContainText('Reason: pointer');
    await page.getByRole('menuitem', { name: 'Save file', exact: true }).hover();
    await expect(output).toContainText('Highlighted: Save file');
    await expect(output).toContainText('Reason: pointer');
    await page.mouse.move(5, 5);
    await expect(output).toContainText('Highlighted: none');
    await expect(output).toContainText('Reason: pointer');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

function collectRuntimeDiagnostics(page: Page): string[] {
    const diagnostics: string[] = [];
    page.on('pageerror', (error) => diagnostics.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' || /NG095[36]/.test(message.text())) diagnostics.push(message.text());
    });
    return diagnostics;
}

test('Menu Viewport: measures the live content wrapper when its item list expands', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--viewport');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const menu = page.getByRole('menu');
    const first = (await menu.boundingBox())!;
    await page.getByRole('menuitem', { name: 'Show advanced', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'API tokens', exact: true })).toBeVisible();
    await expect.poll(async () => (await menu.boundingBox())!.height).toBeGreaterThan(first.height + 80);
    await page.getByRole('menuitem', { name: 'Hide advanced', exact: true }).click();
    await expect.poll(async () => Math.abs((await menu.boundingBox())!.height - first.height)).toBeLessThan(2);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
});

test('detached triggers: active payload, ARIA, keyboard selection and return focus', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--multiple-triggers');
    const library = page.getByRole('button', { name: 'Library', exact: true });
    const playback = page.getByRole('button', { name: 'Playback', exact: true });
    await library.click();
    await expect(page.getByRole('menuitem', { name: 'Add to library', exact: true })).toBeVisible();
    await playback.click();
    await expect(library).toHaveAttribute('aria-expanded', 'false');
    await expect(library).not.toHaveAttribute('aria-controls');
    await expect(playback).toHaveAttribute('data-popup-open', '');
    await expect(page.getByRole('menuitem', { name: 'Play now', exact: true })).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Play now', exact: true })).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(page.locator('output')).toHaveText('Last action: Sleep timer');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(playback).toBeFocused();
    expect(errors).toEqual([]);
});

test('detached triggers: external open and controlled trigger switching', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--controlled-triggers');
    await page.getByRole('button', { name: 'Open playback (controlled)', exact: true }).click();
    const playback = page.getByRole('button', { name: 'Playback', exact: true });
    await expect(playback).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menuitem', { name: 'Play now', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Create playlist', exact: true })).toBeVisible();
    await expect(playback).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Close menu', exact: true }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.locator('[data-rdx-focus-guard]')).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('detached triggers: animated position, size and content keep live items interactive', async ({ page }) => {
    const errors = collectRuntimeDiagnostics(page);
    await gotoStory(page, 'primitives-menu--animated-triggers');
    const library = page.getByRole('button', { name: 'Library', exact: true });
    const playback = page.getByRole('button', { name: 'Playback', exact: true });
    const share = page.getByRole('button', { name: 'Share', exact: true });
    const menu = page.getByRole('menu');
    await library.click();
    await expect(page.getByRole('menuitem', { name: 'Create station', exact: true })).toBeVisible();
    await expect(menu).not.toHaveAttribute('data-starting-style');
    const first = (await menu.boundingBox())!;
    await playback.click();
    await expect(page.getByRole('menuitem', { name: 'Sleep timer', exact: true })).toBeVisible();
    await expect.poll(async () => (await menu.boundingBox())!.width).toBeGreaterThan(first.width + 30);
    await expect.poll(async () => (await menu.boundingBox())!.height).toBeGreaterThan(first.height + 20);
    await expect(page.locator('[rdxMenuViewport] > [data-previous]')).toHaveCount(0);
    const larger = (await menu.boundingBox())!;
    await share.click();
    await expect(page.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeVisible();
    await expect.poll(async () => (await menu.boundingBox())!.width).toBeLessThan(larger.width - 20);
    await expect
        .poll(async () => {
            const anchor = (await share.boundingBox())!,
                content = (await menu.boundingBox())!;
            return Math.abs(anchor.x - content.x);
        })
        .toBeLessThan(2);
    await expect(page.locator('[rdxMenuViewport] > [data-previous]')).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('output')).toHaveText('Last action: Copy link');
    await expect(share).toBeFocused();
    expect(errors).toEqual([]);
});

for (const layer of ['Parent', 'Child']) {
    for (const mode of ['callback-default', 'callback-skip']) {
        test(`Menu return callback: ${layer} ${mode}`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await gotoStory(page, 'primitives-menu--focus-return');
            await page.getByLabel(`${layer} return focus`, { exact: true }).selectOption(mode);
            const primary = page.getByRole('button', { name: 'Focus policies', exact: true });
            const more = page.getByRole('menuitem', { name: 'More commands', exact: true });
            for (let session = 0; session < 2; session++) {
                await primary.press('Enter');
                await expect(more).toBeFocused();
                if (layer === 'Child') {
                    await page.keyboard.press('ArrowRight');
                    await expect(page.getByRole('menuitem', { name: 'Run command', exact: true })).toBeFocused();
                }
                await page.keyboard.press('Escape');
                await expect(
                    page.getByText(
                        `Return callback: keyboard → ${mode === 'callback-default' ? 'default target' : 'skip return'}`,
                        { exact: true }
                    )
                ).toBeVisible();
                if (mode === 'callback-default') await expect(layer === 'Parent' ? primary : more).toBeFocused();
                else {
                    // A queued trigger autofocus used to run after the child had honored the veto.
                    // Check pending frames so an early body focus cannot hide that later focus move.
                    await page.evaluate(
                        () =>
                            new Promise<void>((resolve) =>
                                requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                            )
                    );
                    await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
                }
                if (layer === 'Child') await primary.click();
                await expect(primary).toHaveAttribute('aria-expanded', 'false');
                await expect(page.locator(`${popup}:visible`)).toHaveCount(0);
                await expect(page.locator('[data-rdx-focus-guard]')).toHaveCount(0);
            }
            expect(errors).toEqual([]);
        });
    }
}

for (const mode of [
    'root none',
    'root custom',
    'root custom Tab',
    'child none',
    'child custom',
    'child custom Shift+Tab',
    'veto child Shift+Tab',
    'veto parent Tab',
    'veto both Tab'
] as const) {
    test(`Menu return focus: ${mode}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--focus-return');
        const nested = mode.startsWith('child') || mode.startsWith('veto');
        if (mode.includes('none') || mode.includes('custom'))
            await page
                .getByLabel(nested ? 'Child return focus' : 'Parent return focus', { exact: true })
                .selectOption(mode.includes('none') ? 'none' : 'custom');
        if (mode.startsWith('veto')) {
            if (mode.includes('parent') || mode.includes('both'))
                await page.getByLabel('Cancel parent focus-out', { exact: true }).check();
            if (mode.includes('child') || mode.includes('both'))
                await page.getByLabel('Cancel child focus-out', { exact: true }).check();
        }
        const primary = page.getByRole('button', { name: 'Focus policies', exact: true });
        const more = page.getByRole('menuitem', { name: 'More commands', exact: true });
        const child = page.getByRole('menuitem', { name: 'Run command', exact: true });
        for (let session = 0; session < 2; session++) {
            await primary.press('Enter');
            await expect(more).toBeFocused();
            await expect(more).toHaveAttribute('tabindex', '0');
            await expect(page.locator(popup).filter({ has: more })).not.toHaveAttribute('data-starting-style', '');
            if (nested) {
                await page.keyboard.press('ArrowRight');
                await expect(child).toBeFocused();
                await expect(child).toHaveAttribute('tabindex', '0');
                await expect(page.locator(popup).filter({ has: child })).not.toHaveAttribute('data-starting-style', '');
            }
            await page.keyboard.press(
                mode.endsWith('Shift+Tab') ? 'Shift+Tab' : mode.endsWith('Tab') ? 'Tab' : 'Escape'
            );
            if (mode === 'veto child Shift+Tab') await expect(child).toBeFocused();
            else if (mode === 'veto parent Tab' || mode === 'veto both Tab') {
                await expect(more).toBeFocused();
                if (mode === 'veto both Tab') await expect(child).toBeVisible();
                else await expect(child).toBeHidden();
            } else if (mode.endsWith('none')) {
                await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
            } else if (mode === 'root custom Tab')
                await expect(page.getByRole('button', { name: 'After menu', exact: true })).toBeFocused();
            else if (nested)
                await expect(page.getByRole('textbox', { name: 'Child return target', exact: true })).toBeFocused();
            else await expect(page.getByRole('button', { name: 'Return target', exact: true })).toBeFocused();
            await expect(primary).toHaveAttribute('aria-expanded', nested ? 'true' : 'false');
            if (nested) await primary.click();
            await expect(primary).toHaveAttribute('aria-expanded', 'false');
            await expect(page.locator(`${popup}:visible`)).toHaveCount(0);
            await expect(page.locator('[data-rdx-focus-guard]')).toHaveCount(0);
        }
        expect(errors).toEqual([]);
    });
}

for (const retained of [false, true]) {
    for (const backward of [false, true]) {
        test(`Menu submenu Tab departure: retained=${retained}, backward=${backward}`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            page.on('console', (message) => {
                if (message.type() === 'error') errors.push(message.text());
            });
            await gotoStory(page, 'primitives-menu--initial-focus');
            await page.getByLabel('Nested menu', { exact: true }).check();
            if (retained) await page.getByLabel('Keep mounted', { exact: true }).check();
            const primary = page.getByRole('button', { name: 'Actions', exact: true });
            const more = page.getByRole('menuitem', { name: 'More commands', exact: true });
            const child = page.getByRole('menuitem', { name: 'Second child command', exact: true });
            const enter = async () => {
                await primary.press('Enter');
                await expect(more).toBeFocused();
                await page.keyboard.press('ArrowRight');
                await expect(child).toBeFocused();
                await expect(child).toHaveAttribute('tabindex', '0');
            };
            await enter();
            if (retained) {
                await page.keyboard.press('Escape');
                await expect(more).toBeFocused();
                await page.keyboard.press('Escape');
                await expect(primary).toBeFocused();
                await enter();
            }
            await page.keyboard.press(backward ? 'Shift+Tab' : 'Tab');
            if (backward) {
                await expect(more).toBeFocused();
                await expect(child).toBeHidden();
                await expect(primary).toHaveAttribute('aria-expanded', 'true');
                await page.keyboard.press('Escape');
            } else await expect(page.getByRole('button', { name: 'After menu', exact: true })).toBeFocused();
            await expect(primary).toHaveAttribute('aria-expanded', 'false');
            await expect(page.locator(`${popup}:visible`)).toHaveCount(0);
            await expect(page.locator('[data-rdx-focus-guard]')).toHaveCount(0);
            if (retained) {
                await expect(page.locator(`${popup} [role^="menuitem"][tabindex="0"]`)).toHaveCount(0);
            }
            expect(errors).toEqual([]);
        });
    }
}

for (const mode of ['Enter', 'Space', 'ArrowDown', 'ArrowUp', 'all disabled', 'retained'] as const) {
    test(`Menu initial focus: ${mode}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--initial-focus');
        if (mode === 'all disabled') await page.getByLabel('All items disabled', { exact: true }).check();
        if (mode === 'retained') await page.getByLabel('Keep mounted', { exact: true }).check();
        const primary = page.getByRole('button', { name: 'Actions', exact: true });
        await primary.press(mode === 'all disabled' || mode === 'retained' ? 'Enter' : mode);
        const first = page.locator('[rdxMenuItem]').filter({ hasText: 'First command' });
        const second = page.locator('[rdxMenuItem]').filter({ hasText: 'Second command' });
        if (mode === 'all disabled') {
            await expect(page.locator(popup)).toBeFocused();
            await expect(page.locator('[data-highlighted]')).toHaveCount(0);
            await page.keyboard.press('ArrowDown');
        } else {
            await expect(second).toBeFocused();
            await expect(first).toHaveAttribute('tabindex', '-1');
            await page.keyboard.press('Home');
        }
        await expect(first).toBeFocused();
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        await expect(page.locator('output')).toHaveText('Selected: none');
        await page.keyboard.press('Escape');
        await expect(primary).toBeFocused();
        if (mode === 'retained') {
            await expect(page.locator(popup)).toBeHidden();
            await expect(first).toHaveAttribute('tabindex', '-1');
            await expect(second).toHaveAttribute('tabindex', '-1');
            await primary.press('Enter');
            await expect(second).toBeFocused();
            await expect(first).toHaveAttribute('tabindex', '-1');
            await expect(second).toHaveAttribute('tabindex', '0');
            await page.keyboard.press('Tab');
            await expect(page.locator(popup)).toBeHidden();
        } else await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}

for (const mode of [
    'button Enter',
    'button Space',
    'custom Enter',
    'link Enter',
    'modified Space',
    'typeahead Space'
] as const) {
    test(`native Menu elements: ${mode}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        if (mode === 'typeahead Space') await page.clock.install();
        await gotoStory(page, 'primitives-menu--native-elements');
        await page.getByRole('button', { name: 'Actions', exact: true }).press('Enter');
        const itemName = mode.startsWith('button')
            ? 'Button command'
            : mode === 'custom Enter'
              ? 'Custom command'
              : 'Open section';
        const item = page.getByRole('menuitem', { name: itemName, exact: true });
        for (let index = 0; index < 3 && !(await item.evaluate((el) => el === document.activeElement)); index++)
            await page.keyboard.press('ArrowDown');
        await expect(item).toBeFocused();
        const clicks = await page.evaluateHandle(() => {
            const records: { ctrl: boolean; trusted: boolean }[] = [];
            document.addEventListener(
                'click',
                (event) => {
                    if (!(event.target instanceof Element) || !event.target.closest('[role="menuitem"]')) return;
                    records.push({ ctrl: event.ctrlKey, trusted: event.isTrusted });
                    if (event.ctrlKey) event.preventDefault(); // Application navigation guard for this test.
                },
                true
            );
            return records;
        });
        if (mode === 'typeahead Space') {
            await page.keyboard.press('o');
            await page.keyboard.press('Space');
            await expect(page.locator('output')).toHaveText('Selected: none');
            expect(await clicks.evaluate((records) => records.length)).toBe(0);
            await page.clock.runFor(1100);
        }
        await page.keyboard.press(
            mode === 'modified Space' ? 'Control+Space' : mode.endsWith('Space') ? 'Space' : 'Enter'
        );
        await expect(page.locator('output')).toHaveText(`Selected: ${itemName}`);
        expect(await clicks.evaluate((records) => records.length)).toBe(1);
        if (mode === 'modified Space')
            expect(await clicks.evaluate((records) => records[0])).toEqual({ ctrl: true, trusted: false });
        if (mode === 'link Enter' || mode === 'typeahead Space')
            await expect.poll(() => page.evaluate(() => location.hash)).toBe('#menu-native-target');
        if (mode.startsWith('button') || mode.startsWith('custom')) await expect(page.locator(popup)).toHaveCount(0);
        else await expect(page.locator(popup)).toBeVisible();
        await clicks.dispose();
        expect(errors).toEqual([]);
    });
}

for (const mode of [
    'toggle',
    'disabled',
    'submenu',
    'submenu RTL',
    'submenu Enter',
    'submenu Space',
    'submenu Arrow'
] as const) {
    test(`trusted touch ${mode} works in the public Menu examples`, async ({ browser, baseURL }) => {
        test.skip(browser.browserType().name() === 'firefox', 'Playwright Firefox does not support touch contexts');
        const page = await browser.newPage({ baseURL, hasTouch: true, viewport: { width: 1280, height: 800 } });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        try {
            await gotoStory(
                page,
                mode === 'submenu RTL'
                    ? 'primitives-menu--nested-rtl'
                    : mode.startsWith('submenu')
                      ? 'primitives-menu--nested'
                      : 'primitives-menu--default'
            );
            const primary = page.locator(trigger);
            await primary.tap();
            await expect(primary).toHaveAttribute('data-pressed', '');
            await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
            if (mode.startsWith('submenu')) {
                await page.locator('[rdxMenuSubTrigger]').first().tap();
                await expect(page.locator(`${popup}[data-open]`)).toHaveCount(2);
                await expect(page.locator(`${popup}[data-open]`).last()).toHaveAttribute(
                    'data-side',
                    mode === 'submenu RTL' ? 'left' : 'right'
                );
                if (mode === 'submenu Enter' || mode === 'submenu Space') {
                    await page.keyboard.press(mode === 'submenu Enter' ? 'Enter' : 'Space');
                    await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
                    await expect(page.locator('[rdxMenuSubTrigger]').first()).toBeFocused();
                    await primary.tap();
                } else if (mode === 'submenu Arrow') {
                    await page.keyboard.press('ArrowRight');
                    await expect(page.locator('[rdxMenuSubTrigger]').first()).toHaveAttribute('aria-expanded', 'true');
                    await expect(
                        page.locator(`${popup}[data-open]`).last().locator('[rdxMenuItem]').first()
                    ).toBeFocused();
                    await page.keyboard.press('Enter');
                } else await page.locator(`${popup}[data-open]`).last().locator('[rdxMenuItem]').first().tap();
            } else if (mode === 'disabled') {
                const box = (await page
                    .getByRole('menuitem', { name: 'New Private Window', exact: true })
                    .boundingBox())!;
                await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
                await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
                await page.getByRole('menuitem', { name: 'New Tab', exact: true }).tap();
            } else await primary.tap();
            await expect(page.locator(popup)).toHaveCount(0);
            await expect(primary).not.toHaveAttribute('data-pressed', '');
            expect(errors).toEqual([]);
        } finally {
            await page.close();
        }
    });
}

for (const mode of ['root', 'submenu', 'canceled submenu'] as const) {
    test(`async ${mode} keeps keyboard ownership through loading and retained close`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await page.clock.install();
        await gotoStory(page, mode === 'root' ? 'primitives-menu--async-items' : 'primitives-menu--async-submenu');
        const primary = page.locator(trigger);
        const loading = page.getByRole('status').filter({ hasText: 'Loading documents…' });
        if (mode === 'root') {
            await pauseClockBeforeInteraction(page);
            await primary.press('ArrowDown');
            await page.clock.runFor(100);
            await expect(loading).toHaveText('Loading documents…');
            await page.keyboard.press('ArrowDown');
            await page.clock.runFor(700);
            await page.clock.resume();
            await expect(page.getByRole('menuitem', { name: 'Project notes', exact: true })).toBeVisible();
            await expect(page.getByRole('menu', { name: 'Recent documents', exact: true })).toBeFocused();
            await page.keyboard.press('ArrowDown');
        } else {
            await primary.press('Enter');
            await expect(page.getByRole('menuitem', { name: 'New document', exact: true })).toBeFocused();
            await page.keyboard.press('ArrowDown');
            const more = page.getByRole('menuitem', { name: 'Recent documents', exact: true });
            await expect(more).toBeFocused();
            const box = (await more.boundingBox())!;
            await pauseClockBeforeInteraction(page);
            if (mode === 'submenu') {
                await page.mouse.move(box.x + 4, box.y + box.height / 2);
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
                await page.clock.runFor(200);
                await expect(loading).toBeVisible();
                await page.keyboard.press('ArrowRight');
            } else {
                await page.keyboard.press('ArrowRight');
                await page.clock.runFor(100);
                await expect(loading).toBeVisible();
                await page.keyboard.press('Escape');
                await page.clock.runFor(1000);
                await expect(page.locator(`${popup}[data-open]`)).toHaveCount(1);
                await expect(page.locator('[rdxMenuItem]')).toHaveCount(1);
                await expect(more).toBeFocused();
                await page.keyboard.press('ArrowRight');
                await page.clock.runFor(100);
                await expect(loading).toBeVisible();
            }
            await page.clock.runFor(700);
            await page.clock.resume();
            await expect(page.getByRole('menuitem', { name: 'Project notes', exact: true })).toBeVisible();
            await expect(more).toBeFocused();
            await page.keyboard.press('ArrowRight');
        }
        await expect(page.getByRole('menuitem', { name: 'Project notes', exact: true })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('output')).toHaveText('Selected: Project notes');
        await expect(page.locator(`${popup}[data-open]`)).toHaveCount(0);
        await expect(primary).toBeFocused();
        expect(errors).toEqual([]);
    });
}

for (const press of [false, true]) {
    test(`hover menu uses its ${press ? 'press' : 'hover'} lifetime after leaving`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--pointer');
        await page.locator(trigger).hover();
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator(popup)).toBeFocused();
        await expect(page.locator('[data-highlighted]')).toHaveCount(0);
        if (press) {
            await page.locator(trigger).click();
            await expect(page.locator('body')).toHaveCSS('pointer-events', 'auto');
            await page.keyboard.press('ArrowDown');
            await expect(page.getByRole('menuitem', { name: 'New tab', exact: true })).toBeFocused();
        }
        await page.mouse.move(10, 10);
        if (press) {
            await page.waitForTimeout(200); // Beyond the authored 80ms hover close delay.
            await expect(page.locator(popup)).toBeVisible();
            await page.keyboard.press('Escape');
        }
        await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}

for (const disabled of [false, true]) {
    test(`press-drag-release ${disabled ? 'cannot activate a disabled' : 'selects an enabled'} command`, async ({
        page
    }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--pointer');
        const box = (await page.locator(trigger).boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await expect(page.locator(popup)).toBeVisible();
        await page.waitForTimeout(240);
        const item = (await page
            .getByRole('menuitem', { name: disabled ? 'Unavailable' : 'New tab', exact: true })
            .boundingBox())!;
        await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 3 });
        await page.mouse.up();
        await expect(page.locator('output')).toHaveText(disabled ? 'No command selected' : 'New tab');
        if (disabled) await expect(page.locator(popup)).toBeVisible();
        else await expect(page.locator(popup)).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}

for (const retained of [false, true]) {
    test(`deferred menu close completes once and preserves state only with keepMounted=${retained}`, async ({
        page
    }) => {
        await gotoStory(page, 'primitives-menu--lifecycle');
        await page.getByRole('checkbox', { name: 'Defer unmount', exact: true }).check();
        if (retained) await page.getByRole('checkbox', { name: 'Keep mounted', exact: true }).check();
        const opener = page.getByRole('button', { name: 'Menu lifecycle', exact: true });
        await opener.press('Enter');
        const notifications = page.getByRole('menuitemcheckbox', { name: /Notifications/ });
        await notifications.press('Space');
        await expect(notifications).toHaveAttribute('aria-checked', 'true');
        await expect(page.locator('output')).toHaveText('Completed: open');
        await page.keyboard.press('Escape');
        await expect(page.locator(popup)).toHaveAttribute('data-ending-style', '');
        await expect(page.locator(popup)).toBeVisible();
        await expect(page.locator('[rdxMenuPositioner]')).toHaveCSS('pointer-events', 'none');
        await expect(page.locator('output')).toHaveText('Completed: open');
        await page.getByRole('button', { name: 'Finish exit', exact: true }).click();
        await expect(page.locator('output')).toHaveText('Completed: open → closed');
        if (retained) await expect(page.locator(popup)).toBeHidden();
        else await expect(page.locator(popup)).toHaveCount(0);
        await page.getByRole('button', { name: 'Finish exit', exact: true }).click();
        await expect(page.locator('output')).toHaveText('Completed: open → closed');
        await opener.press('Enter');
        await expect(notifications).toHaveAttribute('aria-checked', String(retained));
        await expect(page.locator('output')).toHaveText('Completed: open → closed → open');
    });
}

test('canceling a menu close with both lifetime options enabled keeps items interactive', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--lifecycle');
    for (const name of ['Defer unmount', 'Keep mounted', 'Cancel next close'])
        await page.getByRole('checkbox', { name, exact: true }).check();
    await page.getByRole('button', { name: 'Menu lifecycle', exact: true }).press('Enter');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.locator('[rdxMenuItem]').first()).toBeFocused();
    const notifications = page.getByRole('menuitemcheckbox', { name: /Notifications/ });
    await notifications.click();
    await expect(notifications).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Finish exit', exact: true }).click();
    await expect(page.locator(popup)).toBeHidden();
    await expect(page.locator('output')).toHaveText('Completed: open → closed');
});

test('finishing an ancestor exit also completes a running submenu exit', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--lifecycle');
    await page.addStyleTag({
        content: '[data-testid="lifecycle-submenu"][data-closed] { animation-duration: 2s !important; }'
    });
    await page.getByRole('checkbox', { name: 'Defer unmount', exact: true }).check();
    await page.getByRole('button', { name: 'Menu lifecycle', exact: true }).press('Enter');
    await expect(page.locator('output')).toHaveText('Completed: open');
    await page.getByRole('menuitem', { name: 'More actions', exact: true }).press('ArrowRight');
    await page.getByRole('menuitem', { name: 'Archive', exact: true }).press('Enter');
    const submenu = page.getByTestId('lifecycle-submenu');
    await expect(submenu).toHaveAttribute('data-ending-style', '');
    await expect.poll(() => submenu.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Finish exit', exact: true }).click();
    await expect(page.locator(popup)).toHaveCount(0, { timeout: 1000 });
    await expect(page.locator('output')).toHaveText('Completed: open → closed');
});

for (const opening of ['keyboard', 'pointer']) {
    test(`${opening} opening preserves roving tabindex and Tab exits after the trigger`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--default');
        await page.evaluate(() => {
            const input = document.createElement('input');
            input.id = 'after-menu';
            input.setAttribute('aria-label', 'After menu');
            document.body.append(input);
        });
        const opener = page.locator(trigger).first();
        if (opening === 'keyboard') await opener.press('Enter');
        else await opener.click();
        const content = page.locator(popup);
        await expect(content).toBeVisible();
        if (opening === 'keyboard') await expect(page.locator(`${popup} [rdxMenuItem]`).first()).toBeFocused();
        else await expect(content).toBeFocused();
        await expect
            .poll(() => page.locator(`${popup} [role^="menuitem"][tabindex="0"]`).count())
            .toBe(opening === 'keyboard' ? 1 : 0);
        await expect
            .poll(async () => (await opener.getAttribute('aria-controls')) === (await content.getAttribute('id')))
            .toBe(true);
        await expect
            .poll(async () => (await content.getAttribute('aria-labelledby')) === (await opener.getAttribute('id')))
            .toBe(true);
        await page.keyboard.press('Tab');
        await expect(content).toHaveCount(0);
        await expect(page.locator('#after-menu')).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('canceled Escape keeps item focus and live ids preserve the open popup', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    await gotoStory(page, 'primitives-menu--events');
    await page.getByRole('checkbox', { name: 'Cancel next close' }).check();
    const opener = page.getByRole('button', { name: 'Menu events', exact: true });
    await opener.press('Enter');
    const first = page.getByRole('menuitem', { name: 'Run action', exact: true });
    await expect(first).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(first).toBeFocused();
    await expect(opener).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('output')).toHaveText('Last change: escape-key (canceled)');
    const oldPopup = await page.locator(popup).elementHandle();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(opener).toHaveAttribute('id', 'menu-events-trigger-updated');
    await expect(opener).toHaveAttribute('aria-controls', 'menu-events-popup-updated');
    await expect(page.locator(popup)).toHaveAttribute('aria-labelledby', 'menu-events-trigger-updated');
    expect(await oldPopup!.evaluate((el) => el.isConnected && el === document.querySelector('[rdxMenuPopup]'))).toBe(
        true
    );
    await page.keyboard.press('Escape');
    await expect(page.locator(popup)).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(errors).toEqual([]);
});

test('menu teleports the positioner directly into <body> with no wrapper element', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    const parentTag = await page.locator('[rdxMenuPositioner]').evaluate((el) => el.parentElement?.tagName);
    expect(parentTag).toBe('BODY');
});

test('menu locks page scrolling by default and releases it when closed', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    // `useScrollLock` marks `<html>` with `data-rdx-scroll-locked` (strategy-independent: the inset and
    // overlay-scrollbar strategies set different overflow properties, but both set the marker).
    const scrollLocked = () => page.locator('html').evaluate((el) => el.hasAttribute('data-rdx-scroll-locked'));

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    expect(await scrollLocked()).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
    expect(await scrollLocked()).toBe(false);
});

test('Enter opens the default menu, focuses the first item, and ArrowDown moves to the next item', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    const items = page.locator('[rdxMenuItem]');

    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await expect(items.first()).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
});

test('a modal menu renders an internal backdrop that blocks the background and is the outside-press target (finding #1)', async ({
    page
}) => {
    await gotoStory(page, 'primitives-menu--default');

    // A fixed background button in the far corner that must NOT receive clicks while the modal menu is
    // open — the internal backdrop has to intercept them.
    await page.evaluate(() => {
        const b = document.createElement('button');
        b.id = 'rdx-bg-btn';
        b.style.cssText = 'position:fixed; right:2px; top:2px; width:40px; height:40px';
        b.addEventListener('click', () => {
            (window as { __bgHits?: number }).__bgHits = ((window as { __bgHits?: number }).__bgHits || 0) + 1;
        });
        document.body.appendChild(b);
    });

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();
    await expect(page.locator('[data-rdx-menu-internal-backdrop]')).toHaveCount(1);

    // A press in the far corner lands on the backdrop (over the background button): the button must not
    // fire (background blocked) and the menu closes (the backdrop is the outside-press target).
    await page.mouse.click(10, 10);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as { __bgHits?: number }).__bgHits || 0)).toBe(0);
});

test('modal menu trigger stays interactive and closes the open menu on click', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await trigger.click();
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('a standalone menu closes when focus leaves to an unrelated element (finding #3)', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--default');
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    // A standalone menu does NOT trap focus (only a context menu does) — moving focus to an unrelated
    // element closes it.
    await page.evaluate(() => {
        const b = document.createElement('button');
        b.id = 'm-outside';
        document.body.appendChild(b);
        b.focus();
    });
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('animated menu keeps the popup mounted through the exit animation, then unmounts it', async ({ page }) => {
    await gotoStory(page, 'primitives-menu--animated');
    await page.addStyleTag({ content: '[rdxMenuPopup][data-closed] { animation-duration: 1200ms !important; }' });

    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(page.locator('[rdxMenuPositioner]')).toBeVisible();
    await page.locator('[rdxMenuPopup]').evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((animation) => animation.finished));
    });

    // Close with Escape; the popup's actual CSS exit keeps the portal mounted.
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxMenuPositioner]')).toHaveAttribute('data-closed', '');
    await expect
        .poll(() => page.locator('[rdxMenuPopup]').evaluate((el) => el.getAnimations().length))
        .toBeGreaterThan(0);

    // Once the exit animation finishes, presence destroys the view — no orphan in <body>.
    await expect(page.locator('[rdxMenuPositioner]')).toHaveCount(0);
    await expect(page.locator('[rdxMenuPopup]')).toHaveCount(0);
});

test('a keepMounted menu stays in the DOM while closed but is hidden (not in layout / tab order)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await gotoStory(page, 'primitives-menu--keep-mounted');
    const positioner = page.locator('[rdxMenuPositioner]');

    // Closed: the popup is teleported into <body> (kept mounted) but the native `hidden` removes it from
    // layout and the a11y / tab order — so it is present but not visible.
    await expect(positioner).toHaveCount(1);
    await expect(positioner).toHaveAttribute('hidden', '');
    await expect(positioner).toBeHidden();

    // Open: the `hidden` is dropped and the popup positions and shows.
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(positioner).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    // Close via Escape: focus returns to the trigger (the unmount-driven return never runs while kept
    // mounted — finding #3), and the popup hides again while staying in the DOM.
    await page.keyboard.press('Escape');
    await expect(positioner).toHaveAttribute('hidden', '');
    await expect(page.locator('[rdxMenuTrigger]')).toBeFocused();
    await expect(positioner).toHaveCount(1);

    // No endless positioning rAF loop / runtime errors while closed-and-mounted (finding #2).
    await page.waitForTimeout(200);
    expect(errors).toEqual([]);
});

test('a keepMounted modal menu builds no internal backdrop while closed (stale-cutout regression)', async ({
    page
}) => {
    await gotoStory(page, 'primitives-menu--keep-mounted');
    const backdrop = page.locator('[data-rdx-menu-internal-backdrop]');

    // Closed: even though the positioner is kept mounted, the modal backdrop must NOT exist yet. If it
    // were built now it would capture a stale cutout rect (the trigger's position at page load) and,
    // once the page scrolls, cover the trigger — so the opening press would land on the backdrop and
    // close the menu again. The backdrop's lifetime is gated on the menu being present.
    await expect(backdrop).toHaveCount(0);

    // Open: the backdrop is created now, against the trigger's current rect, so its cutout keeps the
    // trigger clickable rather than covering it.
    await page.locator('[rdxMenuTrigger]').first().click();
    await expect(backdrop).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(backdrop).toHaveCount(0);
});

test('a keepMounted menu stays open on a real trigger press even when the page has scrolled', async ({ page }) => {
    // Reproduces the docs-page report: on a long, scrolled page the kept-mounted popup opens on
    // pointerdown, then the trigger `mouseup` closed it again. Root cause was a stale modal-backdrop
    // cutout covering the trigger. Uses the docs view (every story stacked → a tall, scrolled page) and
    // a real press (down → hold → up), which a fast synthetic `click()` does not surface.
    await page.goto('/iframe.html?id=primitives-menu--docs&viewMode=docs');
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('rdx-menu-keep-mounted [rdxMenuTrigger]').first();
    await trigger.scrollIntoViewIfNeeded();
    const box = (await trigger.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    await page.mouse.move(cx, cy, { steps: 4 });
    await page.mouse.down();
    await page.waitForTimeout(90); // human press duration; lets change detection build the backdrop
    // While held, the backdrop must not cover the trigger point (else `mouseup` lands on it).
    const underPoint = await page.evaluate(
        ([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-rdx-menu-internal-backdrop]'),
        [cx, cy]
    );
    expect(underPoint, 'internal backdrop must not cover the trigger').toBe(false);
    await page.mouse.up();

    // After the full press the menu stays open.
    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(1);
});

test('a press released a few pixels off the trigger keeps the menu open', async ({ page }) => {
    // The trigger arms a document `mouseup` guard that cancels the just-opened menu when the release
    // lands elsewhere. A quick press whose pointer drifts a couple of pixels is still a release on the
    // trigger, so the guard tolerates a small offset (`isMouseWithinBounds`).
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    const box = (await trigger.boundingBox())!;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await page.mouse.down();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await page.mouse.move(box.x + box.width + 3, box.y + box.height / 2, { steps: 2 });
    await page.mouse.up();

    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(1);
});

test('a release over the trigger’s decorative pseudo-element keeps the menu open', async ({ page }) => {
    // A `::after` that renders past the trigger and takes no pointer events (a ring, a larger hit
    // target) leaves the release with the *page* as its target while visually still on the trigger.
    // The bounds check reads the pseudo-element's box, so such a release does not cancel the menu.
    // Invisible to the unit suite: jsdom has no layout and throws on `getComputedStyle(el, '::after')`.
    await gotoStory(page, 'primitives-menu--default');
    await page.addStyleTag({
        content: `[rdxMenuTrigger] { position: relative }
                  [rdxMenuTrigger]::after { content: ''; position: absolute; inset: -20px; pointer-events: none }`
    });

    const trigger = page.locator('[rdxMenuTrigger]').first();
    const box = (await trigger.boundingBox())!;
    const releaseX = box.x + box.width + 12;
    const releaseY = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width / 2, releaseY, { steps: 4 });
    await page.mouse.down();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    // The release point is outside the trigger's own box but inside the pseudo-element's.
    const targetIsTrigger = await page.evaluate(
        ([x, y]) => !!document.elementFromPoint(x, y)?.closest('[rdxMenuTrigger]'),
        [releaseX, releaseY]
    );
    expect(targetIsTrigger, 'release point must not hit the trigger itself').toBe(false);

    await page.mouse.move(releaseX, releaseY, { steps: 2 });
    await page.mouse.up();

    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(1);
});

test('a press released far from the trigger cancels the just-opened menu', async ({ page }) => {
    // The counterpart of the two checks above: the document `mouseup` guard must still fire when the
    // release is a genuine "changed my mind" drag-off, otherwise those two prove nothing.
    await gotoStory(page, 'primitives-menu--default');

    const trigger = page.locator('[rdxMenuTrigger]').first();
    const box = (await trigger.boundingBox())!;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await page.mouse.down();
    await expect(page.locator('[rdxMenuPopup]')).toBeVisible();

    await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, { steps: 4 });
    expect(
        await page.evaluate(
            ([x, y]) => document.elementFromPoint(x, y)?.hasAttribute('data-rdx-menu-internal-backdrop'),
            [box.x + box.width + 200, box.y + box.height / 2]
        )
    ).toBe(true);
    await page.mouse.up();

    await expect(page.locator('[rdxMenuPopup][data-open]')).toHaveCount(0);
});

for (const action of ['nested keyboard', 'selection and reopen']) {
    test(`projected composition: ${action}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        await gotoStory(page, 'primitives-menu--composition');
        const primary = page.getByRole('button', { name: 'Menu actions', exact: true });
        await primary.press('Enter');
        const refresh = page.getByRole('menuitem', { name: 'Refresh', exact: true });
        const rename = page.getByRole('menuitem', { name: 'Rename', exact: true });
        const more = page.getByRole('menuitem', { name: 'More options', exact: true });
        await expect(refresh).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(rename).toBeFocused();
        await expect(rename).toHaveAttribute('data-highlighted', '');
        await expect(rename).toHaveAttribute('tabindex', '0');
        if (action === 'nested keyboard') {
            await page.keyboard.press('ArrowDown');
            const disabled = page.getByRole('menuitem', { name: 'Unavailable', exact: true });
            await expect(disabled).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(page.locator('output')).toHaveText('Last action: None');
            await page.keyboard.press('ArrowDown');
            await expect(more).toBeFocused();
            await page.keyboard.press('ArrowRight');
            await expect(page.getByRole('menuitem', { name: 'Export file', exact: true })).toBeFocused();
            await expect(refresh).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(more).toBeFocused();
            await page.keyboard.press('Escape');
        } else {
            await page.keyboard.press('Enter');
            await expect(page.locator('output')).toHaveText('Last action: Rename');
            await expect(primary).toBeFocused();
            await primary.press('Enter');
            await expect(refresh).toBeFocused();
            await page.keyboard.press('End');
            await expect(page.getByRole('menuitem', { name: 'Remove', exact: true })).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(page.locator('output')).toHaveText('Last action: Remove');
        }
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(primary).toBeFocused();
        expect(errors).toEqual([]);
    });
}
