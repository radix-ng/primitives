import { expect, test } from '@playwright/test';

for (const surface of ['shadow', 'frame']) {
    for (const family of ['popover', 'dialog', 'select']) {
        test(`pending portal consumer ${family} in ${surface}`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.goto(`/angular.html?case=portal-${surface}&consumer=${family}&pending`);
            const scope = surface === 'frame' ? page.frameLocator('[data-testid="portal-frame"]') : page;
            const trigger = scope.getByTestId('primary');
            const popup = scope.getByTestId('popup');
            await trigger.press('Enter');
            await expect(trigger).toHaveAttribute('aria-expanded', 'true');
            await expect(popup).toHaveCount(0);
            await page.keyboard.press('F3');
            await expect(popup).toBeVisible();
            if (family === 'select') {
                await scope.getByTestId('option-two').click();
                await expect(trigger).toContainText('Two');
            } else await scope.getByTestId('close').click();
            await expect(popup).toHaveCount(0);
            await page.keyboard.press('F3');
            await trigger.press('Enter');
            await expect(popup).toHaveCount(0);
            await page.keyboard.press('F3');
            await expect(popup).toBeVisible();
            await page.keyboard.press('F3');
            await expect(popup).toHaveCount(0);
            expect(errors).toEqual([]);
        });

        test(`portal consumer ${family} in ${surface}`, async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (e) => errors.push(e.message));
            await page.goto(`/angular.html?case=portal-${surface}&consumer=${family}`);
            const scope = surface === 'frame' ? page.frameLocator('[data-testid="portal-frame"]') : page;
            const trigger = scope.getByTestId('primary');
            const popup = scope.getByTestId('popup');
            await trigger.press('Enter');
            await expect(popup).toBeVisible();
            expect(
                await page.evaluate(() => {
                    const s = window.menuPortalSurface;
                    const popup = s.scope.querySelector('[data-testid="popup"]');
                    return !!popup && s.target.contains(popup);
                })
            ).toBe(true);
            if (family === 'select') {
                await scope.getByTestId('option-two').click();
                await expect(popup).toHaveCount(0);
                await expect(trigger).toContainText('Two');
            } else {
                await scope.getByTestId('input').fill('Native value');
                await scope.getByTestId('close').click();
                await expect(popup).toHaveCount(0);
            }
            await expect
                .poll(() =>
                    trigger.evaluate((node) => {
                        let active = node.ownerDocument.activeElement;
                        while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
                        return active === node;
                    })
                )
                .toBe(true);
            if (family === 'select') {
                // Closed Select typeahead changes the value without opening the popup.
                await trigger.press('o');
                await expect(trigger).toContainText('One');
                await expect(popup).toHaveCount(0);
            }
            await trigger.press('Enter');
            await expect(popup).toBeVisible();
            if (family === 'select')
                await expect(scope.getByTestId('option-one')).toHaveAttribute('data-highlighted', '');
            await page.keyboard.press('Escape');
            await expect(popup).toHaveCount(0);
            await expect(trigger).toHaveAttribute('aria-expanded', 'false');
            expect(errors).toEqual([]);
        });
    }

    test(`attribute Portal crosses documents/trees and retains its view in ${surface}`, async ({ page }) => {
        await page.goto(`/angular.html?case=portal-${surface}&consumer=portal`);
        const target = surface === 'frame' ? page.frameLocator('[data-testid="portal-frame"]') : page;
        const input = target.getByTestId('transfer-input');
        await expect(input).toBeVisible();
        await input.fill('Edited');
        await target.getByTestId('transfer-button').click();
        await expect(page.getByTestId('state')).toHaveText('Edited:1');
        const original = await page.evaluateHandle(() =>
            window.menuPortalSurface.scope.querySelector('[data-testid="transfer-node"]')
        );
        await input.press('F3');
        const returned = page.getByTestId('return-target').getByTestId('transfer-input');
        await expect(returned).toBeVisible();
        await expect(returned).toHaveValue('Edited');
        expect(
            await original.evaluate(
                (node) =>
                    node === document.querySelector('[data-testid="return-target"] > [data-testid="transfer-node"]')
            )
        ).toBe(true);
        expect(await returned.evaluate((node) => node.ownerDocument.activeElement === node)).toBe(true);
        await returned.press('F3');
        await expect(input).toBeVisible();
        await expect(input).toHaveValue('Edited');
        await input.press('F4');
        await expect(target.getByTestId('transfer-node')).toHaveCount(0);
        await expect(page.getByTestId('transfer-node')).toHaveCount(0);
    });
}
