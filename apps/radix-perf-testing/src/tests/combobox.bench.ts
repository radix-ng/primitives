import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import {
    RdxComboboxGroup,
    RdxComboboxInput,
    RdxComboboxItem,
    RdxComboboxList,
    RdxComboboxRoot
} from '@radix-ng/primitives/combobox';
import { afterAll, describe, expect, it } from 'vitest';
import { BenchInteractionContext, benchmark, BenchmarkResult } from '../harness/benchmark';
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

const TYPING_COUNT = 500;

// Base UI parity benchmark: the options are referentially stable and already mounted before timing.
// Each InputEvent gets its own explicit Angular change-detection pass, matching separate user
// keystrokes instead of letting the signal writes collapse into one final render.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-typing-bench',
    standalone: true,
    imports: [RdxComboboxRoot, RdxComboboxInput, RdxComboboxList, RdxComboboxItem],
    template: `
        <div [open]="true" rdxComboboxRoot>
            <input #input rdxComboboxInput aria-label="combobox-bench" />
            <div rdxComboboxList>
                @for (option of options; track option) {
                    <div [textValue]="option" [value]="option" rdxComboboxItem>{{ option }}</div>
                }
            </div>
        </div>
    `
})
class ComboboxTypingBench {
    private readonly input = viewChild.required('input', { read: ElementRef<HTMLInputElement> });
    readonly options = Array.from({ length: TYPING_COUNT }, (_, index) => `Row ${index}`);

    type(text: string, context: BenchInteractionContext): void {
        const input = this.input().nativeElement;
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (!valueSetter) {
            throw new Error('Missing native HTMLInputElement value setter');
        }

        for (let index = 1; index <= text.length; index++) {
            const next = text.slice(0, index);
            valueSetter.call(input, next);
            input.dispatchEvent(
                new InputEvent('input', {
                    bubbles: true,
                    inputType: 'insertText',
                    data: text[index - 1]
                })
            );
            context.tick();
        }
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

    it('types a common prefix while all 500 items stay mounted', async () => {
        const result = await benchmark<ComboboxTypingBench>(
            'Combobox type — 500 items, all stay mounted (type "Row ")',
            () => ({
                component: ComboboxTypingBench,
                interact: (instance, context) => instance.type('Row ', context)
            })
        );
        rows.push(result);

        expect(result.renders).toBe(4);
    });

    it('types a query that narrows 500 items to about 11', async () => {
        const result = await benchmark<ComboboxTypingBench>(
            'Combobox type — 500 items, narrows to ~11 (type "Row 25")',
            () => ({
                component: ComboboxTypingBench,
                interact: (instance, context) => instance.type('Row 25', context)
            })
        );
        rows.push(result);

        expect(result.renders).toBe(6);
    });
});
