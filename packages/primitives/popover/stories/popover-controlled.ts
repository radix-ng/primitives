import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverBackdrop,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverBackdrop,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
                <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="open.set(true)">
                    Open externally
                </button>
                <button class="demo-button demo-button-ghost h-8 px-3 text-xs" (click)="open.set(false)">
                    Close externally
                </button>
            </div>

            <p class="text-muted-foreground text-xs">State: {{ open() ? 'open' : 'closed' }}</p>

            <ng-container [(open)]="open" rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>Toggle popover</button>

                <ng-template rdxPopoverPortal>
                    <div class="bg-foreground/10 fixed inset-0" rdxPopoverBackdrop></div>
                    <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                        <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                            <h2 class="demo-popover-title" rdxPopoverTitle>Controlled state</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                The root uses Angular two-way binding with a signal.
                            </p>
                            <button
                                class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                                aria-label="Close"
                                rdxPopoverClose
                            >
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverControlledComponent {
    protected readonly open = signal(false);
}
