import { expect } from '@playwright/test';
import { indicatorCases, indicatorModel, type IndicatorCaseName } from '../src/indicator';
import type { TabsDriver } from './driver';

async function checkpoint(driver: TabsDriver, name: string, step: number) {
    const snapshot = await driver.page.evaluate(async () => {
        const read = () => {
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const list = root.querySelector<HTMLElement>('[role="tablist"]')!;
            const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
            const active = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
            const rect = active?.getBoundingClientRect();
            const listRect = list.getBoundingClientRect();
            const expected =
                active && rect && rect.width > 0 && rect.height > 0
                    ? {
                          left: rect.left - listRect.left,
                          top: rect.top - listRect.top,
                          width: Number.parseFloat(getComputedStyle(active).width),
                          height: Number.parseFloat(getComputedStyle(active).height)
                      }
                    : null;
            const keys = ['top', 'right', 'bottom', 'left', 'width', 'height'] as const;
            const indicators = [0, ...(window.tabsParity.config.indicator === 'multiple' ? [1] : [])].map((id) => {
                const element = root.querySelector<HTMLElement>(`[data-testid="indicator-${id}"]`);
                if (!element) return { host: { present: false }, visible: false, geometry: null, rect: null };
                const style = getComputedStyle(element);
                const bounds = element.getBoundingClientRect();
                const geometry = Object.fromEntries(
                    keys.map((key) => [key, Number.parseFloat(style.getPropertyValue(`--active-tab-${key}`))])
                );
                return {
                    host: { present: true, hidden: element.hidden, role: element.getAttribute('role') },
                    visible:
                        !element.hidden &&
                        style.display !== 'none' &&
                        style.visibility !== 'hidden' &&
                        bounds.width > 0 &&
                        bounds.height > 0,
                    geometry: keys.every((key) => Number.isNaN(geometry[key])) ? null : geometry,
                    rect: bounds.toJSON()
                };
            });
            return {
                state: {
                    selected: active ? [Number(active.dataset.value)] : [],
                    hosts: indicators.map((indicator) => indicator.host),
                    visible: indicators.map((indicator) => indicator.visible),
                    geometry: indicators.map((indicator) => indicator.geometry),
                    changes: window.tabsParity.changes
                },
                expected: expected
                    ? {
                          ...expected,
                          right: list.scrollWidth - expected.left - expected.width,
                          bottom: list.scrollHeight - expected.top - expected.height
                      }
                    : null,
                bounds: {
                    list: listRect.toJSON(),
                    scrollWidth: list.scrollWidth,
                    scrollHeight: list.scrollHeight,
                    tabs: tabs.map((tab) => tab.getBoundingClientRect().toJSON()),
                    indicators: indicators.map((indicator) => indicator.rect)
                },
                dom: root.outerHTML,
                focus: document.activeElement?.getAttribute('data-testid') ?? null
            };
        };
        let previous = '';
        let stable = 0;
        for (let frame = 0; frame < 120; frame++) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const result = read();
            const json = JSON.stringify(result);
            stable = json === previous ? stable + 1 : 0;
            if (stable >= 3) return result;
            previous = json;
        }
        throw new Error('Tabs indicator did not settle');
    });
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({ name, dom: snapshot.dom, focus: snapshot.focus, bounds: snapshot.bounds });
    const kind = await driver.page.evaluate(() => window.tabsParity.config.indicator!);
    const model = indicatorModel(kind, step);
    const displayed =
        model.indicators.length > 0 &&
        model.value === 1 &&
        !(['hidden', 'zero-width', 'zero-height'].includes(kind) && step !== 1);
    expect(snapshot.state.selected).toEqual(model.value === 1 ? [1] : []);
    expect(snapshot.state.changes).toEqual([]);
    const count = kind === 'multiple' ? 2 : 1;
    expect(snapshot.state.visible, `${driver.framework}: ${name} visibility`).toEqual(Array(count).fill(displayed));
    for (let id = 0; id < count; id++) {
        const present = model.indicators.includes(id) && (driver.framework === 'angular' || model.value !== null);
        expect(snapshot.state.hosts[id], `${driver.framework}: ${name} host`).toEqual(
            present ? { present: true, hidden: !displayed, role: 'presentation' } : { present: false }
        );
        if (displayed) {
            for (const [key, value] of Object.entries(snapshot.expected!))
                expect(snapshot.state.geometry[id]?.[key], `${driver.framework}: ${name} ${key}`).toBeCloseTo(value, 2);
            const rect = snapshot.bounds.indicators[id]!;
            // CSS serialization followed by layout can round by a native layout unit. Allow
            // <0.05 CSS px for rendered boxes; the six variable values still compare exactly.
            expect(rect.x).toBeCloseTo(snapshot.bounds.list.x + snapshot.expected!.left, 1);
            expect(rect.y).toBeCloseTo(snapshot.bounds.list.y + snapshot.expected!.top, 1);
            expect(rect.width).toBeCloseTo(snapshot.expected!.width, 1);
            expect(rect.height).toBeCloseTo(snapshot.expected!.height, 1);
        }
    }
    expect(driver.errors).toEqual([]);
}

export const indicatorScenarios = (Object.keys(indicatorCases) as IndicatorCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        await checkpoint(driver, 'initial indicator', 0);
        await driver.page.keyboard.press('F2');
        await checkpoint(driver, 'updated indicator', 1);
        await driver.page.keyboard.press('F3');
        await checkpoint(driver, 'restored indicator', 2);
        if (name === 'indicator-remount') {
            await driver.page.keyboard.press('F4');
            await checkpoint(driver, 'resize after remount', 3);
        }
    }
}));
