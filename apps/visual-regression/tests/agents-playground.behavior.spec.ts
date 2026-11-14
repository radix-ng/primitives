import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { toolInputSchemas, toolResultSchemas } from '../../radix-playground/src/app/agent-runtime/protocol';
import type { AgentRuntimeApi, ControlSnapshot, RuntimeLog } from '../../radix-playground/src/app/agent-runtime/types';
import { holdExitAnimations } from '../helpers/exit-animations';

type RuntimeWindow = Window & { radixAgentRuntime?: AgentRuntimeApi; savedAgentRuntime?: AgentRuntimeApi };
const errors = new WeakMap<Page, string[]>();
const assets = new WeakMap<Page, string[]>();
const snapshot = (page: Page) => page.evaluate(() => (window as RuntimeWindow).radixAgentRuntime!.snapshot());
const query = (page: Page, filter: unknown) =>
    page.evaluate((filter) => (window as RuntimeWindow).radixAgentRuntime!.query(filter), filter);
const act = (page: Page, command: unknown) =>
    page.evaluate((command) => (window as RuntimeWindow).radixAgentRuntime!.act(command), command);
const model = async (page: Page) =>
    JSON.parse(await page.getByTestId('project-model').innerText()) as {
        name: string;
        visibility: string;
        environment: string;
        note: string;
    };
const formState = async (page: Page) =>
    JSON.parse(await page.getByTestId('project-form-state').innerText()) as Record<string, boolean>;
const journal = async (page: Page) => JSON.parse(await page.getByTestId('runtime-journal').innerText()) as RuntimeLog[];
const events = async (page: Page, event: string) =>
    (await journal(page))
        .filter((entry) => entry.type === 'event')
        .map((entry) => entry.detail as Record<string, unknown>)
        .filter((entry) => entry['event'] === event);
const tabKey = (browserName: string) => (browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');

async function control(page: Page, name: string): Promise<ControlSnapshot> {
    const result = await query(page, { name });
    expect(result.status).toBe('matched');
    return result.matches[0];
}
async function opened(page: Page) {
    await expect(page.getByRole('heading', { name: 'Agent Playground', exact: true })).toBeVisible();
    await page.waitForFunction(() => (window as RuntimeWindow).radixAgentRuntime?.snapshot().controls.length === 3);
}
async function noOverlay(page: Page) {
    await expect(page.getByTestId('agent-backdrop')).toHaveCount(0);
    await expect(page.locator('[rdxDialogPopup], [rdxSelectPopup]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-rdx-scroll-locked');
}

test.beforeEach(async ({ page }) => {
    const messages: string[] = [];
    const loaded: string[] = [];
    errors.set(page, messages);
    assets.set(page, loaded);
    page.on('pageerror', (error) => messages.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') messages.push(message.text());
    });
    page.on('response', (response) => {
        if (/\.(js|css)(\?|$)/.test(response.url())) {
            loaded.push(response.url());
            if (response.status() >= 400) messages.push(`Asset ${response.status()}: ${response.url()}`);
        }
    });
    page.on('requestfailed', (request) => {
        if (/\.(js|css)(\?|$)/.test(request.url())) messages.push(`Asset failed: ${request.url()}`);
    });
    await page.goto('/playground/agents');
    await opened(page);
});
test.afterEach(({ page }) => expect(errors.get(page), 'playground browser errors').toEqual([]));

test('snapshot and exact query read native labels, stable IDs, real state and options without side effects', async ({
    page
}) => {
    const input = page.getByRole('textbox', { name: 'Project name', exact: true });
    const select = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await expect(input).toHaveAccessibleName('Project name');
    await expect(input).not.toHaveAttribute('aria-label');
    await expect(select).toHaveAttribute('aria-labelledby');
    await input.focus();
    const before = await snapshot(page);
    expect(
        before.controls.map(({ kind, name }) => ({ kind, name })).sort((a, b) => a.kind.localeCompare(b.kind))
    ).toEqual([
        { kind: 'dialog', name: 'Project settings' },
        { kind: 'input', name: 'Project name' },
        { kind: 'select', name: 'Visibility' }
    ]);
    expect(new Set(before.controls.map(({ id }) => id)).size).toBe(3);
    expect((await control(page, 'Project name')).value).toBe('Radix project');
    expect((await control(page, 'Visibility')).options).toEqual([
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
        { value: 'archived', label: 'Archived', disabled: true }
    ]);
    expect((await control(page, 'Visibility')).open).toBe(false);
    expect((await query(page, {})).status).toBe('ambiguous');
    expect((await query(page, { kind: 'button' })).status).toBe('invalid-query');
    expect((await query(page, { name: 'Does not exist' })).status).toBe('not-found');
    expect((await query(page, { name: '' })).status).toBe('not-found');
    expect(await snapshot(page)).toEqual(before);
    expect(await events(page, 'input.value')).toEqual([]);
    await expect(input).toBeFocused();
    expect((await model(page)).name).toBe('Radix project');
});

test('ordinary UI edits update snapshots, controlled open bindings and Signal Forms once', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('UI project');
    const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    expect((await control(page, 'Visibility')).open).toBe(true);
    expect((await formState(page))['visibilityOpen']).toBe(true);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('Public');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    expect((await model(page)).visibility).toBe('public');
    expect((await control(page, 'Project name')).value).toBe('UI project');
    expect((await control(page, 'Visibility')).value).toBe('public');
    expect(await formState(page)).toMatchObject({ valid: true, dirty: true, touched: true, visibilityOpen: false });
    expect(await events(page, 'input.value')).toEqual([
        expect.objectContaining({ name: 'Project name', value: 'UI project', canceled: false, nativeType: 'input' })
    ]);
    expect(await events(page, 'select.value')).toEqual([
        expect.objectContaining({ name: 'Visibility', value: 'public', canceled: false, reason: 'item-press' })
    ]);
});

test('act reports applied state, preserves focus and emits exactly one primitive callback per change', async ({
    page
}) => {
    const input = await control(page, 'Project name');
    const select = await control(page, 'Visibility');
    const inspector = page.getByRole('button', { name: 'Snapshot', exact: true });
    await inspector.focus();
    const rename = await act(page, { id: input.id, action: 'set-value', value: 'Agent project' });
    expect(rename).toMatchObject({
        status: 'applied',
        before: { value: 'Radix project' },
        after: { id: input.id, value: 'Agent project' }
    });
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue('Agent project');
    const selection = await act(page, { id: select.id, action: 'select-option', value: 'public' });
    expect(selection).toMatchObject({ status: 'applied', after: { value: 'public', open: false } });
    await expect(page.getByRole('combobox', { name: 'Visibility', exact: true })).toHaveText('Public');
    expect(await model(page)).toMatchObject({ name: 'Agent project', visibility: 'public' });
    expect((await act(page, { id: select.id, action: 'select-option', value: 'public' })).status).toBe('unchanged');
    expect((await events(page, 'input.value')).length).toBe(1);
    expect(await events(page, 'select.value')).toEqual([
        expect.objectContaining({ value: 'public', reason: 'imperative-action', canceled: false })
    ]);
    await expect(inspector).toBeFocused();
    expect(await formState(page)).toMatchObject({ valid: true, dirty: true, touched: false });
});

test('invalid commands and unavailable options refuse without changing values or emitting change events', async ({
    page
}) => {
    const input = await control(page, 'Project name');
    const select = await control(page, 'Visibility');
    const before = await snapshot(page);
    for (const [command, code] of [
        [null, 'invalid-command'],
        [{ id: 'missing', action: 'open' }, 'unknown-id'],
        [{ id: input.id, action: 'open' }, 'unsupported-action'],
        [{ id: input.id, action: 'set-value', value: 42 }, 'invalid-arguments'],
        [{ id: input.id, action: 'set-value', value: {} }, 'invalid-arguments'],
        [{ id: select.id, action: 'open', value: 'unexpected' }, 'invalid-arguments'],
        [{ id: select.id, action: 'select-option', value: 'missing' }, 'invalid-arguments'],
        [{ id: select.id, action: 'select-option', value: 'archived' }, 'invalid-arguments']
    ] as const)
        expect(await act(page, command)).toMatchObject({ status: 'refused', code });
    expect(await snapshot(page)).toEqual(before);
    expect(await model(page)).toMatchObject({ name: 'Radix project', visibility: 'private' });
    expect(await events(page, 'input.value')).toEqual([]);
    expect(await events(page, 'select.value')).toEqual([]);
});

test('prototype property names are not declared capabilities', async ({ page }) => {
    const input = await control(page, 'Project name');
    for (const action of ['toString', 'constructor', '__proto__'])
        expect(await act(page, { id: input.id, action })).toMatchObject({
            status: 'refused',
            code: 'unsupported-action'
        });
});

test('snapshots are detached data and concurrent writes cannot overwrite an in-flight result', async ({ page }) => {
    const input = await control(page, 'Project name');
    const result = await page.evaluate(async (id) => {
        const api = (window as RuntimeWindow).radixAgentRuntime!;
        const detached = api.snapshot();
        const select = detached.controls.find((control) => control.kind === 'select')!;
        (select.options![0] as { label: string }).label = 'Mutated copy';
        const first = api.act({ id, action: 'set-value', value: 'First command' });
        const second = api.act({ id, action: 'set-value', value: 'Second command' });
        return { results: await Promise.all([first, second]), snapshot: api.snapshot() };
    }, input.id);
    expect(result.results[0]).toMatchObject({ status: 'applied', after: { value: 'First command' } });
    expect(result.results[1]).toMatchObject({ status: 'refused', code: 'busy' });
    expect(result.snapshot.controls.find((control) => control.kind === 'select')?.options?.[0].label).toBe('Private');
    expect((await model(page)).name).toBe('First command');
    expect((await events(page, 'input.value')).length).toBe(1);
});

test('invalid nonserializable arguments return a refusal through the public boundary', async ({ page }) => {
    const input = await control(page, 'Project name');
    const result = await page.evaluate(
        (id) => (window as RuntimeWindow).radixAgentRuntime!.act({ id, action: 'set-value', value: () => 'invalid' }),
        input.id
    );
    expect(result).toMatchObject({ status: 'refused', code: 'invalid-arguments' });
    expect((await model(page)).name).toBe('Radix project');
});

test('Input actions honor each registered native length constraint', async ({ page }) => {
    const input = await control(page, 'Project name');
    const dialog = await control(page, 'Project settings');
    const text = 'x'.repeat(121);
    expect(await act(page, { id: input.id, action: 'set-value', value: text })).toMatchObject({
        status: 'refused',
        code: 'invalid-arguments'
    });
    await act(page, { id: dialog.id, action: 'open' });
    const note = await control(page, 'Change note');
    await expect(page.getByRole('textbox', { name: 'Change note', exact: true })).not.toHaveAttribute('maxlength');
    expect(await act(page, { id: note.id, action: 'set-value', value: text })).toMatchObject({
        status: 'applied',
        after: { value: text }
    });
    expect((await model(page)).note).toBe(text);
    expect((await events(page, 'input.value')).length).toBe(1);
});

test('cancelable value callbacks preserve UI, form model and snapshots for commands and native UI', async ({
    page
}) => {
    const input = await control(page, 'Project name');
    const select = await control(page, 'Visibility');
    await page.getByRole('checkbox', { name: 'Cancel value changes', exact: true }).check();
    expect(await act(page, { id: input.id, action: 'set-value', value: 'Rejected' })).toMatchObject({
        status: 'canceled',
        after: { value: 'Radix project' }
    });
    expect(await act(page, { id: select.id, action: 'select-option', value: 'public' })).toMatchObject({
        status: 'canceled',
        after: { value: 'private' }
    });
    await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Rejected UI');
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue('Radix project');
    await page.getByRole('combobox', { name: 'Visibility', exact: true }).press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    expect(await model(page)).toMatchObject({ name: 'Radix project', visibility: 'private' });
    expect((await control(page, 'Visibility')).value).toBe('private');
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    expect((await events(page, 'input.value')).map((event) => event['canceled'])).toEqual([true, true]);
    expect((await events(page, 'select.value')).map((event) => event['canceled'])).toEqual([true, true]);
    await page.getByRole('checkbox', { name: 'Cancel value changes', exact: true }).uncheck();
    expect((await act(page, { id: input.id, action: 'set-value', value: 'Allowed' })).status).toBe('applied');
    expect((await act(page, { id: select.id, action: 'select-option', value: 'public' })).status).toBe('applied');
    expect(await model(page)).toMatchObject({ name: 'Allowed', visibility: 'public' });
    expect((await events(page, 'input.value')).length).toBe(3);
    expect((await events(page, 'select.value')).length).toBe(3);
});

test('disabled controls reject runtime and keyboard changes, and work again after unlock', async ({ page }) => {
    const input = await control(page, 'Project name');
    const select = await control(page, 'Visibility');
    const textbox = page.getByRole('textbox', { name: 'Project name', exact: true });
    const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await page.getByRole('checkbox', { name: 'Disable form controls', exact: true }).check();
    await expect(textbox).toBeDisabled();
    await expect(trigger).toBeDisabled();
    expect((await control(page, 'Project name')).disabled).toBe(true);
    expect((await control(page, 'Visibility')).disabled).toBe(true);
    for (const command of [
        { id: input.id, action: 'set-value', value: 'Blocked' },
        { id: select.id, action: 'select-option', value: 'public' },
        { id: select.id, action: 'open' }
    ])
        expect(await act(page, command)).toMatchObject({ status: 'refused', code: 'disabled' });
    await textbox.click({ force: true });
    await page.keyboard.type('Blocked');
    await trigger.click({ force: true });
    expect(await model(page)).toMatchObject({ name: 'Radix project', visibility: 'private' });
    expect(await events(page, 'input.value')).toEqual([]);
    expect(await events(page, 'select.value')).toEqual([]);
    expect((await control(page, 'Visibility')).open).toBe(false);
    await page.getByRole('checkbox', { name: 'Disable form controls', exact: true }).uncheck();
    await textbox.fill('Unlocked');
    expect((await act(page, { id: select.id, action: 'select-option', value: 'public' })).status).toBe('applied');
    expect(await model(page)).toMatchObject({ name: 'Unlocked', visibility: 'public' });
    expect((await events(page, 'input.value')).length).toBe(1);
    expect((await events(page, 'select.value')).length).toBe(1);
});

test('read-only prevents edits while Select can still open; disabled options remain unselectable', async ({ page }) => {
    const input = await control(page, 'Project name');
    const select = await control(page, 'Visibility');
    const textbox = page.getByRole('textbox', { name: 'Project name', exact: true });
    const trigger = page.getByRole('combobox', { name: 'Visibility', exact: true });
    await page.getByRole('checkbox', { name: 'Read-only form controls', exact: true }).check();
    await expect(textbox).toHaveAttribute('readonly', '');
    await expect(trigger).toHaveAttribute('aria-readonly', 'true');
    expect((await control(page, 'Project name')).readOnly).toBe(true);
    expect((await control(page, 'Visibility')).readOnly).toBe(true);
    await textbox.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('Blocked');
    await expect(textbox).toHaveValue('Radix project');
    for (const command of [
        { id: input.id, action: 'set-value', value: 'Blocked' },
        { id: select.id, action: 'select-option', value: 'public' }
    ])
        expect(await act(page, command)).toMatchObject({ status: 'refused', code: 'read-only' });
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    expect((await control(page, 'Visibility')).value).toBe('private');
    expect((await act(page, { id: select.id, action: 'close' })).status).toBe('applied');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    expect(await events(page, 'input.value')).toEqual([]);
    expect(await events(page, 'select.value')).toEqual([]);
    await page.getByRole('checkbox', { name: 'Read-only form controls', exact: true }).uncheck();
    await textbox.fill('Editable');
    await trigger.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    expect((await control(page, 'Visibility')).value).toBe('private');
    expect(await events(page, 'select.value')).toEqual([]);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('Public');
    expect(await model(page)).toMatchObject({ name: 'Editable', visibility: 'public' });
    expect((await events(page, 'input.value')).length).toBe(1);
    expect((await events(page, 'select.value')).length).toBe(1);
});

test('Dialog respects its trigger disability and cancelable controlled changes', async ({ page }) => {
    const dialog = await control(page, 'Project settings');
    expect(dialog.readOnly).toBeUndefined();
    const trigger = page.getByRole('button', { name: 'Project settings', exact: true });
    await page.getByRole('checkbox', { name: 'Disable dialog trigger', exact: true }).check();
    await expect(trigger).toBeDisabled();
    expect((await control(page, 'Project settings')).disabled).toBe(true);
    expect(await act(page, { id: dialog.id, action: 'open' })).toMatchObject({ status: 'refused', code: 'disabled' });
    await trigger.click({ force: true });
    expect(await events(page, 'dialog.open')).toEqual([]);
    await page.getByRole('checkbox', { name: 'Disable dialog trigger', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: 'Cancel dialog changes', exact: true }).check();
    expect((await act(page, { id: dialog.id, action: 'open' })).status).toBe('canceled');
    await trigger.click();
    expect((await formState(page))['dialogOpen']).toBe(false);
    expect((await control(page, 'Project settings')).open).toBe(false);
    await page.getByRole('checkbox', { name: 'Cancel dialog changes', exact: true }).uncheck();
    expect((await act(page, { id: dialog.id, action: 'open' })).status).toBe('applied');
    const popup = page.getByRole('dialog', { name: 'Project settings', exact: true });
    await expect(page.getByRole('textbox', { name: 'Change note', exact: true })).toBeFocused();
    await popup.getByRole('checkbox', { name: 'Cancel dialog changes', exact: true }).check();
    expect((await act(page, { id: dialog.id, action: 'close' })).status).toBe('canceled');
    await popup.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(popup).toBeVisible();
    expect((await formState(page))['dialogOpen']).toBe(true);
    await popup.getByRole('checkbox', { name: 'Cancel dialog changes', exact: true }).uncheck();
    expect((await act(page, { id: dialog.id, action: 'close' })).status).toBe('applied');
    await noOverlay(page);
    await expect(trigger).toBeFocused();
    expect((await events(page, 'dialog.open')).map((event) => event['canceled'])).toEqual([
        true,
        true,
        false,
        true,
        true,
        false
    ]);
});

test('Dialog initial focus, modality and nested Escape follow primitive ownership', async ({ page, browserName }) => {
    const dialog = await control(page, 'Project settings');
    expect((await act(page, { id: dialog.id, action: 'open' })).status).toBe('applied');
    const popup = page.getByRole('dialog', { name: 'Project settings', exact: true });
    await expect(popup).toHaveAccessibleDescription('Review the environment and add a change note.');
    await expect(page.getByRole('textbox', { name: 'Change note', exact: true })).toBeFocused();
    await expect.poll(async () => (await snapshot(page)).controls.length).toBe(5);
    expect((await query(page, { kind: 'select' })).status).toBe('ambiguous');
    const tab = tabKey(browserName);
    for (const key of [`Shift+${tab}`, tab, tab, tab, `Shift+${tab}`]) {
        await page.keyboard.press(key);
        await expect.poll(() => popup.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    const select = page.getByRole('combobox', { name: 'Environment', exact: true });
    await select.press('Enter');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(select).toBeFocused();
    await expect(popup).toBeVisible();
    await page.keyboard.press('Escape');
    await noOverlay(page);
    await expect(page.getByRole('button', { name: 'Project settings', exact: true })).toBeFocused();
    expect((await formState(page))['dialogOpen']).toBe(false);
    await expect.poll(async () => (await snapshot(page)).controls.length).toBe(3);
});

test('modal scope refuses background commands while allowing inside controls and Dialog close', async ({ page }) => {
    const input = await control(page, 'Project name');
    const visibility = await control(page, 'Visibility');
    const dialog = await control(page, 'Project settings');
    await act(page, { id: dialog.id, action: 'open' });
    const popup = page.getByRole('dialog', { name: 'Project settings', exact: true });
    const note = page.getByRole('textbox', { name: 'Change note', exact: true });
    await expect(note).toBeFocused();
    await expect(
        page.getByRole('textbox', { name: 'Project name', exact: true, includeHidden: true })
    ).toHaveJSProperty('isConnected', true);
    const before = await model(page);
    for (const command of [
        { id: visibility.id, action: 'open' },
        { id: visibility.id, action: 'select-option', value: 'public' },
        { id: input.id, action: 'set-value', value: 'Behind the modal' }
    ]) {
        expect(await act(page, command)).toMatchObject({ status: 'refused', code: 'unavailable' });
        await expect(note).toBeFocused();
        await expect(popup).toBeVisible();
    }
    expect((await control(page, 'Visibility')).available).toBe(false);
    expect((await control(page, 'Project name')).available).toBe(false);
    expect((await control(page, 'Project settings')).available).toBe(true);
    expect(await model(page)).toEqual(before);
    expect(await events(page, 'input.value')).toEqual([]);
    expect(await events(page, 'select.value')).toEqual([]);
    const inside = await control(page, 'Environment');
    expect((await act(page, { id: inside.id, action: 'select-option', value: 'production' })).status).toBe('applied');
    expect((await act(page, { id: dialog.id, action: 'close' })).status).toBe('applied');
    await noOverlay(page);
    await expect(page.getByRole('button', { name: 'Project settings', exact: true })).toBeFocused();
    expect((await control(page, 'Project name')).available).toBe(true);
    expect((await act(page, { id: input.id, action: 'set-value', value: 'After modal' })).status).toBe('applied');
    expect((await act(page, { id: visibility.id, action: 'open' })).status).toBe('applied');
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await act(page, { id: visibility.id, action: 'close' });
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
});

test('selecting the current value closes an open Select without another value callback', async ({ page }) => {
    const select = await control(page, 'Visibility');
    await act(page, { id: select.id, action: 'open' });
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    const result = await act(page, { id: select.id, action: 'select-option', value: 'private' });
    expect(result).toMatchObject({
        status: 'applied',
        before: { value: 'private', open: true },
        after: { value: 'private', open: false }
    });
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Visibility', exact: true })).toBeFocused();
    expect((await model(page)).visibility).toBe('private');
    expect(await events(page, 'select.value')).toEqual([]);
    expect((await events(page, 'select.open')).map((event) => event['open'])).toEqual([true, false]);
    expect((await act(page, { id: select.id, action: 'select-option', value: 'private' })).status).toBe('unchanged');
    expect(await events(page, 'select.value')).toEqual([]);
    expect((await events(page, 'select.open')).length).toBe(2);
});

test('selecting the current value reports a canceled close, preserves focus and can retry after the veto', async ({
    page
}) => {
    const select = await control(page, 'Visibility');
    await page.getByRole('checkbox', { name: 'Cancel Select close', exact: true }).check();
    await act(page, { id: select.id, action: 'open' });
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    const result = await act(page, { id: select.id, action: 'select-option', value: 'private' });
    expect(result).toMatchObject({
        status: 'canceled',
        before: { value: 'private', open: true },
        after: { value: 'private', open: true }
    });
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    expect((await formState(page))['visibilityOpen']).toBe(true);
    expect((await model(page)).visibility).toBe('private');
    expect(await events(page, 'select.value')).toEqual([]);
    expect(await events(page, 'select.open')).toContainEqual(expect.objectContaining({ open: false, canceled: true }));
    await page.getByRole('checkbox', { name: 'Cancel Select close', exact: true }).uncheck();
    // Establish an explicit outside focus target across native macOS/WebKit focus preferences.
    await page.getByRole('checkbox', { name: 'Cancel Select close', exact: true }).focus();
    expect((await act(page, { id: select.id, action: 'select-option', value: 'private' })).status).toBe('applied');
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    // Unlocking deliberately focused an outside control; closing must preserve that focus.
    await expect(page.getByRole('checkbox', { name: 'Cancel Select close', exact: true })).toBeFocused();
    await act(page, { id: select.id, action: 'open' });
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    await act(page, { id: select.id, action: 'select-option', value: 'private' });
    await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Visibility', exact: true })).toBeFocused();
    expect(await events(page, 'select.value')).toEqual([]);
});

test('tool schemas agree with real boundary validation and contextual refusal results', async ({ page }) => {
    const input = await control(page, 'Project name');
    const state = await snapshot(page);
    expect(toolResultSchemas.snapshot.safeParse(state).success).toBe(true);
    expect(input.constraints).toEqual({ required: true, maxLength: 120 });
    for (const filter of [{}, { name: 'Project name' }, { id: 'missing' }, { kind: 'button' }, { extra: true }, null]) {
        const result = await query(page, filter);
        expect(result.status === 'invalid-query').toBe(!toolInputSchemas.query.safeParse(filter).success);
        expect(toolResultSchemas.query.safeParse(result).success).toBe(true);
    }
    for (const command of [
        { id: input.id, action: 'set-value', value: 'Schema project' },
        { id: input.id, action: 'set-value' },
        { id: input.id, action: 'set-value', value: null },
        { id: input.id, action: 'open', value: 'unexpected' },
        { id: input.id, action: 'set-value', value: 'x', extra: true },
        { id: 'missing', action: 'open' },
        { id: input.id, action: 'toString' }
    ]) {
        const result = await act(page, command);
        if (!toolInputSchemas.act.safeParse(command).success) expect(result.status).toBe('refused');
        expect(toolResultSchemas.act.safeParse(result).success).toBe(true);
    }
    const invalidSnapshot = await page.evaluate(() => {
        try {
            (window as RuntimeWindow).radixAgentRuntime!.snapshot({ extra: true });
            return false;
        } catch {
            return true;
        }
    });
    expect(invalidSnapshot).toBe(true);
});

test('Project settings keeps vertical separation between description, fields and footer', async ({ page }) => {
    await act(page, { id: (await control(page, 'Project settings')).id, action: 'open' });
    const popup = page.getByRole('dialog', { name: 'Project settings', exact: true });
    const description = (await popup.locator('[rdxDialogDescription]').boundingBox())!;
    const fields = await popup.getByTestId('agent-dialog-fields').evaluate((element) =>
        [...element.children].map((child) => {
            const rect = child.getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom };
        })
    );
    expect(fields[0].top - description.y - description.height).toBeGreaterThanOrEqual(20);
    expect(fields[1].top - fields[0].bottom).toBeGreaterThanOrEqual(16);
    expect(fields[2].top - fields[1].bottom).toBeGreaterThanOrEqual(16);
    const close = (await popup.getByRole('button', { name: 'Close via runtime', exact: true }).boundingBox())!;
    expect(close.y - fields[2].bottom).toBeGreaterThanOrEqual(20);
    const link = (await popup.getByRole('link', { name: 'All primitives', exact: true }).boundingBox())!;
    expect(link.y - close.y - close.height).toBeGreaterThanOrEqual(12);
    await popup.screenshot({ path: test.info().outputPath('dialog-layout.png'), animations: 'disabled' });
});

test('a late child Select exit cannot steal restored focus after runtime Dialog close', async ({ page }) => {
    const dialog = await control(page, 'Project settings');
    await act(page, { id: dialog.id, action: 'open' });
    const environment = await control(page, 'Environment');
    await act(page, { id: environment.id, action: 'open' });
    await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
    const held = await holdExitAnimations(page, ['[rdxSelectPopup]'], 'data-ending-style');
    expect((await act(page, { id: environment.id, action: 'select-option', value: 'production' })).status).toBe(
        'applied'
    );
    await expect.poll(() => held.count()).toBeGreaterThan(0);
    expect((await act(page, { id: dialog.id, action: 'close' })).status).toBe('applied');
    await expect(page.getByTestId('agent-backdrop')).toHaveCount(0);
    await held.finish();
    await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    await noOverlay(page);
    await expect(page.getByRole('button', { name: 'Project settings', exact: true })).toBeFocused();
    expect((await model(page)).environment).toBe('production');
});

test('navigation destroys registrations, rejects stale IDs and leaves other playground controls usable', async ({
    page
}) => {
    const allIds = new Set<string>();
    for (let visit = 0; visit < 3; visit++) {
        const before = await snapshot(page);
        for (const { id } of before.controls) {
            expect(allIds.has(id)).toBe(false);
            allIds.add(id);
        }
        const input = await control(page, 'Project name');
        const select = await control(page, 'Visibility');
        const dialog = await control(page, 'Project settings');
        await page.evaluate(() => {
            (window as RuntimeWindow).savedAgentRuntime = (window as RuntimeWindow).radixAgentRuntime;
        });
        await act(page, { id: input.id, action: 'set-value', value: `Visit ${visit}` });
        await act(page, { id: select.id, action: 'select-option', value: 'public' });
        expect((await events(page, 'input.value')).length).toBe(1);
        expect((await events(page, 'select.value')).length).toBe(1);
        await act(page, { id: dialog.id, action: 'open' });
        const environment = await control(page, 'Environment');
        await act(page, { id: environment.id, action: 'open' });
        await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
        await page.getByRole('dialog').getByRole('link', { name: 'All primitives', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Radix NG Playground', exact: true })).toBeVisible();
        expect(await page.evaluate(() => (window as RuntimeWindow).radixAgentRuntime)).toBeUndefined();
        expect(await page.evaluate(() => (window as RuntimeWindow).savedAgentRuntime!.snapshot().controls)).toEqual([]);
        await noOverlay(page);
        await page.getByRole('navigation').getByRole('link', { name: 'Select', exact: true }).click();
        const other = page.getByRole('combobox', { name: 'Pick a fruit', exact: true });
        await other.press('Enter');
        await expect(page.locator('[rdxSelectPopup]')).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.locator('[rdxSelectPopup]')).toHaveCount(0);
        await page.getByRole('navigation').getByRole('link', { name: 'Agents', exact: true }).click();
        await opened(page);
        const stale = await page.evaluate(
            (id) =>
                (window as RuntimeWindow).savedAgentRuntime!.act({ id, action: 'set-value', value: 'Stale command' }),
            input.id
        );
        expect(stale).toMatchObject({ status: 'refused', code: 'unknown-id' });
        expect(await model(page)).toMatchObject({ name: 'Radix project', visibility: 'private' });
        expect((await snapshot(page)).controls.length).toBe(3);
    }
});

test('predefined buttons use the runtime and show outcomes and refusals in the journal', async ({ page }) => {
    await page.getByRole('button', { name: 'Rename via runtime', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue('Agent project');
    await expect(page.getByTestId('runtime-result')).toContainText('applied');
    await page.getByRole('button', { name: 'Unsupported action', exact: true }).click();
    await expect(page.getByTestId('runtime-result')).toContainText('unsupported-action');
    await page.getByRole('button', { name: 'Unknown instance', exact: true }).click();
    await expect(page.getByTestId('runtime-result')).toContainText('unknown-id');
    expect((await journal(page)).filter(({ type }) => type === 'command').length).toBe(3);
    await page.getByRole('button', { name: 'Clear journal', exact: true }).click();
    await expect.poll(() => journal(page)).toEqual([]);
});

test('production route exists on disk, loads assets, refreshes directly and is linked by the shell', async ({
    page,
    request
}) => {
    expect(readFileSync(resolve(__dirname, '../../../tools/scripts/build-site.mjs'), 'utf8')).toContain(
        "'playground/agents'"
    );
    const html = readFileSync(resolve(__dirname, '../../../dist/radix-site/playground/agents/index.html'), 'utf8');
    expect(html).toContain('<base href="/">');
    expect((await request.get('/playground/agents/index.html')).status()).toBe(200);
    expect((await request.get('/not-a-static-route')).status()).toBe(404);
    expect(assets.get(page)?.some((url) => /\.js($|\?)/.test(url))).toBe(true);
    expect(assets.get(page)?.some((url) => /\.css($|\?)/.test(url))).toBe(true);
    await page.reload();
    await opened(page);
    await page.getByRole('link', { name: 'Radix NG Playground', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Radix NG Playground', exact: true })).toBeVisible();
    await page.getByRole('navigation').getByRole('link', { name: 'Agents', exact: true }).click();
    await opened(page);
    const theme = page.getByRole('button', { name: /Switch to .* theme/ });
    const before = await page.locator('html').getAttribute('data-theme');
    await theme.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before!);
});

test('the registry remains readable on a narrow viewport with local horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const registry = page.getByRole('region', { name: 'Registered controls', exact: true });
    const name = registry.getByRole('cell', { name: 'Project name', exact: true });
    await expect
        .poll(() =>
            name.evaluate((element) => {
                const text = element.ownerDocument.createRange();
                text.selectNodeContents(element);
                return text.getClientRects().length;
            })
        )
        .toBe(1);
    expect(await registry.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
