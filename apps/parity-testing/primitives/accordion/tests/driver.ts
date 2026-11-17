import { expect, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare';
import type { Probe } from '../src/contract';

export class AccordionDriver {
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
    async goto(name: string) {
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.page.getByTestId('a-trigger')).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.accordionParity.reference);
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const read = () =>
            this.page.evaluate(() => {
                const trigger = document.querySelector<HTMLElement>('[data-testid="a-trigger"]')!;
                const parts = ['a', 'b'].map((id) =>
                    Object.fromEntries(
                        ['item', 'header', 'trigger', 'panel'].map((part) => {
                            const element = document.querySelector<HTMLElement>(`[data-testid="${id}-${part}"]`)!;
                            return [
                                part,
                                Object.fromEntries(
                                    [...element.attributes]
                                        .filter(
                                            (attr) =>
                                                attr.name.startsWith('data-') &&
                                                attr.name !== 'data-testid' &&
                                                !attr.name.startsWith('data-rdx-')
                                        )
                                        .map((attr) => [attr.name, attr.value])
                                )
                            ];
                        })
                    )
                );
                const controls = ['a', 'b'].map((id) => {
                    const trigger = document.querySelector<HTMLElement>(`[data-testid="${id}-trigger"]`)!;
                    const panel = document.querySelector<HTMLElement>(`[data-testid="${id}-panel"]`)!;
                    return {
                        expanded: trigger.getAttribute('aria-expanded'),
                        controls: trigger.getAttribute('aria-controls') === panel.id,
                        labelled: panel.getAttribute('aria-labelledby') === trigger.id,
                        hidden: panel.getAttribute('hidden')
                    };
                });
                return {
                    parts,
                    controls,
                    open: controls.map((c) => c.expanded === 'true'),
                    trigger: {
                        tag: trigger.tagName,
                        type: trigger.getAttribute('type'),
                        role: trigger.getAttribute('role'),
                        disabled: trigger.hasAttribute('disabled'),
                        ariaDisabled: trigger.getAttribute('aria-disabled'),
                        tabIndex: trigger.tabIndex
                    },
                    trace: window.accordionParity.trace,
                    submits: window.accordionParity.submits
                };
            });
        let state = await read();
        let previous = '';
        let stable = 0;
        for (let frame = 0; frame < 120; frame++) {
            await this.page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
            state = await read();
            const current = JSON.stringify(state);
            stable = current === previous ? stable + 1 : 0;
            if (stable >= 3) break;
            if (frame === 119) throw new Error('Accordion did not settle');
            previous = current;
        }
        this.checkpoints.push({ name, state });
        this.measurements.push({ name, dom: await this.page.locator('body').innerHTML() });
        expect(state).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
        return state;
    }
}
