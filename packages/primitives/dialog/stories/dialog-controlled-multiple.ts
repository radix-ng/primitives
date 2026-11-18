import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-controlled-multiple',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div #root="rdxDialogRoot" [(open)]="open" [(triggerId)]="triggerId" rdxDialogRoot>
                <div class="flex gap-2">
                    <button class="demo-button demo-button-outline h-9 px-4" id="account" rdxDialogTrigger>
                        Account
                    </button>
                    <button class="demo-button demo-button-outline h-9 px-4" id="billing" rdxDialogTrigger>
                        Billing
                    </button>
                </div>

                <ng-template rdxDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxDialogBackdrop
                    ></div>
                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>
                            {{ triggerId() === 'billing' ? 'Billing' : 'Account' }}
                        </h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active panel is driven from component state.
                        </p>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Close
                            </button>
                        </div>
                        <button
                            class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="openBilling()">
                Open billing externally
            </button>
        </div>
    `
})
export class RdxDialogControlledMultipleComponent {
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected openBilling() {
        this.triggerId.set('billing');
        this.open.set(true);
    }
}
