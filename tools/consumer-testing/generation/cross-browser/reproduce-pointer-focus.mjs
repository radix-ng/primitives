/* global document */
import { chromium, expect, firefox, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { desktopBrowserProjects } from '../../../playwright/browser-projects.mts';
import { navigationKey } from './keyboard.ts';

const directory = path.dirname(fileURLToPath(import.meta.url));
assert.ok(process.argv[2], 'Pass a new artifact directory. This repro contains no Angular or Radix code.');
const output = path.resolve(process.argv[2]);
assert.ok(!existsSync(output), 'Do not overwrite an earlier reproduction.');
mkdirSync(output, { recursive: true });
cpSync(path.join(directory, 'native-checkbox.html'), path.join(output, 'native-checkbox.html'));
const observations = [];
for (const project of desktopBrowserProjects(output)) {
    const browser = await { chromium, firefox, webkit }[project.name].launch(project.use?.launchOptions);
    const context = await browser.newContext();
    await context.tracing.start({ screenshots: true, snapshots: true });
    const record = { engine: project.name, version: browser.version(), trace: `${project.name}-native-focus.zip` };
    try {
        const page = await context.newPage();
        await page.setContent(readFileSync(path.join(directory, 'native-checkbox.html'), 'utf8'));
        const checkbox = page.getByRole('checkbox', { name: 'Disable selection', exact: true });
        await page.getByRole('button', { name: 'Before', exact: true }).focus();
        await checkbox.check();
        await expect(checkbox).toBeChecked();
        record.activeAfterPointer = await page.evaluate(() => ({
            tag: document.activeElement.tagName,
            id: document.activeElement.id
        }));
        record.pointerFocusedCheckbox = await checkbox.evaluate((element) => element === document.activeElement);
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
        await page.keyboard.press(navigationKey('Tab', project.name));
        await expect(page.getByRole('button', { name: 'After select', exact: true })).toBeFocused();
        await expect(page.getByRole('combobox', { name: 'Visibility', exact: true })).not.toBeFocused();
        await page.keyboard.press(navigationKey('Shift+Tab', project.name));
        await expect(checkbox).toBeFocused();
        record.explicitOriginAndDisabledNavigation = 'passed';
    } catch (error) {
        record.error = String(error);
    } finally {
        observations.push(record);
        await context.tracing.stop({ path: path.join(output, record.trace) });
        await context.close();
        await browser.close();
        writeFileSync(
            path.join(output, 'observations.json'),
            JSON.stringify({ platform: process.platform, observations }, null, 2) + '\n'
        );
    }
}
console.log(JSON.stringify(observations, null, 2));
if (observations.some((item) => item.error)) process.exitCode = 1;
