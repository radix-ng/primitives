import { expect, test } from '@playwright/test';

test('Accordion array two-way binding accepts requests and honors cancellation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--controlled&viewMode=story');
    const first = page.getByRole('button', { name: 'First', exact: true });
    const second = page.getByRole('button', { name: 'Second', exact: true });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('type', 'button');
    await page.getByRole('checkbox', { name: 'Block changes' }).check();
    await second.press('Enter');
    await expect(page.getByTestId('accordion-value')).toHaveText('Selected: First');
    await expect(page.getByTestId('accordion-requests')).toHaveText('Requests: 1');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('checkbox', { name: 'Block changes' }).uncheck();
    await second.press('Space');
    await expect(page.getByTestId('accordion-value')).toHaveText('Selected: Second');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('region')).toHaveCount(1);
    await expect(page.getByRole('region')).toHaveText('Content for Second.');
    expect(errors).toEqual([]);
});

test('Accordion multiple default arrays remain interactive', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--multiple&viewMode=story');
    const triggers = page.locator('[rdxAccordionTrigger]');
    await expect(triggers.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await triggers.nth(0).click();
    await expect(page.getByRole('region')).toHaveCount(3);
    await triggers.nth(1).click();
    await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('region')).toHaveCount(2);
    expect(errors).toEqual([]);
});

test('Accordion Panel views reset native state by default and preserve it when retained', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--panel-lifetime&viewMode=story');
    const reset = page.getByRole('button', { name: 'Reset state', exact: true });
    const keep = page.getByRole('button', { name: 'Keep state', exact: true });
    await expect(page.locator('#accordion-fresh-input')).toHaveCount(0);
    await expect(page.locator('#accordion-retained-input')).toHaveCount(1);
    await reset.click();
    await page.getByRole('textbox', { name: 'Fresh field' }).fill('edited');
    await reset.click();
    await expect(page.locator('#accordion-fresh-input')).toHaveCount(0);
    await reset.click();
    await expect(page.getByRole('textbox', { name: 'Fresh field' })).toHaveValue('initial');
    // This case compares completed views; interrupted motion has separate pinned coverage.
    await expect
        .poll(() =>
            page
                .locator('#accordion-fresh-input')
                .evaluate((input) =>
                    getComputedStyle(input.closest('[rdxAccordionPanel]')!)
                        .getPropertyValue('--accordion-panel-height')
                        .trim()
                )
        )
        .toBe('auto');
    await keep.click();
    await expect
        .poll(() =>
            page
                .locator('#accordion-retained-input')
                .evaluate((input) =>
                    getComputedStyle(input.closest('[rdxAccordionPanel]')!)
                        .getPropertyValue('--accordion-panel-height')
                        .trim()
                )
        )
        .toBe('auto');
    await page.getByRole('textbox', { name: 'Retained field' }).fill('edited');
    await keep.click();
    await expect(keep).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#accordion-retained-input')).toBeHidden();
    await keep.click();
    await expect(page.getByRole('textbox', { name: 'Retained field' })).toHaveValue('edited');
    expect(errors).toEqual([]);
});

test('Accordion releases measured sizes after motion and measures changed content before closing', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--motion&viewMode=story');
    const trigger = page.getByRole('button', { name: 'Details', exact: true });
    await trigger.click();
    const panel = page.getByRole('region', { name: 'Details', exact: true });
    await expect(panel).toBeVisible();
    await expect
        .poll(() =>
            panel.evaluate((node) => getComputedStyle(node).getPropertyValue('--accordion-panel-height').trim())
        )
        .toBe('auto');
    await expect.poll(() => panel.evaluate((node) => node.getBoundingClientRect().height)).toBe(80);
    await page.getByRole('button', { name: 'Change content size' }).click();
    await expect.poll(() => panel.evaluate((node) => node.getBoundingClientRect().height)).toBe(160);
    await trigger.click();
    await expect(panel).toHaveAttribute('data-ending-style', '');
    expect(
        await panel.evaluate((node) => getComputedStyle(node).getPropertyValue('--accordion-panel-height').trim())
    ).toBe('160px');
    await expect(panel).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('Horizontal Accordion keeps its content width through switching and animation completion', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/iframe.html?id=primitives-accordion--horizontal&viewMode=story');
    const root = page.locator('[rdxAccordionRoot]');
    const first = page.getByRole('button', { name: 'Is it accessible?', exact: true });
    const third = page.getByRole('button', { name: 'Can it be animated?', exact: true });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await page.evaluate(() => document.fonts.ready);
    const initial = await root.boundingBox();
    expect(initial).not.toBeNull();
    // Pause real CSS animations as they start so browser speed cannot skip a sampled phase.
    await root.evaluate((root) => {
        root.addEventListener('animationstart', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.matches('[rdxAccordionPanel]')) {
                target.getAnimations().forEach((animation) => animation.pause());
            }
        });
    });

    for (const [trigger, outgoingName, incomingName] of [
        [third, 'Is it accessible?', 'Can it be animated?'],
        [first, 'Can it be animated?', 'Is it accessible?']
    ] as const) {
        await trigger.click();
        const outgoing = page.getByRole('region', { name: outgoingName, exact: true });
        const incoming = page.getByRole('region', { name: incomingName, exact: true });
        await expect(outgoing).toHaveAttribute('data-ending-style', '');
        await expect
            .poll(() =>
                root.evaluate(
                    (root) =>
                        [...root.querySelectorAll('[rdxAccordionPanel]')]
                            .flatMap((node) => node.getAnimations())
                            .filter((animation) => animation.playState === 'paused').length
                )
            )
            .toBe(2);

        for (const progress of [0, 0.25, 0.5, 0.75, 0.99]) {
            await root.evaluate((root, progress) => {
                root.querySelectorAll('[rdxAccordionPanel]').forEach((node) => {
                    node.getAnimations().forEach((animation) => {
                        animation.currentTime = Number(animation.effect!.getTiming().duration) * progress;
                    });
                });
            }, progress);
            const during = await root.boundingBox();
            expect(Math.abs(during!.width - initial!.width), `root width at ${progress}`).toBeLessThan(1);
            expect(Math.abs(during!.x - initial!.x), `root position at ${progress}`).toBeLessThan(1);
        }

        const beforeCompletion = await incoming.boundingBox();
        await root.evaluate((root) =>
            root
                .querySelectorAll('[rdxAccordionPanel]')
                .forEach((node) => node.getAnimations().forEach((animation) => animation.finish()))
        );
        await expect(outgoing).toHaveCount(0);
        await expect
            .poll(() =>
                incoming.evaluate((node) => getComputedStyle(node).getPropertyValue('--accordion-panel-width').trim())
            )
            .toBe('auto');
        const completed = await incoming.boundingBox();
        expect(Math.abs(completed!.width - beforeCompletion!.width)).toBeLessThan(1);
        expect(Math.abs((await root.boundingBox())!.width - initial!.width)).toBeLessThan(1);
    }
    await expect(page.getByRole('button', { name: 'Is it unstyled?', exact: true })).toBeDisabled();
    expect(errors).toEqual([]);
});
