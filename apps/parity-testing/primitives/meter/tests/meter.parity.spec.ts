import { expect, test, type Page } from '@playwright/test';
import type { Checkpoint } from '../../../shared/compare.ts';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { cases } from '../src/contract.ts';

type Step = (typeof cases)[string][number];

class MeterDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly measurements: unknown[] = [];
    readonly errors: string[] = [];
    metadata?: Window['meterParity'];

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
    }

    async goto(name: string) {
        await this.page.goto('/' + this.framework + '.html?case=' + name);
        await expect(this.page.getByRole('meter')).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.meterParity);
    }

    async readStep(step: Step, index: number) {
        const root = this.page.getByRole('meter', { name: step.accessibleName ?? 'Storage used', exact: true });
        const min = String(step.min ?? 0);
        const max = String(step.max ?? 100);
        const now = String(step.now ?? step.value);
        const defaultText = step.percent + '%';
        const read = () =>
            root.evaluate((element) => {
                const label = element.querySelector('[data-part="label"]');
                const value = element.querySelector('[data-part="value"]')!;
                const labelledBy = element.getAttribute('aria-labelledby');
                return {
                    step: element.getAttribute('data-step'),
                    min: element.getAttribute('aria-valuemin'),
                    max: element.getAttribute('aria-valuemax'),
                    now: element.getAttribute('aria-valuenow'),
                    text: element.getAttribute('aria-valuetext'),
                    describedBy: element.getAttribute('aria-describedby'),
                    labelRole: label?.getAttribute('role') ?? null,
                    labelledBy: labelledBy === label?.id ? 'label' : labelledBy,
                    visible: value.textContent,
                    valueHidden: value.getAttribute('aria-hidden')
                };
            });
        await expect.poll(read, step.name).toEqual({
            step: String(index),
            min,
            max,
            now,
            text: step.text ?? defaultText,
            describedBy: null,
            labelRole: step.showLabel === false ? null : 'presentation',
            labelledBy: step.labelledBy ?? (step.showLabel === false ? null : 'label'),
            visible: step.visible ?? step.text ?? defaultText,
            valueHidden: 'true'
        });
        if (step.labelId) await expect(root.locator('[data-part="label"]')).toHaveAttribute('id', step.labelId);
        if (this.framework === 'angular') {
            const numbers = await root.evaluate((element) =>
                [element, ...element.querySelectorAll('[data-part]:not([data-part="label"])')].map((part) =>
                    ['min', 'max', 'value', 'percent'].map((name) => part.getAttribute('data-' + name))
                )
            );
            expect(numbers).toEqual(Array.from({ length: 4 }, () => [min, max, now, String(step.percent)]));
        }
        this.checkpoints.push({ name: step.name, state: await read() });
    }

    async readLinearGeometry(step: Step) {
        const geometry = await this.page.locator('[data-part="indicator"]').evaluate((indicator: HTMLElement) => {
            const track = indicator.parentElement!.getBoundingClientRect();
            const fill = indicator.getBoundingClientRect();
            const direction = getComputedStyle(indicator).direction;
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
            direction: step.direction ?? 'ltr',
            width: step.percent * 2,
            height: 12,
            leadingGap: 0,
            inlineWidth: step.percent + '%',
            inset: '0px'
        });
        this.checkpoints.push({ name: step.name + ' geometry', state: geometry });
    }

    async readSvgGeometry(step: Step) {
        const geometry = await this.page.locator('[data-part="indicator"]').evaluate((circle: SVGCircleElement) => ({
            circumference: Math.round(circle.getTotalLength()),
            dash: circle.getAttribute('stroke-dasharray'),
            inlineWidth: circle.style.width
        }));
        expect(Math.abs(geometry.circumference - 157)).toBeLessThanOrEqual(2);
        expect(geometry.dash).toBe(step.percent + ' 100');
        this.checkpoints.push({ name: step.name + ' geometry', state: geometry });
    }
}

const scenarios = Object.entries(cases).map(([name, steps]) => ({
    name,
    async run(driver: MeterDriver) {
        for (const [index, step] of steps.entries()) {
            if (index > 0) await driver.page.getByRole('button', { name: 'Advance' }).click();
            await driver.readStep(step, index);
            if (name === 'svg') await driver.readSvgGeometry(step);
            else await driver.readLinearGeometry(step);
        }
        expect(driver.errors).toEqual([]);
    }
}));

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    createDriver: (page, framework) => new MeterDriver(page, framework),
    readNativeEvents: () => Promise.resolve([])
});

for (const scenario of scenarios) {
    test(scenario.name, ({ browser, baseURL }, info) => run(scenario, { browser, baseURL }, info));
}
