import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxComboboxGroup,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxList,
    RdxComboboxRoot
} from '@radix-ng/primitives/combobox';
import { afterAll, describe, expect, it } from 'vitest';
import { benchmark, BenchmarkResult } from '../harness/benchmark';
import { writeResults } from '../harness/reporter';

const FILE = 'combobox.bench.ts';
// 50 = a typical command/search list; 500 mirrors Base UI's large Combobox benchmark; 2000 is the
// non-virtualized stress case that makes super-linear registry work visible.
const COUNTS = [50, 500, 2000];

// Keep the list inline and already mounted so this row isolates the shared Combobox/Autocomplete
// engine's item registration, group membership, DOM-order derivation, filtering state, and item host
// bindings. Popup, portal, and positioning costs are covered separately by the Select open benchmark.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-list-bench',
    standalone: true,
    imports: [RdxComboboxRoot, RdxComboboxInput, RdxComboboxList, RdxComboboxGroup, RdxComboboxItem],
    template: `
        <div rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Options" />
            <div rdxComboboxList>
                <div rdxComboboxGroup>
                    @for (option of options(); track option) {
                        <div [textValue]="option" [value]="option" rdxComboboxItem>{{ option }}</div>
                    }
                </div>
            </div>
        </div>
    `
})
class ComboboxListBench {
    readonly options = signal<string[]>([]);

    setCount(count: number): void {
        this.options.set(Array.from({ length: count }, (_, index) => `Option ${index}`));
    }
}

describe('Combobox', () => {
    const rows: BenchmarkResult[] = [];

    afterAll(async () => {
        await writeResults(FILE, rows);
    });

    for (const count of COUNTS) {
        it(`mount (${count} items)`, async () => {
            const result = await benchmark<ComboboxListBench>(`Combobox mount (${count} items)`, () => ({
                component: ComboboxListBench,
                prepare: (instance) => instance.setCount(count)
            }));
            rows.push(result);

            expect(result.duration.median).toBeGreaterThan(0);
        });
    }
});
