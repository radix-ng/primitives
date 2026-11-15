import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare';
import type { CaseName, Probe } from '../src/contract';

export class TabsDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: { name: string; dom: string; focus: string | null }[] = [];
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
        await expect(this.page.getByRole('tablist')).toBeVisible();
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
}
