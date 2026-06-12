import { Component, signal } from '@angular/core';
import {
    RdxSelectGroup,
    RdxSelectItem,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPortalPresence,
    RdxSelectPositioner,
    RdxSelectPositionerContent,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { afterAll, describe, expect, it } from 'vitest';
import { benchmark, BenchmarkResult } from '../harness/benchmark';
import { writeResults } from '../harness/reporter';

const FILE = 'select.bench.ts';
const COUNT = 1000;

// Highest-risk path: opening a Select renders all options through the collection (DOM-order
// contentChildren), the portal, and the popper positioner at once. Mounted closed is cheap; the
// measured interaction is the open. No styles — we track the machinery + DOM cost, not CSS.
@Component({
    selector: 'select-open',
    standalone: true,
    imports: [
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPortalPresence,
        RdxSelectPopup,
        RdxSelectPositioner,
        RdxSelectPositionerContent,
        RdxSelectList,
        RdxSelectGroup,
        RdxSelectItem,
        RdxSelectItemText
    ],
    template: `
        <ng-container [open]="isOpen()" rdxSelectRoot>
            <button rdxSelectTrigger type="button" aria-label="options">
                <span rdxSelectValue placeholder="Pick…"></span>
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectPopup>
                        <div rdxSelectPositioner>
                            <div rdxSelectPositionerContent>
                                <div rdxSelectList>
                                    <div rdxSelectGroup>
                                        @for (option of options(); track option) {
                                            <div [value]="option" rdxSelectItem>
                                                <span rdxSelectItemText>{{ option }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
class SelectOpen {
    readonly isOpen = signal(false);
    readonly options = signal<string[]>([]);

    setCount(n: number): void {
        this.options.set(Array.from({ length: n }, (_, i) => `Option ${i}`));
    }

    open(): void {
        this.isOpen.set(true);
    }
}

describe('Select', () => {
    const rows: BenchmarkResult[] = [];

    afterAll(async () => {
        await writeResults(FILE, rows);
    });

    it(`open (${COUNT} options)`, async () => {
        const result = await benchmark<SelectOpen>(`Select open (${COUNT} options)`, () => ({
            component: SelectOpen,
            prepare: (instance) => instance.setCount(COUNT),
            interact: (instance) => instance.open()
        }));
        rows.push(result);

        expect(result.duration.median).toBeGreaterThan(0);
    });
});
