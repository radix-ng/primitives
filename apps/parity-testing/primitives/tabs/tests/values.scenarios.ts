import { expect } from '@playwright/test';
import { createValues, valueCases, type ValueCaseName } from '../src/values';
import type { TabsDriver } from './driver';

async function checkpoint(
    driver: TabsDriver,
    name: string,
    selected: string[],
    changes: unknown[],
    panelsExpected: string[],
    indicatorExpected: boolean
) {
    const snapshot = await driver.page.evaluate(async () => {
        const read = () => {
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const { catalog } = window.tabsValues;
            const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
            const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
            const parts = [...tabs, ...panels];
            const names = (id: string | null) =>
                parts.filter((part) => part.id === id).map((part) => part.dataset.testid!);
            const indicator = root.querySelector<HTMLElement>('[data-testid="indicator"]');
            const visible = !!indicator && !indicator.hidden && indicator.getClientRects().length > 0;
            return {
                state: {
                    selected: tabs
                        .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                        .map((tab) => tab.dataset.testid!.slice(4)),
                    panels: panels
                        .filter((panel) => !panel.hidden && panel.getClientRects().length > 0)
                        .map((panel) => panel.dataset.testid!.slice(6)),
                    tabs: tabs.map((tab) => ({
                        key: tab.dataset.testid,
                        selected: tab.getAttribute('aria-selected'),
                        disabled: tab.getAttribute('aria-disabled'),
                        tabIndex: tab.tabIndex
                    })),
                    panelState: panels.map((panel) => ({
                        key: panel.dataset.testid,
                        hidden: panel.hidden,
                        inert: panel.inert,
                        tabIndex: panel.tabIndex
                    })),
                    controls: tabs.map((tab) => ({
                        key: tab.dataset.testid,
                        targets: names(tab.getAttribute('aria-controls'))
                    })),
                    labels: panels.map((panel) => ({
                        key: panel.dataset.testid,
                        targets: names(panel.getAttribute('aria-labelledby'))
                    })),
                    directions: [
                        root,
                        ...root.querySelectorAll('[role="tablist"], [role="tab"], [role="tabpanel"]')
                    ].map((part) => part.getAttribute('data-activation-direction')),
                    indicator: {
                        visible,
                        variables: visible
                            ? ['left', 'right', 'top', 'bottom', 'width', 'height'].map((axis) =>
                                  indicator!.style.getPropertyValue(`--active-tab-${axis}`)
                              )
                            : null
                    },
                    focus: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
                    changes: window.tabsParity.changes.map((change) => ({
                        matches: catalog.options
                            .filter((option) => Object.is(option.value, change.value))
                            .map((option) => option.key),
                        type: typeof change.value,
                        null: change.value === null,
                        undefined: change.value === undefined,
                        reason: change.reason,
                        direction: change.activationDirection,
                        canceled: change.canceled
                    })),
                    counters: catalog.counters(),
                    associations: parts.every((part) => {
                        const key = part.dataset.testid!.replace(/^(tab|panel)-/, '');
                        const panel = part.getAttribute('role') === 'tabpanel';
                        const counterpart = `${panel ? 'tab' : 'panel'}-${key}`;
                        const expected =
                            parts.some((candidate) => candidate.dataset.testid === counterpart) &&
                            !(panel && key === 'second' && window.tabsParity.config.values!.kind === 'nan');
                        const actual = names(part.getAttribute(panel ? 'aria-labelledby' : 'aria-controls'));
                        return expected ? actual.length === 1 && actual[0] === counterpart : actual.length === 0;
                    }),
                    uniqueIds:
                        new Set(parts.map((part) => part.id)).size === parts.length && parts.every((part) => !!part.id)
                },
                dom: root.outerHTML,
                bounds: {
                    parts: parts.map((part) => ({
                        key: part.dataset.testid,
                        id: part.id,
                        controls: part.getAttribute('aria-controls'),
                        label: part.getAttribute('aria-labelledby'),
                        rect: part.getBoundingClientRect().toJSON()
                    })),
                    nativeEvents: window.tabsParity.nativeEvents
                }
            };
        };
        let previous = '',
            stable = 0;
        for (let frame = 0; frame < 120; frame++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const current = read(),
                json = JSON.stringify(current);
            stable = json === previous ? stable + 1 : 0;
            if (stable >= 3) return current;
            previous = json;
        }
        throw new Error('Value identities did not settle');
    });
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({ name, dom: snapshot.dom, focus: snapshot.state.focus ?? null, bounds: snapshot.bounds });
    expect(snapshot.state.selected, `${driver.framework}: ${name}`).toEqual(selected);
    expect(snapshot.state.panels, `${driver.framework}: ${name} Panels`).toEqual(panelsExpected);
    expect(snapshot.state.indicator.visible, `${driver.framework}: ${name} Indicator`).toBe(indicatorExpected);
    // Retained Panels expose selected values even when their Tab has been removed.
    expect(snapshot.state.changes, `${driver.framework}: ${name} callbacks`).toEqual(changes);
    expect(snapshot.state.counters).toEqual({ calls: 0, coercions: 0 });
    expect(snapshot.state.uniqueIds).toBe(true);
    expect(snapshot.state.associations).toBe(true);
    expect(driver.errors).toEqual([]);
}

export const valueScenarios = (Object.keys(valueCases) as ValueCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = valueCases[name].values!,
            catalog = createValues(settings);
        const changes: unknown[] = [];
        const add = (index: number | null, reason: string, direction = 'none', canceled = false) => {
            const value = index === null ? null : catalog.options[index].value;
            changes.push({
                matches: index === null ? [] : [catalog.options[index].key],
                type: typeof value,
                null: value === null,
                undefined: value === undefined,
                reason,
                direction,
                canceled
            });
        };
        const special = settings.kind === 'null' || settings.kind === 'undefined';
        let current: number | null = settings.missing && settings.controlled ? -1 : 0;
        const selected = (removed = false) =>
            current === null || current === -1 ? [] : removed && current === 0 ? [] : [catalog.options[current].key];
        const check = (label: string, removed = false) =>
            checkpoint(
                driver,
                label,
                selected(removed),
                changes,
                current === null || current === -1 ? [] : [catalog.options[current].key],
                selected(removed).length > 0 &&
                    current !== null &&
                    current !== -1 &&
                    catalog.options[current].value != null
            );
        if (settings.implicit || (settings.missing && !settings.controlled))
            add(0, settings.implicit ? 'initial' : 'missing');
        await check('initial value identity');
        await driver.page.getByTestId('tab-second').click();
        {
            add(
                1,
                'none',
                special ? 'none' : settings.kind === 'nan' ? 'left' : current === -1 ? 'none' : 'right',
                !!settings.cancel
            );
            if (!settings.cancel) current = 1;
        }
        await check('native second value');
        await driver.page.getByTestId('tab-second').click();
        if (settings.cancel) add(1, 'none', special ? 'none' : settings.kind === 'nan' ? 'left' : 'right', true);
        await check('repeated native request');
        await driver.page.getByTestId('tab-first').press('Enter');
        if (current !== 0) {
            add(0, 'none', special ? 'none' : 'left');
            current = 0;
        }
        await check('native first value');
        // NaN never matches itself with ===. Probe its raw callback identity through cancellation;
        // this case does not certify NaN as a selected identity.
        if (settings.kind === 'nan') return;
        await driver.page.keyboard.press('F2');
        if (!settings.controlled) {
            current = settings.kind === 'undefined' ? null : 1;
            add(current, 'missing');
        }
        await check('remove selected identity', true);
        await driver.page.keyboard.press('F3');
        await check('refill value identities');
        await driver.page.keyboard.press('F4');
        if (!settings.controlled && current === 1) {
            current = 0;
            add(0, 'disabled');
        }
        await check('disable selected identity');
        if (settings.controlled) {
            await driver.page.keyboard.press('F5');
            current = 2;
            await check('external third identity');
            await driver.page.keyboard.press('F6');
            current = 0;
            await check('external first identity');
        }
    }
}));
