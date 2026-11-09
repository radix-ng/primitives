import { expect, Page } from '@playwright/test';
import type { CaseName, Reference, TraceEvent } from '../src/contract';

export interface Snapshot {
    open: boolean;
    label: string;
    disabled: boolean;
    readOnly: boolean;
    controlsLinked: boolean;
    popupMounted: boolean;
    popupVisible: boolean;
    inert: boolean;
    selected: string[];
    highlighted: string[];
    focus: string;
    entries: [string, string][];
    events: TraceEvent[];
}
export interface Checkpoint {
    name: string;
    state: Snapshot;
}

export class SelectDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly errors: string[] = [];
    metadata: { reference: Reference; framework: string } | undefined;

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') this.errors.push(message.text());
        });
    }
    async goto(name: CaseName): Promise<void> {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => ({
            framework: window.parity.framework,
            reference: window.parity.reference
        }));
        await this.checkpoint('initial');
    }
    get trigger() {
        return this.page.getByTestId('trigger');
    }
    option(key: string) {
        return this.page.locator(`[data-option-key="${key}"]`);
    }
    async open(pointer = false): Promise<void> {
        const count = await this.page.evaluate(
            () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
        );
        if (pointer) await this.trigger.click();
        else await this.trigger.press('Enter');
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'true');
        await expect
            .poll(() =>
                this.page.evaluate(
                    () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
                )
            )
            .toBe(count + 1);
    }
    async key(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }
    async choose(key: string): Promise<void> {
        await this.option(key).click();
    }
    async highlighted(key: string): Promise<void> {
        await expect(this.option(key)).toHaveAttribute('data-highlighted', '');
    }
    async closed(): Promise<void> {
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'false');
    }
    async action(action: 'close' | 'unmount'): Promise<void> {
        await this.page.evaluate((name) => window.parity[name](), action);
    }
    async reset(): Promise<void> {
        await this.page.getByTestId('form').evaluate((form: HTMLFormElement) => form.reset());
    }
    async focusAfter(): Promise<void> {
        await this.page.getByTestId('after').focus();
    }

    async nativeEvents(): Promise<string[]> {
        return this.page.evaluate(() => window.parity?.nativeEvents ?? []).catch(() => []);
    }

    async checkpoint(name: string, expected: Partial<Snapshot> = {}): Promise<void> {
        // Wait for observable state to stabilize, without forcing focus, values or completion callbacks.
        const state = await this.page.evaluate(async () => {
            const read = (): Snapshot => {
                const trigger = document.querySelector<HTMLElement>('[data-testid="trigger"]')!;
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const active = document.activeElement;
                const option = active?.closest<HTMLElement>('[data-option-key]');
                const style = popup && getComputedStyle(popup);
                const options = [...document.querySelectorAll<HTMLElement>('[data-option-key]')];
                return {
                    open: trigger.getAttribute('aria-expanded') === 'true',
                    label: trigger.textContent!.trim().replace(/\s+/g, ' '),
                    disabled: trigger.hasAttribute('disabled'),
                    readOnly: trigger.getAttribute('aria-readonly') === 'true',
                    controlsLinked: !!document.getElementById(trigger.getAttribute('aria-controls') ?? ''),
                    popupMounted: !!popup,
                    popupVisible:
                        !!popup &&
                        !!popup.getClientRects().length &&
                        style!.visibility !== 'hidden' &&
                        style!.display !== 'none',
                    inert: !!popup?.closest('[inert]'),
                    selected: options
                        .filter((node) => node.getAttribute('aria-selected') === 'true')
                        .map((node) => node.dataset.optionKey!),
                    highlighted: options
                        .filter((node) => node.hasAttribute('data-highlighted'))
                        .map((node) => node.dataset.optionKey!),
                    focus: option
                        ? `option:${option.dataset.optionKey}`
                        : active === popup
                          ? 'popup'
                          : active === document.body
                            ? 'body'
                            : (active?.getAttribute('data-testid') ?? 'other'),
                    entries: [
                        ...new FormData(document.querySelector<HTMLFormElement>('[data-testid="form"]')!).entries()
                    ].map(([key, value]) => [key, String(value)]),
                    events: window.parity.events
                };
            };
            let previous = '';
            let stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const json = JSON.stringify(read());
                stable = json === previous ? stable + 1 : 0;
                if (stable === 3) return JSON.parse(json) as Snapshot;
                previous = json;
            }
            throw new Error('Fixture did not settle within 120 animation frames');
        });
        this.checkpoints.push({ name, state });
        for (const event of state.events) {
            if (event.type === 'value')
                expect(event.references, `${this.framework}: original option references`).toBe(true);
        }
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors, `${this.framework} runtime errors`).toEqual([]);
    }
}
