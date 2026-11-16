import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare';
import type { CaseName, Probe } from '../src/contract';

export class TabsDriver {
    private readonly initialIds = new Map<string, string>();
    private readonly idOwners = new Map<string, string>();
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: { name: string; dom: string; focus: string | null; frames?: unknown; bounds?: unknown }[] =
        [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') this.errors.push(message.text());
        });
    }

    async goto(name: CaseName) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        if (name === 'geometry-scale-zero' || name === 'geometry-scale-x-zero')
            await expect(this.page.getByTestId('tablist')).toBeAttached();
        else await expect(this.page.getByRole('tablist').first()).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.tabsParity.reference);
    }

    async checkpoint(name: string, expected: Record<string, unknown>) {
        const snapshot = await this.page.evaluate(async () => {
            const read = () => {
                const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
                const probe = window.tabsParity;
                const selected: (string | number)[] = [];
                const visiblePanels: (string | number)[] = [];
                const tabs = probe.config.options.map((option, index) => {
                    const tab = root.querySelector<HTMLElement>(`[data-testid="tab-${index}"]`)!;
                    const active = tab.getAttribute('aria-selected') === 'true';
                    if (active) selected.push(option.value);
                    return {
                        value: option.value,
                        selected: active,
                        active: tab.hasAttribute('data-active'),
                        disabled: tab.getAttribute('aria-disabled') === 'true'
                    };
                });
                const panels = probe.config.options.map((option, index) => {
                    const panel = root.querySelector<HTMLElement>(`[data-testid="panel-${index}"]`)!;
                    const style = getComputedStyle(panel);
                    const visible =
                        !panel.hidden &&
                        panel.getClientRects().length > 0 &&
                        style.display !== 'none' &&
                        style.visibility !== 'hidden';
                    if (visible) visiblePanels.push(option.value);
                    return { value: option.value, hidden: panel.hidden, visible };
                });
                return {
                    state: { selected, visiblePanels, tabs, panels, changes: probe.changes },
                    dom: root.outerHTML,
                    focus:
                        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null
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
            throw new Error('Tabs did not settle');
        });
        this.checkpoints.push({ name, state: snapshot.state });
        this.measurements.push({ name, dom: snapshot.dom, focus: snapshot.focus });
        expect(snapshot.state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }

    async panelCheckpoint(name: string, expected: Record<string, unknown>) {
        const snapshot = await this.page.evaluate(async () => {
            const read = () => {
                const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
                const probe = window.tabsParity;
                return {
                    selected: probe.config.options
                        .filter(
                            (_, i) =>
                                root.querySelector(`[data-testid="tab-${i}"]`)?.getAttribute('aria-selected') === 'true'
                        )
                        .map((option) => option.value),
                    panels: probe.config.options.map((option, i) => {
                        const panel = root.querySelector<HTMLElement>(`[data-testid="panel-${i}"]`);
                        const content = root.querySelector<HTMLElement>(`[data-testid="content-${i}"]`);
                        if (!content || !panel) return { value: option.value, present: false };
                        const style = getComputedStyle(content);
                        return {
                            value: option.value,
                            present: true,
                            visible:
                                content.getClientRects().length > 0 &&
                                style.display !== 'none' &&
                                style.visibility !== 'hidden',
                            hidden: panel.hidden,
                            dataHidden: panel.hasAttribute('data-hidden'),
                            inert: panel.inert,
                            tabIndex: panel.tabIndex,
                            starting: panel.hasAttribute('data-starting-style'),
                            ending: panel.hasAttribute('data-ending-style')
                        };
                    }),
                    hosts: probe.config.options.map((_, i) => !!root.querySelector(`[data-testid="panel-${i}"]`)),
                    entryPanels: probe.panelStarts,
                    fields: probe.config.options.map(
                        (_, i) => root.querySelector<HTMLInputElement>(`[data-testid="field-${i}"]`)?.value ?? null
                    ),
                    focus:
                        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null,
                    activations: probe.activations,
                    changes: probe.changes
                };
            };
            let previous = '';
            let stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const state = read();
                const json = JSON.stringify(state);
                stable = json === previous ? stable + 1 : 0;
                if (stable >= 3) return { state, dom: document.querySelector('[data-testid="tabs-root"]')!.outerHTML };
                previous = json;
            }
            throw new Error('Tabs panel state did not settle');
        });
        this.checkpoints.push({ name, state: snapshot.state });
        this.measurements.push({ name, dom: snapshot.dom, focus: snapshot.state.focus });
        expect(snapshot.state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }

    async resetDirectionFrames() {
        await this.page.evaluate(() => {
            window.tabsParity.directionFrames = [];
        });
    }

    async directionCheckpoint(name: string, direction: string, value: string | number | null, changes: unknown[]) {
        const snapshot = await this.page.evaluate(async () => {
            const read = () => {
                const root = document.querySelector<HTMLElement>('[data-testid="tabs-root"]')!;
                const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
                const selected = tabs
                    .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                    .map((tab) => JSON.parse(tab.dataset.value!));
                const value = JSON.parse(document.querySelector('[data-testid="app-value"]')!.textContent!);
                const frame = window.tabsParity.directionFrames.find(
                    (frame) =>
                        frame.value === JSON.stringify(value) &&
                        JSON.stringify(frame.selected.map((value) => JSON.parse(value))) === JSON.stringify(selected)
                );
                return {
                    value,
                    selected,
                    directions: [...root.querySelectorAll('[data-direction-part]'), root].map((part) =>
                        part.getAttribute('data-activation-direction')
                    ),
                    ...(value !== null
                        ? {
                              indicatorDirection:
                                  root
                                      .querySelector('[data-testid="indicator"]')
                                      ?.getAttribute('data-activation-direction') ?? null
                          }
                        : {}),
                    firstFrameDirections: frame?.directions ?? [],
                    tabStops: tabs.map((tab) => ({ value: JSON.parse(tab.dataset.value!), tabIndex: tab.tabIndex })),
                    visiblePanels: [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
                        .filter((panel) => !panel.hidden && panel.getClientRects().length > 0)
                        .map((panel) => JSON.parse(panel.dataset.value!)),
                    focus:
                        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? null,
                    changes: window.tabsParity.changes
                };
            };
            let previous = '';
            let stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const state = read();
                const json = JSON.stringify(state);
                stable = json === previous ? stable + 1 : 0;
                if (stable >= 3) {
                    const root = document.querySelector('[data-testid="tabs-root"]')!;
                    return {
                        state,
                        dom: root.outerHTML,
                        frames: window.tabsParity.directionFrames,
                        bounds: [...root.querySelectorAll('[role="tab"]')].map((tab) =>
                            tab.getBoundingClientRect().toJSON()
                        )
                    };
                }
                previous = json;
            }
            throw new Error('Tabs direction did not settle');
        });
        this.checkpoints.push({ name, state: snapshot.state });
        this.measurements.push({
            name,
            dom: snapshot.dom,
            focus: snapshot.state.focus,
            frames: snapshot.frames,
            bounds: snapshot.bounds
        });
        const count = snapshot.state.directions.length;
        const hasTab = snapshot.state.tabStops.some((tab) => tab.value === value);
        expect(snapshot.state, `${this.framework}: ${name}`).toEqual(
            expect.objectContaining({
                value,
                selected: hasTab ? [value] : [],
                visiblePanels: hasTab ? [value] : [],
                directions: Array(count).fill(direction),
                firstFrameDirections: Array(count).fill(direction),
                ...(value !== null ? { indicatorDirection: direction } : {}),
                changes
            })
        );
        expect(this.errors).toEqual([]);
    }

    async identityCheckpoint(name: string, expected: Record<string, unknown>) {
        const snapshot = await this.page.evaluate(async () => {
            const read = () => {
                const controls: Record<string, string | null> = {};
                const labels: Record<string, string | null> = {};
                const identities: Record<string, string> = {};
                const selected: Record<string, unknown[]> = {};
                const authored: Record<string, string> = {};
                let indicatorFollowsActiveTab: boolean | undefined;
                for (const root of document.querySelectorAll<HTMLElement>('[data-identity-root]')) {
                    const relation = (element: Element, attribute: string) => {
                        const id = element.getAttribute(attribute);
                        if (id === null) return null;
                        const target = document.getElementById(id);
                        if (!target) return 'dangling';
                        return root.contains(target) ? target.getAttribute('data-testid') : 'outside-root';
                    };
                    const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
                    selected[root.dataset.identityRoot!] = tabs
                        .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                        .map((tab) => JSON.parse(tab.dataset.value!));
                    for (const tab of tabs) controls[tab.dataset.testid!] = relation(tab, 'aria-controls');
                    for (const panel of root.querySelectorAll<HTMLElement>('[role="tabpanel"]')) {
                        labels[panel.dataset.testid!] = relation(panel, 'aria-labelledby');
                    }
                    for (const part of root.querySelectorAll<HTMLElement>('[role="tab"], [role="tabpanel"]')) {
                        identities[part.dataset.testid!] = part.id;
                        if (/authored|renamed/.test(part.id)) authored[part.dataset.testid!] = part.id;
                    }
                    const indicator = root.querySelector<HTMLElement>('[data-testid$="-indicator"]');
                    if (indicator) {
                        const activeTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')!;
                        const width = Number.parseFloat(
                            getComputedStyle(indicator).getPropertyValue('--active-tab-width')
                        );
                        indicatorFollowsActiveTab =
                            width > 0 && Math.abs(width - activeTab.getBoundingClientRect().width) < 1;
                    }
                }
                const ids = Object.values(identities);
                return {
                    state: {
                        controls,
                        labels,
                        selected,
                        authored,
                        uniqueIds: ids.every(Boolean) && new Set(ids).size === ids.length,
                        ...(indicatorFollowsActiveTab !== undefined ? { indicatorFollowsActiveTab } : {}),
                        changes: window.tabsParity.changes
                    },
                    identities
                };
            };
            let previous = '';
            let stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const snapshot = read();
                const json = JSON.stringify(snapshot);
                stable = json === previous ? stable + 1 : 0;
                if (stable >= 3)
                    return {
                        ...snapshot,
                        dom: document.body.innerHTML,
                        focus:
                            document.activeElement?.getAttribute('data-testid') ??
                            document.activeElement?.tagName ??
                            null
                    };
                previous = json;
            }
            throw new Error('Tabs identities did not settle');
        });
        const idStatus: Record<string, string> = {};
        const reusedIds: string[] = [];
        for (const [part, id] of Object.entries(snapshot.identities)) {
            idStatus[part] = !this.initialIds.has(part) ? 'new' : this.initialIds.get(part) === id ? 'same' : 'changed';
            if (this.idOwners.has(id) && this.idOwners.get(id) !== part) reusedIds.push(part);
            if (!this.initialIds.has(part)) this.initialIds.set(part, id);
            this.idOwners.set(id, part);
        }
        const state = { ...snapshot.state, idStatus, reusedIds };
        this.checkpoints.push({ name, state });
        this.measurements.push({ name, dom: snapshot.dom, focus: snapshot.focus });
        expect(state, `${this.framework}: ${name}`).toEqual(
            expect.objectContaining({ uniqueIds: true, reusedIds: [], ...expected })
        );
        expect(this.errors).toEqual([]);
    }

    async activationCheckpoint(name: string, expected: Record<string, unknown>) {
        const read = () =>
            this.page.evaluate(() => {
                const root = document.querySelector('[data-testid="tabs-root"]')!;
                const target = root.querySelector<HTMLElement>('[data-testid="tab-1"]')!;
                const probe = window.tabsActivation;
                return {
                    selected: [...root.querySelectorAll('[role="tab"][aria-selected="true"]')].map((tab) =>
                        tab.getAttribute('data-testid')
                    ),
                    focus: document.activeElement?.getAttribute('data-testid') ?? null,
                    tabStops: [...root.querySelectorAll<HTMLElement>('[role="tab"]')].map((tab) => tab.tabIndex),
                    host: {
                        tag: target.tagName,
                        type: target.getAttribute('type'),
                        role: target.getAttribute('role'),
                        disabled: target.hasAttribute('disabled'),
                        ariaDisabled: target.getAttribute('aria-disabled')
                    },
                    callbacks: probe.callbacks,
                    timeline: probe.timeline,
                    clicks: probe.timeline.filter((event) => event.phase === 'bubble' && event.type === 'click').length,
                    hash: location.hash,
                    scrolled: scrollY > 0,
                    submits: probe.submits
                };
            });
        if (expected.scrolled === true) await expect.poll(async () => (await read()).scrolled).toBe(true);
        let previous = '';
        let stable = 0;
        let state = await read();
        for (let frame = 0; frame < 120; frame++) {
            await this.page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
            state = await read();
            const json = JSON.stringify(state);
            stable = json === previous ? stable + 1 : 0;
            if (stable >= 3) break;
            previous = json;
            if (frame === 119) throw new Error('Tabs activation did not settle');
        }
        const snapshot = await this.page.evaluate(() => ({
            dom: document.body.innerHTML,
            triggers: window.tabsActivation.triggers,
            nativeEvents: window.tabsParity.nativeEvents
        }));
        this.checkpoints.push({ name, state });
        this.measurements.push({
            name,
            dom: snapshot.dom,
            focus: state.focus,
            frames: { triggers: snapshot.triggers, nativeEvents: snapshot.nativeEvents }
        });
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining({ submits: 0, ...expected }));
        // Angular keeps its optional native trigger; pinned Tabs leaves it unset. Preserve both raw.
        expect(snapshot.triggers).toEqual(
            Array(state.callbacks.length).fill(this.framework === 'angular' ? 'tab-1' : null)
        );
        expect(this.errors).toEqual([]);
        return state;
    }
}
