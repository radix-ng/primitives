import { expect } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
import { keyboardCases, type KeyboardCaseName } from '../src/keyboard';
import type { TabsDriver } from './driver';

interface Request {
    value: number;
    reason: string;
    direction: string;
    type: string;
    trusted: boolean;
}
interface KeyExpectation {
    key: string;
    target: string;
    prevented: boolean;
    bubbled: boolean;
}

async function checkpoint(
    driver: TabsDriver,
    name: string,
    current: number | null,
    direction: string,
    changes: Request[],
    focus?: string,
    key?: KeyExpectation
) {
    const snapshot = await driver.page.evaluate(async () => {
        const read = () => {
            const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
            const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
            const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
            return {
                state: {
                    selected: tabs
                        .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                        .map((tab) => Number(tab.dataset.testid!.slice(4))),
                    visiblePanels: panels
                        .filter((panel) => !panel.hidden && panel.getClientRects().length > 0)
                        .map((panel) => Number(panel.dataset.testid!.slice(6))),
                    tabs: tabs.map((tab) => ({
                        key: tab.dataset.testid,
                        selected: tab.getAttribute('aria-selected'),
                        disabled: tab.getAttribute('aria-disabled'),
                        tabIndex: tab.tabIndex
                    })),
                    panels: panels.map((panel) => ({
                        key: panel.dataset.testid,
                        hidden: panel.hidden,
                        inert: panel.inert,
                        tabIndex: panel.tabIndex
                    })),
                    directions: [
                        root,
                        ...root.querySelectorAll('[role="tablist"], [role="tab"], [role="tabpanel"]')
                    ].map((part) => part.getAttribute('data-activation-direction')),
                    focus: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
                    focusEvents: window.tabsKeyboard.focus,
                    keys: window.tabsKeyboard.keys.map(({ time: _time, selected: _selected, ...key }) => key),
                    changes: window.tabsParity.changes.map((change, index) => ({
                        value: change.value,
                        reason: change.reason,
                        direction: change.activationDirection,
                        type: window.tabsParity.nativeEvents[index].type,
                        trusted: window.tabsParity.nativeEvents[index].trusted
                    })),
                    scroll: { x: scrollX, y: scrollY }
                },
                dom: root.outerHTML,
                bounds: {
                    parts: [...tabs, ...panels].map((part) => ({
                        key: part.dataset.testid,
                        id: part.id,
                        controls: part.getAttribute('aria-controls'),
                        label: part.getAttribute('aria-labelledby'),
                        rect: part.getBoundingClientRect().toJSON()
                    })),
                    keys: window.tabsKeyboard.keys,
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
        throw new Error('Keyboard snapshot did not settle');
    });
    driver.checkpoints.push({ name, state: snapshot.state });
    driver.measurements.push({ name, dom: snapshot.dom, focus: snapshot.state.focus ?? null, bounds: snapshot.bounds });
    const selected = current === null ? [] : [current];
    expect(snapshot.state.selected, `${driver.framework}: ${name} selected`).toEqual(selected);
    expect(snapshot.state.visiblePanels, `${driver.framework}: ${name} Panels`).toEqual(selected);
    expect(snapshot.state.changes, `${driver.framework}: ${name} callbacks`).toEqual(changes);
    expect(
        snapshot.state.directions.every((actual) => actual === direction),
        `${driver.framework}: ${name} direction`
    ).toBe(true);
    if (focus) expect(snapshot.state.focus, `${driver.framework}: ${name} native focus`).toBe(focus);
    if (key)
        expect(snapshot.state.keys.at(-1), `${driver.framework}: ${name} key`).toMatchObject({ ...key, trusted: true });
    expect(driver.errors).toEqual([]);
}

export const keyboardScenarios = (Object.keys(keyboardCases) as KeyboardCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = keyboardCases[name].keyboard!;
        const vertical = settings.orientation === 'vertical',
            rtl = settings.dir === 'rtl';
        const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        const previous = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const positive = vertical ? 'down' : rtl ? 'left' : 'right';
        const negative = vertical ? 'up' : rtl ? 'right' : 'left';
        const disabled = (index: number) => settings.disabled?.includes(index) ?? false;
        const changes: Request[] = [];
        let current: number | null = settings.initialNull ? null : 1;
        let direction = 'none',
            focused = settings.initialNull ? 0 : 1,
            pending: number | undefined;
        const select = (value: number) => {
            direction = current === null ? 'none' : value > current ? positive : value < current ? negative : direction;
            current = value;
        };
        const activate = (value: number, type: 'click' | 'focusin', trusted = true) => {
            if (disabled(value) || current === value) return;
            changes.push({
                value,
                reason: 'none',
                direction: current === null ? 'none' : value > current ? positive : negative,
                type,
                trusted
            });
            if (!settings.controlled || settings.controlled === 'accept') select(value);
            if (settings.controlled === 'delay') pending = value;
        };
        const check = (label: string, focus?: string, key?: KeyExpectation) =>
            checkpoint(driver, label, current, direction, changes, focus, key);
        const macWebkit =
            driver.page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
        const tabKey = macWebkit ? 'Alt+Tab' : 'Tab';
        const backTab = macWebkit ? 'Alt+Shift+Tab' : 'Shift+Tab';
        await check('initial keyboard state', 'BODY');
        await driver.page.keyboard.press(tabKey);
        await check('native before control', 'outside');
        await driver.page.keyboard.press(tabKey);
        await check('native list entry', `tab-${focused}`);

        const move = async (key: string, to: number) => {
            const from = focused;
            await driver.page.keyboard.press(key);
            if (from !== to && settings.automatic) activate(to, 'focusin');
            focused = to;
            await check(`native ${key} to ${to}`, `tab-${to}`, {
                key,
                target: `tab-${from}`,
                prevented: disabled(from) || from !== to,
                bubbled: from === to
            });
        };

        if (settings.kind === 'modifier') {
            await driver.page.keyboard.press(`${settings.modifier}+ArrowDown`);
            await check('modified navigation', undefined, {
                key: 'ArrowDown',
                target: 'tab-1',
                prevented: false,
                bubbled: true
            });
            const flags = await driver.page.evaluate(() => window.tabsKeyboard.keys.at(-1)!);
            expect([flags.shift, flags.control, flags.alt, flags.meta]).toEqual(
                ['Shift', 'Control', 'Alt', 'Meta'].map((modifier) => settings.modifier!.split('+').includes(modifier))
            );
            return;
        }

        if (settings.kind === 'tab-order') {
            if (settings.endFocus) await move('End', 3);
            const forward: string[] =
                current === null ? ['after'] : [`panel-${current}`, `input-${current}`, `action-${current}`, 'after'];
            for (const target of forward) {
                await driver.page.keyboard.press(tabKey);
                await check(`forward ${target}`, target);
            }
            const backward =
                current === null
                    ? [`tab-${focused}`, 'outside']
                    : [`action-${current}`, `input-${current}`, `panel-${current}`, `tab-${focused}`, 'outside'];
            for (const target of backward) {
                await driver.page.keyboard.press(backTab);
                if (target === `tab-${focused}` && settings.automatic) activate(focused, 'focusin');
                await check(`reverse ${target}`, target);
            }
            return;
        }

        if (settings.kind === 'rapid') {
            const automatic = settings.activation === 'Arrow';
            const key = settings.activation === 'Space' ? ' ' : 'Enter';
            const rounds =
                settings.backward ||
                settings.controlled === 'ignore' ||
                settings.controlled === 'delay' ||
                settings.disabled
                    ? 1
                    : 3;
            for (let round = 0; round < rounds; round++) {
                const to = round % 2 === 0 ? 2 : 1;
                const arrow = to > focused ? next : previous;
                if (!automatic) await move(arrow, to);
                else await check(`before rapid arrow ${round}`, `tab-${focused}`);
                // Fix the paint-frame boundary on both implementations; native key delivery,
                // focus, default actions and original events are unchanged. In particular, an
                // outgoing Panel must not finish its exit between one side's two key commands.
                await pauseClockBeforeInteraction(driver.page);
                try {
                    // No DOM assertion, frame wait or focus repair between activation and Tab.
                    if (automatic) {
                        await driver.page.keyboard.press(arrow);
                        focused = to;
                        if (settings.automatic) activate(to, 'focusin');
                    } else {
                        await driver.page.keyboard.press(key);
                        activate(to, 'click', key !== ' ');
                    }
                    await driver.page.keyboard.press(settings.backward ? backTab : tabKey);
                    await driver.page.clock.runFor(100);
                } finally {
                    await driver.page.clock.resume();
                }
                await check(`rapid activation and Tab ${round}`, settings.backward ? 'outside' : `panel-${current}`);
                if (settings.controlled === 'delay') {
                    await driver.page.keyboard.press('F2');
                    select(pending!);
                    await check('parent applies delayed response');
                }
                if (round + 1 < rounds) {
                    await driver.page.keyboard.press(backTab);
                    await check(`return to list ${round}`, `tab-${focused}`);
                }
            }
            return;
        }

        await move('Home', 0);
        if (settings.controlled === 'delay') {
            await driver.page.keyboard.press('F2');
            select(pending!);
            await check('apply pending Home', 'tab-0');
        }
        await move(previous, settings.loop === false ? 0 : 3);
        await move('End', 3);
        await move(next, settings.loop === false ? 3 : 0);
        await move('Home', 0);
        await move(next, 1);
        await move(next, 2);
        await move('End', 3);
        await move(previous, 2);
        await driver.page.keyboard.press(vertical ? 'ArrowRight' : 'ArrowDown');
        await check('orthogonal key keeps composite index', 'tab-2', {
            key: vertical ? 'ArrowRight' : 'ArrowDown',
            target: 'tab-2',
            prevented: disabled(2),
            bubbled: true
        });
        await move('Home', 0);
        await move('End', 3);
        await driver.page.keyboard.press('Enter');
        activate(3, 'click');
        await check('manual native activation', 'tab-3');
    }
}));
