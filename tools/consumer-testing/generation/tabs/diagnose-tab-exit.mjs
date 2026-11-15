import { chromium, expect, firefox, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { desktopBrowserProjects } from '../../../playwright/browser-projects.mts';
import { navigationKey } from '../cross-browser/keyboard.ts';

const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(directory, '../../../..');
assert.ok(process.argv[2] && process.argv[3], 'Pass the retained consumer and a new diagnosis directory.');
const consumer = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
assert.ok(!existsSync(output), 'Keep prior diagnoses and frozen suite results.');
mkdirSync(output, { recursive: true });
cpSync(fileURLToPath(import.meta.url), path.join(output, 'diagnose-tab-exit.mjs'));
const observations = [];
const servers = [];
const port = Number(process.env['RADIX_TABS_DIAGNOSIS_PORT'] ?? 4571);
const save = () =>
    writeFileSync(path.join(output, 'observations.json'), JSON.stringify({ observations }, null, 2) + '\n');
async function state(page) {
    return page.evaluate(() => {
        const doc = globalThis.document;
        const root = doc.querySelector('[data-testid="primary-tabs"]');
        const describe = (element) => ({
            tag: element?.tagName,
            id: element?.id,
            role: element?.getAttribute('role'),
            text: element?.textContent?.trim().slice(0, 80),
            tabIndex: element?.getAttribute('tabindex')
        });
        return {
            active: describe(doc.activeElement),
            value: doc.querySelector('[data-testid="primary-value"]')?.textContent?.trim(),
            events: doc.querySelector('[data-testid="primary-event-count"]')?.textContent?.trim(),
            tabs: [...root.querySelectorAll('[role="tab"]')].map((element) => ({
                ...describe(element),
                selected: element.getAttribute('aria-selected')
            })),
            panels: [...root.querySelectorAll('[role="tabpanel"]')].map((element) => ({
                ...describe(element),
                hidden: element.hidden
            }))
        };
    });
}
try {
    for (const [index, target] of [consumer, path.resolve(consumer, '../probe')].entries()) {
        const server = spawn(
            process.execPath,
            [
                path.join(workspace, 'node_modules/http-server/bin/http-server'),
                path.join(target, 'dist/consumer/browser'),
                '-a',
                '127.0.0.1',
                '-p',
                String(port + index),
                '-s',
                '-c-1'
            ],
            { stdio: 'ignore' }
        );
        servers.push(server);
        await expect
            .poll(async () => {
                try {
                    return (await fetch(`http://localhost:${port + index}/`)).status;
                } catch {
                    return 0;
                }
            })
            .toBe(200);
    }
    for (const project of desktopBrowserProjects(output)) {
        const browser = await { chromium, firefox, webkit }[project.name].launch(project.use?.launchOptions);
        try {
            for (const host of [0, 1])
                for (const mode of ['immediate-1', 'immediate-2', 'await-observable-selection']) {
                    const context = await browser.newContext();
                    await context.tracing.start({ screenshots: true, snapshots: true });
                    const record = {
                        engine: project.name,
                        version: browser.version(),
                        host: host ? 'independent parent' : 'generated application',
                        mode,
                        trace: `${project.name}-${host}-${mode}.zip`,
                        errors: []
                    };
                    try {
                        const page = await context.newPage();
                        page.on('pageerror', (error) => record.errors.push(error.message));
                        page.on('console', (message) => {
                            if (message.type() === 'error') record.errors.push(message.text());
                        });
                        await page.goto(`http://localhost:${port + host}/`);
                        const root = page.getByTestId('primary-tabs');
                        const account = root.getByRole('tab', { name: 'Account', exact: true });
                        const security = root.getByRole('tab', { name: 'Security', exact: true });
                        const panel = root.getByRole('tabpanel', { name: 'Security', exact: true });
                        await account.focus();
                        await page.keyboard.press(navigationKey('Tab', project.name));
                        await expect(root.getByRole('tabpanel', { name: 'Account', exact: true })).toBeFocused();
                        await page.keyboard.press(navigationKey('Shift+Tab', project.name));
                        await expect(account).toBeFocused();
                        await page.keyboard.press('End');
                        await expect(security).toBeFocused();
                        await page.keyboard.press('Enter');
                        if (mode === 'await-observable-selection') {
                            await expect(security).toHaveAttribute('aria-selected', 'true');
                            await expect(panel).toBeVisible();
                            await expect(page.getByTestId('primary-value')).toHaveText('security');
                            await expect(page.getByTestId('primary-event-count')).toHaveText('1');
                        }
                        // Deliberately no intermediate read in the immediate branch: retain the failing sequence.
                        await page.keyboard.press(navigationKey('Tab', project.name));
                        record.afterTab = await state(page);
                        await expect(security).toHaveAttribute('aria-selected', 'true');
                        await expect(page.getByTestId('primary-value')).toHaveText('security');
                        record.afterSelectionObserved = await state(page);
                        record.selectedPanelFocused = await panel.evaluate(
                            (element) => element === globalThis.document.activeElement
                        );
                        if (mode === 'await-observable-selection') {
                            await expect(panel).toBeFocused();
                            await page.keyboard.press(navigationKey('Shift+Tab', project.name));
                            await expect(security).toBeFocused();
                            record.focusAssertions = 'passed';
                        }
                        expect(record.errors).toEqual([]);
                    } catch (error) {
                        record.error = String(error);
                    } finally {
                        observations.push(record);
                        save();
                        await context.tracing.stop({ path: path.join(output, record.trace) });
                        await context.close();
                    }
                }
        } finally {
            await browser.close();
        }
    }
} finally {
    for (const server of servers)
        if (server.exitCode === null) {
            server.kill('SIGTERM');
            await once(server, 'close');
        }
}
console.log(
    JSON.stringify(
        observations.map(({ engine, host, mode, selectedPanelFocused, focusAssertions, error }) => ({
            engine,
            host,
            mode,
            selectedPanelFocused,
            focusAssertions,
            error
        })),
        null,
        2
    )
);
if (observations.some((item) => item.error)) process.exitCode = 1;
