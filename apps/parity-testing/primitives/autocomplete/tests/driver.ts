import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare';
import type { CaseName, Probe } from '../src/contract';
export class AutocompleteDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
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
        await expect(this.page.getByTestId('input')).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.autocompleteParity.reference);
    }
    async checkpoint(name: string, value: string, open: boolean, requests?: Probe['requests']) {
        await expect(this.page.getByTestId('input')).toHaveValue(value);
        await expect(this.page.getByTestId('input')).toHaveAttribute('aria-expanded', String(open));
        await expect(this.page.getByTestId('popup')).toHaveCount(open ? 1 : 0);
        await this.page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        );
        const snapshot = await this.page.evaluate(() => {
            const input = document.querySelector<HTMLInputElement>('[data-testid="input"]')!;
            const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
            return {
                state: {
                    value: input.value,
                    open: input.getAttribute('aria-expanded') === 'true',
                    popupVisible: !!popup && !popup.hidden && popup.getClientRects().length > 0,
                    formData: new FormData(document.querySelector('form')!).getAll('query'),
                    requests: window.autocompleteParity.requests
                },
                raw: {
                    dom: document.body.innerHTML,
                    focus: document.activeElement?.getAttribute('data-testid') ?? null,
                    details: window.autocompleteParity.details,
                    modelOutputs: window.autocompleteParity.modelOutputs
                }
            };
        });
        this.checkpoints.push({ name, state: snapshot.state });
        this.measurements.push({ name, ...snapshot.raw });
        expect(snapshot.state).toEqual(
            expect.objectContaining({
                value,
                open,
                popupVisible: open,
                formData: [value],
                ...(requests ? { requests } : {})
            })
        );
        expect(this.errors).toEqual([]);
    }
    async navigationCheckpoint(
        name: string,
        expected: Record<string, unknown> = {},
        profile: 'navigation' | 'read-only-preview' | 'read-only-setup' = 'navigation'
    ) {
        const read = () =>
            this.page.evaluate(() => {
                const input = document.querySelector<HTMLInputElement>('[data-testid="input"]')!;
                const id = input.getAttribute('aria-activedescendant');
                const active = id ? document.getElementById(id) : null;
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const highlighted = [
                    ...document.querySelectorAll<HTMLElement>('[data-testid^="item-"][data-highlighted]')
                ].map((item) => item.dataset.testid);
                const committed = document.querySelector('[data-testid="committed-value"]');
                const readOnlyState = committed
                    ? {
                          committed: committed.textContent,
                          readOnly: input.readOnly,
                          ariaReadOnly: input.getAttribute('aria-readonly'),
                          ariaAutocomplete: input.getAttribute('aria-autocomplete'),
                          listReadOnly:
                              document.querySelector('[data-testid="list"]')?.getAttribute('aria-readonly') ?? null,
                          submits: window.autocompleteParity.submits
                      }
                    : {};
                return {
                    ...readOnlyState,
                    value: input.value,
                    open: input.getAttribute('aria-expanded') === 'true',
                    active: id ? (active?.getAttribute('data-testid') ?? 'dangling') : null,
                    highlighted,
                    selection: [input.selectionStart, input.selectionEnd],
                    focus: document.activeElement?.getAttribute('data-testid') ?? null,
                    popupVisible: !!popup && !popup.hidden && popup.getClientRects().length > 0,
                    requests: window.autocompleteParity.requests,
                    highlightIndices: window.autocompleteParity.highlights.map((change) => change.index),
                    keys: window.autocompleteParity.keys
                };
            });
        let previous = '';
        let stable = 0;
        let state = await read();
        for (let frame = 0; frame < 60; frame++) {
            await this.page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
            state = await read();
            const json = JSON.stringify(state);
            stable = json === previous ? stable + 1 : 0;
            if (stable >= 3) break;
            previous = json;
            if (frame === 59) throw new Error('Autocomplete navigation did not settle');
        }
        // G3 compares read-only transitions. G4 owns completion caret/selection; G5 owns callback order.
        // Keep the unprojected snapshot, DOM and complete event trace for every observation.
        const comparisonState =
            profile === 'read-only-preview'
                ? {
                      committed: state.committed,
                      readOnly: state.readOnly,
                      ariaReadOnly: state.ariaReadOnly,
                      ariaAutocomplete: state.ariaAutocomplete,
                      listReadOnly: state.listReadOnly,
                      submits: state.submits,
                      value: state.value,
                      open: state.open,
                      active: state.active,
                      highlighted: state.highlighted,
                      focus: state.focus,
                      popupVisible: state.popupVisible,
                      highlightIndices: state.highlightIndices,
                      keys: state.keys,
                      valueRequests: state.requests.filter((change) => change.kind === 'value').length,
                      openRequests: state.requests.filter((change) => change.kind === 'open').length
                  }
                : state;
        if (profile !== 'read-only-setup') this.checkpoints.push({ name, state: comparisonState });
        this.measurements.push({ name, compared: profile !== 'read-only-setup', observed: state });
        this.measurements.push(
            await this.page.evaluate(
                (name) => ({
                    name,
                    dom: document.body.innerHTML,
                    details: window.autocompleteParity.details,
                    highlights: window.autocompleteParity.highlights,
                    nativeKeys: window.autocompleteParity.keys,
                    formData: [...new FormData(document.querySelector('form')!).entries()],
                    input: document.querySelector('[data-testid="input"]')?.outerHTML
                }),
                name
            )
        );
        expect(state.active).not.toBe('dangling');
        expect(state.highlighted).toEqual(state.active === null ? [] : [state.active]);
        expect(comparisonState).toEqual(
            expect.objectContaining({ focus: 'input', popupVisible: state.open, ...expected })
        );
        expect(this.errors).toEqual([]);
    }
}
