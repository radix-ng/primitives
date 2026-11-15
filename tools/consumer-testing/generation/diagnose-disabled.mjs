import { chromium, expect } from '@playwright/test';
/* global window, document */
// These globals occur only in Playwright callbacks evaluated in the browser.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Supplemental oracle diagnosis. It never edits the frozen suite or the generated application.
const output = path.resolve(process.argv[2]);
const baseURL = process.argv[3] ?? 'http://127.0.0.1:4503';
const browser = await chromium.launch();
const result = {
    mode: 'supplemental-oracle-diagnosis',
    originalSuiteUnchanged: true,
    sourceCorrections: [],
    observations: [],
    assertions: [],
    errors: []
};
const before = readFileSync(path.join(output, 'generated.patch'));
async function scenario(name, action) {
    const context = await browser.newContext({ baseURL });
    await context.tracing.start({ snapshots: true, screenshots: true });
    const page = await context.newPage();
    page.on('pageerror', (error) => result.errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') result.errors.push(message.text());
    });
    await page.addInitScript(() => {
        window.observedEvents = [];
        for (const type of ['focusin', 'keydown', 'click'])
            document.addEventListener(
                type,
                (event) => {
                    window.observedEvents.push({
                        type,
                        key: event.key ?? null,
                        target: event.target?.textContent?.trim().slice(0, 80),
                        tag: event.target?.tagName
                    });
                },
                { capture: true, passive: true }
            );
    });
    try {
        await action(page);
        result.assertions.push({ name, passed: true });
    } catch (error) {
        result.assertions.push({ name, passed: false, message: String(error) });
    } finally {
        result.observations.push({
            scenario: name,
            events: await page.evaluate(() => window.observedEvents).catch(() => [])
        });
        await page.screenshot({ path: path.join(output, `${name}.png`) });
        await context.tracing.stop({ path: path.join(output, `${name}.zip`) });
        await context.close();
    }
}
try {
    await scenario('disabled-press-reproduction', async (page) => {
        await page.goto('/');
        await page.getByRole('checkbox', { name: 'Disable selection', exact: true }).check();
        await page.getByRole('button', { name: 'Set Public externally', exact: true }).click();
        await page.getByRole('button', { name: 'Open project settings', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Project settings', exact: true });
        const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
        const done = page.getByRole('button', { name: 'Done', exact: true });
        await expect(trigger).toBeDisabled();
        await expect(done).toBeFocused();
        result.focusBeforeDisabledPress = await page.evaluate(() => ({
            tag: document.activeElement.tagName,
            text: document.activeElement.textContent.trim()
        }));
        await trigger.press('Enter');
        await expect(dialog).toBeHidden();
        const events = await page.evaluate(() => window.observedEvents);
        assert.ok(events.some((event) => event.type === 'click' && event.target === 'Done'));
        result.reproducedCause =
            'Disabled native Select trigger cannot take focus. locator.press dispatches Enter while Done retains focus; Done receives its native click and closes Dialog.';
    });
    await scenario('disabled-real-navigation-verification', async (page) => {
        await page.goto('/');
        const checkbox = page.getByRole('checkbox', { name: 'Disable selection', exact: true });
        const open = page.getByRole('button', { name: 'Open project settings', exact: true });
        await checkbox.check();
        await page.getByRole('button', { name: 'Set Public externally', exact: true }).click();
        await open.click();
        const dialog = page.getByRole('dialog', { name: 'Project settings', exact: true });
        const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
        const done = page.getByRole('button', { name: 'Done', exact: true });
        await expect(trigger).toBeDisabled();
        await expect(trigger).toContainText('Public');
        await expect(done).toBeFocused();
        for (const key of ['Tab', 'Shift+Tab']) {
            await page.keyboard.press(key);
            await expect(done).toBeFocused();
            await expect(trigger).not.toBeFocused();
        }
        await trigger.click({ force: true });
        await expect(dialog).toBeVisible();
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(page.getByTestId('selected-value')).toHaveText('public');
        await done.click();
        await expect(dialog).toBeHidden();
        await expect(open).toBeFocused();
        await checkbox.uncheck();
        await page.getByRole('button', { name: 'Set Private externally', exact: true }).click();
        await open.click();
        await expect(trigger).toContainText('Private');
        await trigger.press('Enter');
        const popup = page.getByRole('listbox');
        await expect.poll(() => popup.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('selected-value')).toHaveText('public');
        await expect(trigger).toBeFocused();
        await done.click();
        await expect(dialog).toBeHidden();
        await expect(page.locator('html')).not.toHaveAttribute('data-rdx-scroll-locked');
        await expect(open).toBeFocused();
    });
    assert.deepEqual(readFileSync(path.join(output, 'generated.patch')), before);
    result.passed = result.errors.length === 0 && result.assertions.every((check) => check.passed);
} finally {
    await browser.close();
    writeFileSync(path.join(output, 'disabled-oracle-diagnosis.json'), JSON.stringify(result, null, 2) + '\n');
}
console.log(
    JSON.stringify({
        passed: result.passed,
        focusBeforeDisabledPress: result.focusBeforeDisabledPress,
        cause: result.reproducedCause,
        assertions: result.assertions,
        errors: result.errors
    })
);
