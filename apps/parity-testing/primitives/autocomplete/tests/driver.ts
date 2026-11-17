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
}
