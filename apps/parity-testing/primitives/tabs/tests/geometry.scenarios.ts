import { expect } from '@playwright/test';
import { geometryCases, type GeometryCaseName } from '../src/geometry';
import type { TabsDriver } from './driver';

async function checkpoint(driver: TabsDriver, name: string, value: number) {
    const snapshot = await driver.page.evaluate(async (value) => {
        const read = () => {
            const settings = window.tabsParity.config.geometry!;
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const list = root.querySelector<HTMLElement>('[data-testid="tablist"]')!;
            const tab = root.querySelector<HTMLElement>(`[data-testid="tab-${value}"]`)!;
            const slot = root.querySelector<HTMLElement>(`[data-testid="slot-${value}"]`)!;
            const inner = root.querySelector<HTMLElement>('[data-testid="inner"]');
            const indicator = root.querySelector<HTMLElement>('[data-testid="indicator"]')!;
            const style = getComputedStyle(indicator);
            const keys = ['left', 'top', 'right', 'bottom', 'width', 'height'] as const;
            const geometry = Object.fromEntries(
                keys.map((key) => [key, Number.parseFloat(style.getPropertyValue(`--active-tab-${key}`))])
            );

            // Authored slot sizes/gaps give an independent CSS-layout expectation. The primitive
            // measures rect/offset chains; this fixture uses fixed layout constants, not that algorithm.
            const widths = settings.fractional
                ? [80.25, 112.5, 64.75]
                : settings.tabContentBox
                  ? [104, 136, 88]
                  : [80, 112, 64];
            const width = widths[value];
            const height = settings.tabContentBox ? 56 : 32;
            const gap = settings.fractional ? 7.5 : 8;
            const px = settings.fractional ? 12.5 : settings.padding ? 16 : 0;
            const py = settings.fractional ? 12.5 : settings.padding ? 12 : 0;
            const preceding = widths.slice(0, value).reduce((sum, width) => sum + width, 0) + value * gap;
            let left = settings.orientation === 'vertical' ? px : px + preceding;
            let top = py + (settings.orientation === 'vertical' ? value * (height + gap) : 0);
            if (settings.dir === 'rtl')
                left = list.clientWidth - px - width - (settings.orientation === 'vertical' ? 0 : preceding);
            if (settings.offsetParent) {
                left += 34;
                top += 10;
            }
            if (settings.scroll === 'inner') {
                left -= inner!.scrollLeft;
                top -= inner!.scrollTop;
            }
            if (settings.translation) {
                const t = settings.translation;
                left += t.x * (t.percent ? width : 1) + (t.matrixX ?? 0);
                top += t.y * (t.percent ? height : 1) + (t.matrixY ?? 0);
            }
            const expected = {
                left,
                top,
                right: list.scrollWidth - left - width,
                bottom: list.scrollHeight - top - height,
                width,
                height
            };
            const actual = indicator.getBoundingClientRect();
            // An individually rotated/scaled Tab keeps its layout-sized indicator. Its native
            // slot is a passive layout witness, including the common ancestor transform.
            const target = (settings.tabWarp ? slot : tab).getBoundingClientRect();
            const scroller = settings.scroll === 'inner' ? inner : list;
            return {
                state: {
                    selected: [...list.querySelectorAll('[role="tab"][aria-selected="true"]')].map((tab) =>
                        Number(tab.getAttribute('data-value'))
                    ),
                    geometry,
                    host: { present: true, hidden: indicator.hidden, role: indicator.getAttribute('role') },
                    visible: actual.width > 0 && actual.height > 0 && !indicator.hidden,
                    scroll: { x: scroller!.scrollLeft, y: scroller!.scrollTop },
                    changes: window.tabsParity.changes
                },
                expected,
                dom: root.outerHTML,
                focus: document.activeElement?.getAttribute('data-testid') ?? null,
                bounds: {
                    indicator: actual.toJSON(),
                    target: target.toJSON(),
                    tab: tab.getBoundingClientRect().toJSON(),
                    slot: slot.getBoundingClientRect().toJSON(),
                    list: list.getBoundingClientRect().toJSON(),
                    inner: inner?.getBoundingClientRect().toJSON(),
                    metrics: {
                        clientLeft: list.clientLeft,
                        clientTop: list.clientTop,
                        clientWidth: list.clientWidth,
                        clientHeight: list.clientHeight,
                        scrollWidth: list.scrollWidth,
                        scrollHeight: list.scrollHeight
                    },
                    expected
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
        throw new Error('Tabs geometry did not settle');
    }, value);
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({ name, dom: snapshot.dom, focus: snapshot.focus, bounds: snapshot.bounds });
    const zero = await driver.page.evaluate(() => !!window.tabsParity.config.geometry!.zeroScale);
    expect(snapshot.state, `${driver.framework}: ${name}`).toEqual(
        expect.objectContaining({
            selected: [value],
            host: { present: true, hidden: false, role: 'presentation' },
            visible: !zero,
            changes: []
        })
    );
    for (const [key, expected] of Object.entries(snapshot.expected)) {
        expect(Number.isFinite(snapshot.state.geometry[key]), `${driver.framework}: finite ${key}`).toBe(true);
        expect(snapshot.state.geometry[key], `${driver.framework}: ${name} ${key}`).toBeCloseTo(expected, 2);
    }
    for (const key of ['x', 'y', 'width', 'height'])
        expect(snapshot.bounds.indicator[key], `${driver.framework}: ${name} rendered ${key}`).toBeCloseTo(
            snapshot.bounds.target[key],
            1
        );
    expect(driver.errors).toEqual([]);
}

export const geometryScenarios = (Object.keys(geometryCases) as GeometryCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = geometryCases[name].geometry!;
        await checkpoint(driver, 'initial geometry', 1);
        if (settings.scroll) {
            const scroller = driver.page.getByTestId(settings.scroll === 'inner' ? 'inner' : 'tablist');
            const initial = await scroller.evaluate((element) => ({ x: element.scrollLeft, y: element.scrollTop }));
            const box = (await scroller.boundingBox())!;
            await driver.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const vertical = settings.orientation === 'vertical';
            await driver.page.mouse.wheel(vertical ? 0 : settings.dir === 'rtl' ? -200 : 200, vertical ? 200 : 0);
            await expect
                .poll(() =>
                    scroller.evaluate(
                        (element, vertical) => (vertical ? element.scrollTop : element.scrollLeft),
                        vertical
                    )
                )
                .not.toBe(vertical ? initial.y : initial.x);
        }
        // Selection requests remeasurement after native scroll, including an intermediate scroller.
        // Continuous inner-scroll observation without a render is a separate contract.
        await driver.page.keyboard.press('F2');
        await checkpoint(driver, 'new selection after native scroll or transform', 2);
        await driver.page.keyboard.press('F3');
        await checkpoint(driver, 'restored selection', 1);
    }
}));
