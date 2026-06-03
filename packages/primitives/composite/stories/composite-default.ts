import { cn, demoButton, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';

@Component({
    selector: 'rdx-composite-default',
    imports: [RdxCompositeRoot, RdxCompositeItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col gap-6">
            <div
                class="flex flex-wrap items-center gap-2"
                orientation="horizontal"
                enableHomeAndEndKeys
                highlightItemOnHover
                rdxCompositeRoot
            >
                <button data-composite-item-active rdxCompositeItem [class]="itemClass">Overview</button>
                <button rdxCompositeItem [class]="itemClass">Metrics</button>
                <button rdxCompositeItem [class]="itemClass">Reports</button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                orientation="horizontal"
                rdxCompositeRoot
                [disabledIndices]="[2]"
                [loopFocus]="false"
            >
                <button rdxCompositeItem [class]="itemClass">Filter</button>
                <input rdxCompositeItem value="Search" [class]="inputClass" />
                <button aria-disabled="true" rdxCompositeItem [class]="itemClass">Archive</button>
                <button rdxCompositeItem [class]="itemClass">Export</button>
            </div>
        </div>
    `
})
export class RdxCompositeDefaultComponent {
    protected readonly itemClass = cn(
        demoButton.base,
        demoButton.outline,
        demoButton.size.md,
        'data-[composite-item-active]:border-primary'
    );
    protected readonly inputClass = cn(demoInput, 'max-w-40');
}
