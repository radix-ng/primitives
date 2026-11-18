import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-popover-default',
    imports: [
        RdxPopoverArrow,
        RdxPopoverClose,
        RdxPopoverDescription,
        RdxPopoverPopup,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverRoot,
        RdxPopoverTitle,
        RdxPopoverTrigger,
        LucidePlus,
        LucideX
    ],
    template: `
        <ng-container rdxPopoverRoot>
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                type="button"
                rdxPopoverTrigger
            >
                <svg aria-hidden="true" lucidePlus size="16" />
                Add details
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                <div
                    class="demo-surface data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 p-4"
                    rdxPopoverPopup
                >
                    <span
                        class="text-card my-px fill-current drop-shadow-[0_1px_0_var(--color-border)]"
                        rdxPopoverArrow
                    ></span>
                    <h2 class="text-popover-foreground text-sm font-semibold" rdxPopoverTitle>Dimensions</h2>
                    <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                        Set the width and height for the element.
                    </p>

                    <div class="mt-4 grid gap-3">
                        @for (field of fields; track field.label) {
                            <label class="grid gap-1 text-xs font-medium">
                                {{ field.label }}
                                <input
                                    class="border-border bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    [value]="field.value"
                                />
                            </label>
                        }
                    </div>

                    <button
                        class="text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        type="button"
                        aria-label="Close"
                        rdxPopoverClose
                    >
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverDefaultComponent {
    protected readonly fields = [
        { label: 'Width', value: '100%' },
        { label: 'Max width', value: '300px' }
    ];
}
