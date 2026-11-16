import { expect } from '@playwright/test';
import { collectionCases, collectionModel, type CollectionCaseName, type CollectionKind } from '../src/collection';
import type { Change, Value } from '../src/contract';
import type { TabsDriver } from './driver';

async function checkpoint(driver: TabsDriver, name: string, step: number, value: Value, changes: Change[]) {
    const snapshot = await driver.page.evaluate(async () => {
        const read = () => {
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const list = root.querySelector<HTMLElement>('[role="tablist"]');
            const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
            const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
            return {
                state: {
                    list: !!list,
                    selected: tabs
                        .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                        .map((tab) => Number(tab.dataset.value)),
                    visiblePanels: panels
                        .filter((panel) => !panel.hidden && panel.getClientRects().length > 0)
                        .map((panel) => Number(panel.dataset.value)),
                    tabs: tabs.map((tab) => ({
                        value: Number(tab.dataset.value),
                        selected: tab.getAttribute('aria-selected'),
                        disabled: tab.getAttribute('aria-disabled'),
                        tabIndex: tab.tabIndex,
                        direction: tab.getAttribute('data-activation-direction')
                    })),
                    panels: panels.map((panel) => ({
                        value: Number(panel.dataset.value),
                        hidden: panel.hidden,
                        inert: panel.inert,
                        tabIndex: panel.tabIndex,
                        direction: panel.getAttribute('data-activation-direction')
                    })),
                    direction: root.getAttribute('data-activation-direction'),
                    listDirection: list?.getAttribute('data-activation-direction') ?? null,
                    focus:
                        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null,
                    changes: window.tabsParity.changes
                },
                dom: root.outerHTML,
                bounds: {
                    tabs: tabs.map((tab) => tab.getBoundingClientRect().toJSON()),
                    identities: [...tabs, ...panels].map((part) => ({
                        part: part.dataset.testid,
                        id: part.id,
                        controls: part.getAttribute('aria-controls'),
                        label: part.getAttribute('aria-labelledby')
                    }))
                }
            };
        };
        let previous = '';
        let stable = 0;
        for (let frame = 0; frame < 120; frame++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const snapshot = read();
            const json = JSON.stringify(snapshot);
            stable = json === previous ? stable + 1 : 0;
            if (stable >= 3) return snapshot;
            previous = json;
        }
        throw new Error('Tabs collection did not settle');
    });
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({ name, dom: snapshot.dom, focus: snapshot.state.focus, bounds: snapshot.bounds });
    const settings = await driver.page.evaluate(() => window.tabsParity.config.collection!);
    const model = collectionModel(settings, step);
    expect(snapshot.state, `${driver.framework}: ${name}`).toEqual(
        expect.objectContaining({
            list: model.showList,
            selected: model.showList && model.options.some((option) => option.value === value) ? [value] : [],
            visiblePanels: value === null ? [] : [value],
            changes
        })
    );
    expect(snapshot.state.tabs.map((tab) => tab.value)).toEqual(
        model.showList ? model.options.map((option) => option.value) : []
    );
    expect(driver.errors).toEqual([]);
}

const expectedValues: Record<CollectionKind, Value[]> = {
    'remove-selected': [1, 0, 0],
    'remove-last': [1, null, null],
    'empty-refill': [1, null, null],
    'empty-new-values': [1, null, null],
    'initial-empty': [1, 1, null],
    'initial-empty-missing': [1, 3, null],
    'implicit-empty': [0, 3, null],
    'initial-all-disabled': [0, null, null],
    'replace-empty': [1, null, null],
    'replace-populated': [1, 1, 1],
    'unmount-list': [1, 1, 1],
    'unmount-empty': [1, 1, null, null],
    'remove-unselected': [1, 1, 1],
    reorder: [1, 1, 1],
    'replace-selected': [1, 1, 1],
    'replace-values': [1, 3, 0],
    'disable-selected': [1, 0, 0],
    'all-disabled': [1, null, null],
    'disabled-default': [1, 1, 0],
    'honor-disabled': [1, 1, 1, 0],
    'native-remove': [1, 0, 0]
};

export const collectionScenarios = (Object.keys(collectionCases) as CollectionCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = collectionCases[name].collection!;
        const values = settings.controlled ? [1, 1, 1] : [...expectedValues[settings.kind]];
        if (settings.activateOnFocus && settings.kind === 'disable-selected') values[2] = 2;
        if (settings.activateOnFocus && settings.kind === 'reorder' && !settings.cancelRequests) {
            values[1] = 2;
            values[2] = 2;
        }
        const changes: Change[] = [];
        let current = values[0];
        const change = (value: Value, reason: string, direction = 'none') =>
            changes.push({
                value,
                reason,
                activationDirection: direction,
                canceled: reason === 'none' ? !!settings.cancelRequests : !!settings.cancelAutomatic
            });
        const vertical = settings.orientation === 'vertical';
        const forward = vertical ? 'ArrowDown' : 'ArrowRight';
        const backward = vertical ? 'ArrowUp' : 'ArrowLeft';
        const macWebkit =
            driver.page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
        const tabKey = macWebkit ? 'Alt+Tab' : 'Tab';

        await driver.page.keyboard.press(tabKey);
        await expect(driver.page.getByTestId('outside')).toBeFocused();
        await checkpoint(driver, 'initial collection', 0, current, changes);
        if (settings.focus) {
            await driver.page.keyboard.press(tabKey);
            await expect(driver.page.getByTestId('tab-1')).toBeFocused();
            if (settings.focus === 'last') await driver.page.keyboard.press(forward);
            if (settings.focus === 'first') await driver.page.keyboard.press(backward);
            if (settings.activateOnFocus && settings.focus === 'last') {
                change(2, 'none', 'right');
                if (!settings.cancelRequests) current = 2;
            }
            await checkpoint(driver, 'native focus before mutation', 0, current, changes);
        }
        if (settings.kind === 'native-remove') {
            await driver.page.getByTestId('tab-2').press('Enter');
            current = 2;
            change(2, 'none', 'right');
            await checkpoint(driver, 'accepted native request before removal', 0, current, changes);
        }

        for (let step = 1; step < values.length; step++) {
            await driver.page.keyboard.press(`F${step + 1}`);
            const next = values[step];
            if (next !== current) {
                const reason =
                    settings.implicit && step === 1
                        ? 'initial'
                        : ['disable-selected', 'all-disabled', 'disabled-default', 'honor-disabled'].includes(
                                settings.kind
                            )
                          ? 'disabled'
                          : 'missing';
                change(next, reason);
                current = next;
            }
            await checkpoint(driver, `collection mutation ${step}`, step, current, changes);
            if (step === 1 && settings.activateOnFocus && settings.kind === 'disable-selected') {
                await expect(driver.page.getByTestId('tab-1')).toBeFocused();
                await driver.page.keyboard.press(forward);
                current = 2;
                change(2, 'none', 'right');
                await checkpoint(driver, 'automatic focus activation after fallback', step, current, changes);
            }
        }
        const step = values.length - 1;
        if (settings.activateOnFocus && settings.kind === 'reorder') {
            await expect(driver.page.getByTestId('tab-2')).toBeFocused();
            await driver.page.keyboard.press(backward);
            if (current !== 1) change(1, 'none', 'left');
            current = 1;
            await checkpoint(driver, 'native keyboard continuation', step, current, changes);
            return;
        }
        if (collectionModel(settings, step).options.length && collectionModel(settings, step).showList) {
            // A separate user-navigation phase begins after the mutation's actual focus was recorded.
            await driver.page.getByTestId('outside').focus();
            await driver.page.keyboard.press(tabKey);
            await expect(driver.page.locator('[role="tab"]:focus')).toHaveCount(1);
            await checkpoint(driver, 'native list re-entry', step, current, changes);
            if (current === null) {
                const focused = await driver.page.evaluate(() =>
                    Number((document.activeElement as HTMLElement).dataset.value)
                );
                await driver.page.keyboard.press('Enter');
                current = focused;
                change(focused, 'none');
                await checkpoint(driver, 'native recovery from null selection', step, current, changes);
            }
            if (!settings.activateOnFocus) {
                await driver.page.keyboard.press(forward);
                await checkpoint(driver, 'native keyboard continuation', step, current, changes);
            }
        }
    }
}));
