import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Maintained reference fixtures for the public Agents tasks. These tests do not run a coding agent.
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
    const errors: string[] = [];
    browserErrors.set(page, errors);
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
});
test.afterEach(({ page }) => expect(browserErrors.get(page), 'reference fixture browser errors').toEqual([]));

// Match macOS WebKit's native full-keyboard navigation, as in the existing docs checks.
const tabKey = (browserName: string) => (browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');

test('Agents form task: labels, errors, dirty and touched reflect native keyboard input', async ({
    page,
    browserName
}) => {
    await page.goto('/iframe.html?id=primitives-field--reactive-forms&viewMode=story');
    const email = page.getByRole('textbox', { name: 'Email', exact: true });
    await expect(email).toHaveAccessibleDescription('Use the email connected to your account.');
    await expect(email).toHaveAttribute('required', '');
    await email.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Email is required.', { exact: true })).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await email.fill('invalid');
    await page.keyboard.press(tabKey(browserName));
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeFocused();
    await expect(email).toHaveAttribute('data-dirty', '');
    await expect(email).toHaveAttribute('data-touched', '');
    await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible();
    await email.fill('reader@example.com');
    await page.keyboard.press(tabKey(browserName));
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeHidden();
});

test('Agents Select/Dialog task: selection and Escape preserve nested focus ownership', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-select--focus-management&viewMode=story&args=shell:dialog');
    const open = page.getByRole('button', { name: 'Open dialog', exact: true });
    await open.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Choose a fruit', exact: true });
    await expect(dialog).toBeVisible();
    const select = page.getByRole('combobox', { name: 'Fruit', exact: true });
    await select.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(select).toHaveText('Banana');
    await expect(select).toBeFocused();
    await expect(dialog).toBeVisible();
    await select.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(select).toBeFocused();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
});

test('Agents Menu/Dialog task: the exiting menu preserves dialog focus and return target', async ({ page }) => {
    await page.goto('/iframe.html?id=primitives-menu--open-dialog&viewMode=story');
    const trigger = page.getByRole('button', { name: 'Document actions', exact: true });
    await trigger.press('Enter');
    const rename = page.getByRole('menuitem', { name: 'Rename document…', exact: true });
    await expect(rename).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Rename document', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription('Focus stays in this dialog while the menu finishes closing.');
    await expect(page.getByRole('textbox', { name: 'Document name', exact: true })).toBeFocused();
    await expect(page.locator('[rdxMenuPopup]')).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Document name', exact: true })).toBeFocused();
    // Native button tab stops vary with WebKit's keyboard preference; the modal contract is containment.
    for (const key of ['Shift+Tab', 'Tab', 'Tab']) {
        await page.keyboard.press(key);
        await expect.poll(() => dialog.evaluate((popup) => popup.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
});

test('Agents Tabs task: projected parts use hostDirectives context and manual keyboard activation', async ({
    page
}) => {
    await page.goto('/iframe.html?id=primitives-tabs--projected-through-wrapper&viewMode=story');
    const account = page.getByRole('tab', { name: 'Account', exact: true });
    const password = page.getByRole('tab', { name: 'Password', exact: true });
    const team = page.getByRole('tab', { name: 'Team', exact: true });
    await expect(account).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tablist').locator('[tabindex="0"]')).toHaveCount(1);
    await account.focus();
    await page.keyboard.press('ArrowRight');
    await expect(password).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tabpanel', { name: 'Password', exact: true })).toBeVisible();
    await page.keyboard.press('Home');
    await expect(account).toBeFocused();
    await page.keyboard.press('End');
    await expect(team).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('tabpanel', { name: 'Team', exact: true })).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await page.getByRole('tablist').evaluate((list) => list.contains(document.activeElement))).toBe(false);
});

test('Agents pages and exported contracts are discoverable through Storybook and Markdown', async ({
    page,
    request
}) => {
    const index = await (await request.get('/index.json')).json();
    const pages = ['getting-started', 'build-with-radix-ng', 'compose-components', 'verify-the-result', 'reference'];
    const llms = await (await request.get('/llms.txt')).text();
    const full = await (await request.get('/llms-full.txt')).text();
    const bundled = (file: string) => readFileSync(resolve(__dirname, '../../../skills', file), 'utf8');
    expect(llms).toBe(bundled('radix-ng-examples/references/llms.txt'));
    expect(full).toBe(bundled('radix-ng-examples/references/llms-full.txt'));
    for (const slug of pages) {
        expect(index.entries[`agents-${slug}--docs`]?.type).toBe('docs');
        const response = await request.get(`/agents/${slug}.md`);
        expect(response.ok()).toBe(true);
        expect(await response.text()).toBe(bundled(`radix-ng-examples/references/agents/${slug}.md`));
        expect(llms).toContain(`/agents/${slug}.md`);
    }
    expect(full).toContain('# Verify the result');
    for (const kind of ['api-contract', 'styling-contract']) {
        const response = await request.get(`/${kind}/select.json`);
        expect(response.ok()).toBe(true);
        const contract = await response.json();
        expect(contract.version).toBeTruthy();
        expect(contract).toEqual(JSON.parse(bundled(`radix-ng/references/${kind}/select.json`)));
    }
    await page.goto('/iframe.html?id=agents-getting-started--docs&viewMode=docs');
    await expect(page.getByRole('heading', { name: 'Getting started', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Compose components', exact: true })).toHaveAttribute(
        'href',
        './?path=/docs/agents-compose-components--docs'
    );
});

test('Agents sidebar opens each public guide', async ({ page }) => {
    // The manager's analytics is unrelated to guide navigation; keep this check local.
    await page.route('https://mc.yandex.ru/metrika/tag.js', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    );
    await page.goto('/?path=/docs/agents-getting-started--docs');
    const preview = page.frameLocator('#storybook-preview-iframe');
    for (const [slug, title] of [
        ['getting-started', 'Getting started'],
        ['build-with-radix-ng', 'Build with Radix NG'],
        ['compose-components', 'Compose components'],
        ['verify-the-result', 'Verify the result'],
        ['reference', 'Reference']
    ]) {
        await page.locator(`a[href$="/docs/agents-${slug}--docs"]`).click();
        await expect(preview.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
    await page.locator('a[href$="/docs/agents-getting-started--docs"]').click();
    await preview.getByRole('link', { name: 'Compose components', exact: true }).click();
    await expect(page).toHaveURL(/path=\/docs\/agents-compose-components--docs/);
    await expect(preview.getByRole('heading', { name: 'Compose components', exact: true })).toBeVisible();
});
