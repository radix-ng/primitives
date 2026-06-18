import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { cn, demoButton, demoInput } from '../../storybook/styles';

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
                <button [class]="itemClass" data-composite-item-active rdxCompositeItem>Overview</button>
                <button [class]="itemClass" rdxCompositeItem>Metrics</button>
                <button [class]="itemClass" rdxCompositeItem>Reports</button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                [disabledIndices]="[2]"
                [loopFocus]="false"
                orientation="horizontal"
                rdxCompositeRoot
            >
                <button [class]="itemClass" rdxCompositeItem>Filter</button>
                <input [class]="inputClass" rdxCompositeItem value="Search" />
                <button [class]="itemClass" aria-disabled="true" rdxCompositeItem>Archive</button>
                <button [class]="itemClass" rdxCompositeItem>Export</button>
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
