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
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    data-composite-item-active
                    rdxCompositeItem
                >
                    Overview
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Metrics
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Reports
                </button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                [disabledIndices]="[2]"
                [loopFocus]="false"
                orientation="horizontal"
                rdxCompositeRoot
            >
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Filter
                </button>
                <input class="demo-input h-9 w-full max-w-40 px-3" rdxCompositeItem value="Search" />
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    aria-disabled="true"
                    rdxCompositeItem
                >
                    Archive
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Export
                </button>
            </div>
        </div>
    `
})
export class RdxCompositeDefaultComponent {}
