import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'clipboard', {
            value: {
                async writeText(text: string) {
                    sessionStorage.setItem('copied', text);
                }
            }
        });
    });
});

test('the landing Accordion and its annotations support keyboard and pointer inspection', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');

    const accordion = page.getByRole('region', { name: 'Accordion example' });
    const parts = page.getByRole('group', { name: 'Accordion parts' });
    const rootPart = parts.getByRole('button', { name: /^Root / });
    const triggerPart = parts.getByRole('button', { name: /^Trigger / });
    const panelPart = parts.getByRole('button', { name: /^Panel / });
    const first = accordion.getByRole('button', { name: 'Is it accessible?' });
    const second = accordion.getByRole('button', { name: 'Is it unstyled?' });
    const firstPanel = accordion.getByRole('region', { name: 'Is it accessible?' });
    const secondPanel = accordion.getByRole('region', { name: 'Is it unstyled?' });
    const panelWire = page.locator('[data-connector="panel"] path');

    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(firstPanel).toBeVisible();
    await expect(rootPart).toHaveAttribute('aria-pressed', 'true');
    await expect(accordion).toHaveAttribute('data-inspected', '');
    const rootBadge = rootPart.locator('[aria-hidden="true"]');
    const accent = await rootBadge.evaluate((badge) => getComputedStyle(badge).backgroundColor);
    await parts.scrollIntoViewIfNeeded();
    await triggerPart.hover();
    await expect(first).toHaveAttribute('data-inspected', '');
    await expect(rootPart).toHaveAttribute('aria-pressed', 'true');
    await expect(triggerPart.locator('[aria-hidden="true"]')).toHaveCSS('background-color', accent);
    await expect(rootBadge).not.toHaveCSS('background-color', accent);

    const triggerBounds = (await triggerPart.boundingBox())!;
    const panelBounds = (await panelPart.boundingBox())!;
    await page.mouse.move(
        triggerBounds.x + triggerBounds.width / 2,
        (triggerBounds.y + triggerBounds.height + panelBounds.y) / 2
    );
    await expect(first).toHaveAttribute('data-inspected', '');
    await panelPart.hover();
    await expect(firstPanel).toHaveAttribute('data-inspected', '');
    await page.mouse.move(0, 0);
    await expect(accordion).toHaveAttribute('data-inspected', '');

    await triggerPart.hover();
    await panelPart.focus();
    await expect(firstPanel).toHaveAttribute('data-inspected', '');
    await expect(panelPart).toHaveAttribute('aria-pressed', 'false');
    await page.mouse.move(0, 0);
    await panelPart.press('Space');
    await expect(panelPart).toHaveAttribute('aria-pressed', 'true');
    const firstPath = await panelWire.getAttribute('d');
    expect(firstPath).toBeTruthy();

    await first.press('Tab');
    await expect(second).toBeFocused();
    await second.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(firstPanel).toHaveCount(0);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(secondPanel).toHaveAttribute('data-inspected', '');
    await expect(panelPart).toHaveAttribute('aria-pressed', 'true');
    await expect(panelWire).not.toHaveAttribute('d', firstPath!);

    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(secondPanel).toHaveCount(0);
    await expect(panelWire).toHaveCount(0);
    await expect(panelPart).toContainText('Open a row to inspect its panel.');

    await first.click();
    await expect(firstPanel).toHaveAttribute('data-inspected', '');
    await expect(panelWire).toBeVisible();

    await triggerPart.click();
    await page.mouse.move(0, 0);
    await expect(triggerPart).toHaveAttribute('aria-pressed', 'true');
    await page.getByText('Install skills manually', { exact: true }).click();
    await page.getByRole('button', { name: 'Copy skills install command' }).press('Enter');
    await expect(page.getByRole('status')).toHaveText('Install command copied.');
    await expect(first).toHaveAttribute('data-inspected', '');
    expect(await page.evaluate(() => sessionStorage.getItem('copied'))).toBe(
        'npx skills add radix-ng/primitives/skills'
    );
    expect(errors).toEqual([]);
});

test('the landing retains its navigation, brand mark, and theme at mobile and desktop widths', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 820 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Build the interface you want. The behavior is already there.'
    );
    await expect(page.getByRole('link', { name: 'Base UI', exact: true })).toHaveAttribute(
        'href',
        'https://base-ui.com/'
    );
    const mainNav = page.getByRole('navigation', { name: 'Main' });
    await expect(mainNav.getByRole('link', { name: 'Docs' })).toHaveAttribute(
        'href',
        '/docs/?path=/docs/overview-introduction--docs'
    );
    for (const name of ['Project links', 'Project links in footer']) {
        const projectLinks = page.getByRole('navigation', { name, exact: true });
        const github = projectLinks.getByRole('link', { name: 'GitHub', exact: true });
        await expect(github).toHaveAttribute('href', 'https://github.com/radix-ng/primitives');
        await expect(github.locator('svg')).toBeVisible();
        await expect(projectLinks.getByRole('link', { name: 'Telegram', exact: true })).toHaveAttribute(
            'href',
            'https://t.me/headless_angular'
        );
        await expect(projectLinks.getByRole('link', { name: 'npm v1.3.0', exact: true })).toHaveAttribute(
            'href',
            'https://www.npmjs.com/package/@radix-ng/primitives/v/1.3.0'
        );
    }
    await mainNav.getByRole('link', { name: 'Agents', exact: true }).click();
    await expect(page).toHaveURL(/#work-with-agents$/);
    const brand = page.getByRole('link', { name: 'Radix Angular home' });
    await expect(brand).toHaveText('Radix Angular');
    const mark = brand.locator('.landing-brand-mark');
    await expect(mark).toHaveCSS('background-color', 'rgb(233, 235, 232)');
    await expect(mark).toHaveCSS('mask-image', /\/favicon\.svg/);
    await expect(page.getByRole('link', { name: /pimenovoleg/ })).toHaveAttribute(
        'href',
        'https://github.com/pimenovoleg'
    );
    const contributors = page.getByRole('list', { name: 'Core contributors' }).getByRole('listitem');
    await expect(contributors).toHaveCount(4);
    await expect(contributors.nth(3).getByRole('link', { name: /vitalyozza/ })).toHaveAttribute(
        'href',
        'https://github.com/vitalyozza'
    );
    await expect(page.getByRole('link', { name: /vitalyozza/ })).toHaveCount(1);

    await expect(page.getByRole('link', { name: 'Explore Accordion' })).toHaveAttribute(
        'href',
        '/docs/?path=/docs/primitives-accordion--docs'
    );
    await expect(page.getByRole('link', { name: 'Read agent docs' })).toHaveAttribute(
        'href',
        '/docs/?path=/docs/agents-getting-started--docs'
    );
    const rootWire = page.locator('[data-connector="root"]');
    const setupPrompt = page.getByRole('region', { name: 'Set up Radix NG' });
    const settingsPrompt = page.getByRole('region', { name: 'Adapt Project settings' });
    await expect(rootWire).toBeHidden();
    for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        if (width >= 768) await expect(rootWire).toBeVisible();
        const setupBox = (await setupPrompt.boundingBox())!;
        const settingsBox = (await settingsPrompt.boundingBox())!;
        if (width >= 1280) {
            expect(settingsBox.x).toBeGreaterThan(setupBox.x + setupBox.width);
            expect(settingsBox.y).toBeCloseTo(setupBox.y);
        } else {
            expect(settingsBox.y).toBeGreaterThan(setupBox.y + setupBox.height);
        }
    }

    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(mark).toHaveCSS('background-color', 'rgb(25, 26, 25)');
    await mainNav.getByRole('link', { name: 'Components' }).click();
    await expect(page.getByRole('heading', { name: 'Radix NG Playground' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('Project settings preserves focus and saves the selected environment on submit', async ({ page, browserName }) => {
    await page.goto('/');
    const example = page.locator('app-project-settings');
    const trigger = example.getByRole('button', { name: 'Try the component' });
    const dialog = page.getByRole('dialog', { name: 'Project settings', exact: true });
    const environment = dialog.getByRole('combobox', { name: 'Environment' });
    const listbox = page.getByRole('listbox');
    const save = dialog.getByRole('button', { name: 'Save settings' });
    const tab = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';

    await expect(example.getByText('Development', { exact: true })).toBeVisible();
    await trigger.press('Enter');
    await expect(dialog).toBeVisible();
    await save.press(tab);
    await expect(environment).toBeFocused();
    await environment.press('ArrowDown');
    await expect(listbox).toBeFocused();
    await expect
        .poll(async () => {
            const anchor = (await environment.boundingBox())!;
            const popup = (await listbox.boundingBox())!;
            return Math.max(Math.abs(anchor.x - popup.x), Math.abs(anchor.width - popup.width));
        })
        .toBeLessThan(1.5);
    await page.keyboard.press('Escape');
    await expect(listbox).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(environment).toBeFocused();

    await environment.press('ArrowDown');
    await expect(listbox).toBeFocused();
    await page.keyboard.press('End');
    await expect(listbox.getByRole('option', { name: 'Production' })).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Enter');
    await expect(environment).toHaveText('Production');
    await expect(listbox).toHaveCount(0);
    await save.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(example.getByText('Production', { exact: true })).toBeVisible();

    await trigger.click();
    await environment.click();
    await page.getByRole('option', { name: 'Staging', exact: true }).click();
    await expect(listbox).toHaveCount(0);
    await expect(environment).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(example.getByText('Production', { exact: true })).toBeVisible();
    await trigger.click();
    await expect(environment).toHaveText('Production');
});

test('Project settings copies its rendered Angular source and both quick start prompts', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Copy Angular code' }).click();
    await expect(page.getByRole('status')).toHaveText('Angular code copied.');
    const source = readFileSync(
        resolve(__dirname, '../../radix-playground/src/app/examples/project-settings.ts'),
        'utf8'
    );
    expect(await page.evaluate(() => sessionStorage.getItem('copied'))).toBe(source);

    const setup = page.getByRole('region', { name: 'Set up Radix NG' });
    const setupText = setup.locator('pre');
    await expect(setupText).toBeVisible();
    await expect(setupText).toContainText('ng add @radix-ng/primitives');
    await expect(setupText).toContainText('npx skills add radix-ng/primitives/skills');
    await setup.getByRole('button', { name: 'Copy prompt — Set up Radix NG' }).click();
    await expect(page.getByRole('status')).toHaveText('Setup prompt copied.');
    expect(await page.evaluate(() => sessionStorage.getItem('copied'))).toBe(await setupText.textContent());

    const projectSettings = page.getByRole('region', { name: 'Adapt Project settings' });
    const projectSettingsText = projectSettings.locator('pre');
    await expect(projectSettingsText).toBeVisible();
    await expect(projectSettingsText).toContainText('Keep the environment as a draft until Save settings applies it.');
    await projectSettings.getByRole('button', { name: 'Copy prompt — Adapt Project settings' }).click();
    await expect(page.getByRole('status')).toHaveText('Project settings prompt copied.');
    expect(await page.evaluate(() => sessionStorage.getItem('copied'))).toBe(await projectSettingsText.textContent());
});
