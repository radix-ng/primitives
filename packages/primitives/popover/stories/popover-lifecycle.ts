import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import {
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverOpenChange,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    selector: 'rdx-popover-lifecycle',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        RdxFloatingInsideElement
    ],
    template: `
        <section class="grid w-96 gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer unmount
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input
                        [checked]="cancelNext()"
                        (change)="cancelNext.set($any($event.target).checked)"
                        type="checkbox"
                    />
                    Cancel next close
                </label>
            </div>
            <ng-container
                #root="rdxPopoverRoot"
                (onOpenChange)="change($event)"
                (onOpenChangeComplete)="complete($event)"
                rdxPopoverRoot
            >
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>Edit note</button>
                <ng-template [keepMounted]="keep()" rdxPopoverPortal>
                    <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                        <div
                            class="demo-surface data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative grid w-80 gap-3 p-4"
                            rdxPopoverPopup
                        >
                            <h2 class="demo-popover-title" rdxPopoverTitle>Draft note</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                A retained portal preserves this native input's value.
                            </p>
                            <label class="grid gap-2 text-sm">
                                Note
                                <input class="demo-input h-9 w-full px-3" value="draft" />
                            </label>
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxPopoverClose>
                                Close note
                            </button>
                        </div>
                    </div>
                </ng-template>
                <div class="flex gap-2">
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
                        (click)="root.close()"
                        rdxFloatingInside
                        type="button"
                    >
                        Close
                    </button>
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
                        (click)="root.unmount()"
                        rdxFloatingInside
                        type="button"
                    >
                        Finish exit
                    </button>
                </div>
                <p class="text-muted-foreground text-sm" aria-live="polite">
                    {{ root.open() ? 'Open' : root.transitionStatus() === 'ending' ? 'Closing' : 'Closed' }}
                </p>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Enable defer unmount before opening, close the popup, then finish its exit. Keep mounted preserves the
                draft after closing.
            </p>
            <output class="text-muted-foreground text-sm">Completed: {{ completions().join(', ') || 'none' }}</output>
        </section>
    `
})
export class RdxPopoverLifecycleComponent {
    protected readonly defer = signal(false);
    protected readonly keep = signal(false);
    protected readonly cancelNext = signal(false);
    protected readonly completions = signal<string[]>([]);
    protected change(change: RdxPopoverOpenChange) {
        if (change.open) return;
        if (this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
        }
        if (this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completions.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
