import { benchmark, BenchmarkResult } from '../harness/benchmark';
import { writeResults } from '../harness/reporter';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxCheckboxButtonDirective, RdxCheckboxRootDirective } from '@radix-ng/primitives/checkbox';
import { afterAll, describe, expect, it } from 'vitest';

const FILE = 'checkbox.bench.ts';
const COUNT = 500;

// Headless scenario: a row of N checkboxes. No styles — paint cost tracks DOM size, which is the
// point. `allChecked` is one-way bound into every checkbox so toggling it forces all N to re-render.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-list',
    standalone: true,
    imports: [RdxCheckboxRootDirective, RdxCheckboxButtonDirective],
    template: `
        @for (item of items(); track item) {
            <button rdxCheckboxRoot rdxCheckboxButton type="button" [checked]="allChecked()">·</button>
        }
    `
})
class CheckboxList {
    readonly items = signal<number[]>([]);
    readonly allChecked = signal(false);

    setCount(n: number): void {
        this.items.set(Array.from({ length: n }, (_, i) => i));
    }

    toggleAll(): void {
        this.allChecked.update((v) => !v);
    }
}

describe('Checkbox', () => {
    const rows: BenchmarkResult[] = [];

    afterAll(async () => {
        await writeResults(FILE, rows);
    });

    it(`mount (${COUNT} instances)`, async () => {
        const result = await benchmark<CheckboxList>(`Checkbox mount (${COUNT} instances)`, () => ({
            component: CheckboxList,
            prepare: (instance) => instance.setCount(COUNT)
        }));
        rows.push(result);

        expect(result.duration.median).toBeGreaterThan(0);
    });

    it(`toggle (${COUNT} instances)`, async () => {
        const result = await benchmark<CheckboxList>(`Checkbox toggle (${COUNT} instances)`, () => ({
            component: CheckboxList,
            prepare: (instance) => instance.setCount(COUNT),
            interact: (instance) => instance.toggleAll()
        }));
        rows.push(result);

        expect(result.duration.median).toBeGreaterThan(0);
    });
});
