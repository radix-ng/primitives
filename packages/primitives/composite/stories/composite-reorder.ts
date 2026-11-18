import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';

/**
 * Demonstrates that roving focus keeps working after the items are reordered in
 * place. The list is driven by an `@for` tracked by a stable `id`, so reversing
 * the array makes Angular **reuse the views and move the DOM nodes** instead of
 * re-creating them — the composite item directives never re-register. A DOM-move
 * observer in the list is what keeps the index map (and roving tabindex) correct.
 */
@Component({
    selector: 'rdx-composite-reorder',
    imports: [RdxCompositeRoot, RdxCompositeItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col items-start gap-4">
            <div class="flex flex-wrap items-center gap-2" orientation="horizontal" rdxCompositeRoot>
                @for (item of items(); track item.id) {
                    <button
                        class="demo-button demo-button-outline h-9 px-4"
                        [attr.data-testid]="item.id"
                        rdxCompositeItem
                    >
                        {{ item.label }}
                    </button>
                }
            </div>

            <button
                class="demo-button demo-button-primary h-8 px-3 text-xs"
                (click)="reverse()"
                type="button"
                data-testid="reorder"
            >
                Reverse order
            </button>
        </div>
    `
})
export class RdxCompositeReorderComponent {
    protected readonly items = signal([
        { id: 'overview', label: 'Overview' },
        { id: 'metrics', label: 'Metrics' },
        { id: 'reports', label: 'Reports' },
        { id: 'settings', label: 'Settings' }
    ]);

    protected reverse(): void {
        this.items.update((current) => [...current].reverse());
    }
}
