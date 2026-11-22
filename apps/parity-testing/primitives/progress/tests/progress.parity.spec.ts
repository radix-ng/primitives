import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases } from '../src/contract.ts';

type Step = (typeof cases)[string][number];

class ProgressDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['progressParity'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    part(name: string) {
        return this.page.locator(`[data-part="${name}"]`);
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.page.getByRole('progressbar')).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.progressParity);
    }

    async readStep(step: Step, index: number) {
        const root = this.page.getByRole('progressbar', {
            name: step.accessibleName ?? 'Transfer progress',
            exact: true
        });
        const min = String(step.min ?? 0);
        const max = String(step.max ?? 100);
        const status = step.now === null ? 'indeterminate' : step.now === max ? 'complete' : 'progressing';
        const parts =
            step.showLabel === false
                ? ['root', 'value', 'track', 'indicator']
                : ['root', 'label', 'value', 'track', 'indicator'];
        const labelledBy = step.labelledBy ? 'external' : step.showLabel === false ? 'absent' : 'label';
        const expected = {
            stepIndex: String(index),
            min,
            max,
            now: step.now,
            text: step.text,
            labelledBy,
            visual: step.visible ?? (step.now === null ? '' : step.text),
            status: parts.map((part) => [part, [status]]),
            valueHidden: 'true'
        };
        const read = () =>
            root.evaluate((element) => {
                const value = element.querySelector('[data-part="value"]')!;
                const id = element.getAttribute('aria-labelledby');
                const label = element.querySelector('[data-part="label"]');
                const parts = [element, ...element.querySelectorAll('[data-part]')];
                return {
                    stepIndex: element.getAttribute('data-step'),
                    min: element.getAttribute('aria-valuemin'),
                    max: element.getAttribute('aria-valuemax'),
                    now: element.getAttribute('aria-valuenow'),
                    text: element.getAttribute('aria-valuetext'),
                    labelledBy:
                        id === null
                            ? 'absent'
                            : id === label?.id
                              ? 'label'
                              : id === 'external-progress'
                                ? 'external'
                                : 'dangling',
                    visual: value.textContent,
                    status: parts.map((part) => [
                        part.getAttribute('data-part'),
                        ['complete', 'progressing', 'indeterminate'].filter((state) =>
                            part.hasAttribute('data-' + state)
                        )
                    ]),
                    valueHidden: value.getAttribute('aria-hidden')
                };
            });
        await expect.poll(read, step.name).toEqual(expected);
        if (step.labelId) await expect(this.part('label')).toHaveAttribute('id', step.labelId);
        if (this.framework === 'angular') {
            const numbers = await root.evaluate((element) =>
                [element, ...element.querySelectorAll('[data-part]:not([data-part="label"])')].map((part) => [
                    part.getAttribute('data-min'),
                    part.getAttribute('data-max'),
                    part.getAttribute('data-value')
                ])
            );
            expect(numbers).toEqual(Array.from({ length: 4 }, () => [min, max, step.now]));
        }
        this.checkpoints.push({ name: step.name, state: await read() });
    }

    async readLinearGeometry(step: Step) {
        const geometry = await this.part('indicator').evaluate((indicator: HTMLElement) => {
            const track = indicator.parentElement!.getBoundingClientRect();
            const fill = indicator.getBoundingClientRect();
            const direction = window.getComputedStyle(indicator).direction;
            return {
                direction,
                width: Math.round(fill.width),
                height: Math.round(fill.height),
                leadingGap: Math.round(direction === 'rtl' ? track.right - fill.right : fill.left - track.left),
                inlineWidth: indicator.style.width,
                inset: indicator.style.insetInlineStart
            };
        });
        expect(geometry).toEqual({
            direction: step.direction,
            width: step.width,
            height: 12,
            leadingGap: 0,
            inlineWidth: step.now === null ? '' : step.text,
            inset: step.now === null ? '' : '0px'
        });
        this.checkpoints.push({ name: step.name + ' geometry', state: geometry });
    }

    async readSvgGeometry(step: Step) {
        const geometry = await this.part('indicator').evaluate((circle: SVGCircleElement) => ({
            circumference: Math.round(circle.getTotalLength()),
            dash: circle.getAttribute('stroke-dasharray'),
            inlineWidth: circle.style.width
        }));
        expect(Math.abs(geometry.circumference - 157)).toBeLessThanOrEqual(2);
        expect(geometry.dash).toBe(step.now === null ? null : step.now + ' 100');
        if (this.framework === 'angular') {
            expect(geometry.inlineWidth).toBe('');
            if (step.now === null) await expect(this.part('indicator')).not.toHaveAttribute('data-percent');
            else await expect(this.part('indicator')).toHaveAttribute('data-percent', step.now);
        }
        this.checkpoints.push({ name: step.name + ' geometry', state: geometry });
    }
}

const scenarios = Object.entries(cases).map(([name, steps]) => ({
    name,
    async run(driver: ProgressDriver) {
        for (const [index, step] of steps.entries()) {
            if (index > 0) {
                await driver.page
                    .getByRole('button', { name: 'Advance' })
                    .evaluate((button: HTMLButtonElement) => button.click());
            }
            await driver.readStep(step, index);
            if (name === 'linear') await driver.readLinearGeometry(step);
            if (name === 'svg') await driver.readSvgGeometry(step);
        }
        expect(driver.errors).toEqual([]);
    }
}));

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new ProgressDriver(page, framework),
    readNativeEvents: () => Promise.resolve([])
});

for (const scenario of scenarios) {
    test(scenario.name, ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
