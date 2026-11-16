import { expect } from '@playwright/test';
import { controlledCases, type ControlledCaseName } from '../src/controlled';
import type { TabsDriver } from './driver';

type Selection = '0' | '1' | '2' | 'null' | 'missing';
interface Request {
    value: string;
    reason: string;
    direction: string;
    canceled: boolean;
    type: 'click' | 'focusin';
    trusted: boolean;
}
async function checkpoint(driver: TabsDriver, name: string, value: Selection, direction: string, changes: Request[]) {
    const snapshot = await driver.page.evaluate(async () => {
        const read = () => {
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const { catalog, parent, outputs } = window.tabsControlled;
            const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
            const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
            const indicator = root.querySelector<HTMLElement>('[data-testid="indicator"]');
            const visible = !!indicator && !indicator.hidden && indicator.getClientRects().length > 0;
            return {
                state: {
                    parent: catalog.encode(parent()),
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
                    calls: catalog.calls(),
                    changes: window.tabsParity.changes.map((change, index) => ({
                        value: catalog.encode(change.value),
                        reason: change.reason,
                        direction: change.activationDirection,
                        canceled: change.canceled,
                        type: window.tabsParity.nativeEvents[index].type,
                        trusted: window.tabsParity.nativeEvents[index].trusted
                    }))
                },
                dom: root.outerHTML,
                outputs: outputs.map(catalog.encode),
                bounds: {
                    tabs: tabs.map((tab) => ({
                        key: tab.dataset.testid,
                        rect: tab.getBoundingClientRect().toJSON(),
                        id: tab.id,
                        controls: tab.getAttribute('aria-controls')
                    })),
                    panels: panels.map((panel) => ({
                        key: panel.dataset.testid,
                        id: panel.id,
                        label: panel.getAttribute('aria-labelledby')
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
        throw new Error('Controlled Tabs did not settle');
    });
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({
        name,
        dom: snapshot.dom,
        focus: snapshot.state.focus ?? null,
        bounds: { ...snapshot.bounds, valueChangeOutputs: snapshot.outputs }
    });
    const selection = value === 'null' || value === 'missing' ? [] : [value];
    expect(snapshot.state.parent, `${driver.framework}: ${name} parent`).toBe(value);
    expect(snapshot.state.selected, `${driver.framework}: ${name} selection`).toEqual(selection);
    expect(snapshot.state.panels, `${driver.framework}: ${name} Panels`).toEqual(selection);
    expect(snapshot.state.indicator.visible).toBe(selection.length > 0);
    expect(
        snapshot.state.directions.every((actual) => actual === direction),
        `${driver.framework}: ${name} direction`
    ).toBe(true);
    expect(snapshot.state.changes, `${driver.framework}: ${name} callbacks`).toEqual(changes);
    expect(snapshot.state.calls).toBe(0);
    if (driver.framework === 'angular')
        expect(snapshot.outputs).toEqual(changes.filter((change) => !change.canceled).map(() => '1'));
    expect(driver.errors).toEqual([]);
}

export const controlledScenarios = (Object.keys(controlledCases) as ControlledCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = controlledCases[name].controlled!;
        const changes: Request[] = [];
        let current: Selection = settings.initial ?? '0',
            direction = 'none';
        const vertical = settings.orientation === 'vertical',
            rtl = settings.dir === 'rtl';
        const negative = vertical ? 'up' : rtl ? 'right' : 'left';
        const positive = vertical ? 'down' : rtl ? 'left' : 'right';
        const positions = { '0': 1, '1': 0, '2': 2 };
        const movement = (from: Selection, to: Selection) => {
            if (from === 'null' || to === 'null') return 'none';
            if (from === 'missing' || to === 'missing') return vertical ? 'up' : 'left';
            return positions[to] < positions[from] ? negative : positions[to] > positions[from] ? positive : direction;
        };
        const accept = (next: Selection) => {
            if (next !== current) {
                direction = movement(current, next);
                current = next;
            }
        };
        const request = (type: 'click' | 'focusin') => {
            if (current === '1') return;
            changes.push({
                value: '1',
                reason: 'none',
                direction: movement(current, '1'),
                canceled: settings.policy === 'cancel',
                type,
                trusted: true
            });
            if (settings.policy === 'accept') accept('1');
            if (settings.policy === 'replace') accept('2');
            if (settings.policy === 'null') accept('null');
        };
        const check = (label: string) => checkpoint(driver, label, current, direction, changes);
        const macWebkit =
            driver.page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
        const tabKey = macWebkit ? 'Alt+Tab' : 'Tab';
        await driver.page.keyboard.press(tabKey);
        await expect(driver.page.getByTestId('outside')).toBeFocused();
        await check('initial controlled value');
        await driver.page.keyboard.press(tabKey);
        if (!settings.initial)
            await driver.page.keyboard.press(vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft');
        await expect(driver.page.getByTestId('tab-1')).toBeFocused();
        if (settings.automatic) request('focusin');
        else {
            await check('native focus before request');
            await driver.page.keyboard.press('Enter');
            request('click');
        }
        await check('parent response');
        await driver.page.keyboard.press('Enter');
        request('click');
        await check('repeated native request');
        if (settings.policy === 'delay') {
            await driver.page.keyboard.press('F2');
            accept('1');
            await check('parent accepts pending value');
        }
        await driver.page.keyboard.press('F4');
        accept('2');
        await check('external parent update');
        await driver.page.keyboard.press('F6');
        accept('1');
        await check('external requested value');
        await driver.page.keyboard.press('F3');
        accept('0');
        await check('external reset');
        await driver.page.keyboard.press('Enter');
        request('click');
        await check('request after external direction');
    }
}));
