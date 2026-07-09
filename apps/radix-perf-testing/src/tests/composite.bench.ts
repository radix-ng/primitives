import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { afterAll, describe, expect, it } from 'vitest';
import { benchmark, BenchmarkResult } from '../harness/benchmark';
import { writeResults } from '../harness/reporter';

const FILE = 'composite.bench.ts';
// 50 = typical roving-focus list (menu / toolbar / radio group); 1000 = non-virtualized worst case
// (a large select/combobox). Registration is derived from a stable element→registration Map + a tick
// counter, so mounting N items is ~O(n log n) (the document-order sort), not the O(n^2) an
// array-copy-per-registration would cost. Track both so a regression in either is visible.
const COUNTS = [50, 1000];

// N composite items under one root. Mounting exercises the full registration pipeline (roving
// tabindex, DOM-order sort, and the reorder MutationObserver). No styles — we track the machinery +
// DOM cost, not CSS.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'composite-list-bench',
    standalone: true,
    imports: [RdxCompositeRoot, RdxCompositeItem],
    template: `
        <div rdxCompositeRoot>
            @for (item of items(); track item) {
                <button rdxCompositeItem type="button">{{ item }}</button>
            }
        </div>
    `
})
class CompositeListBench {
    readonly items = signal<number[]>([]);

    setCount(n: number): void {
        this.items.set(Array.from({ length: n }, (_, i) => i));
    }

    reverse(): void {
        this.items.update((current) => [...current].reverse());
    }
}

describe('Composite', () => {
    const rows: BenchmarkResult[] = [];

    afterAll(async () => {
        await writeResults(FILE, rows);
    });

    for (const count of COUNTS) {
        it(`mount (${count} items)`, async () => {
            const result = await benchmark<CompositeListBench>(`Composite mount (${count} items)`, () => ({
                component: CompositeListBench,
                prepare: (instance) => instance.setCount(count)
            }));
            rows.push(result);

            expect(result.duration.median).toBeGreaterThan(0);
        });
    }

    // The reorder observer runs getAdjacentNodeRoots (O(n)) + a re-sort on every in-place reorder.
    // Measure it at a large n so any regression that makes reordering super-linear is visible.
    it(`reorder (1000 items)`, async () => {
        const result = await benchmark<CompositeListBench>(`Composite reorder (1000 items)`, () => ({
            component: CompositeListBench,
            prepare: (instance) => instance.setCount(1000),
            interact: (instance) => instance.reverse()
        }));
        rows.push(result);

        expect(result.duration.median).toBeGreaterThan(0);
    });
});
