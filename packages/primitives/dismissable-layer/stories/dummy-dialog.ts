import { Component, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusGuards } from '@radix-ng/primitives/focus-guards';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPortal } from '@radix-ng/primitives/portal';

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const inputClasses =
    'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'dummy-dialog',
    imports: [RdxDismissableLayer, RdxFocusGuards, RdxPortal, RdxFocusScope],
    template: `
        <button class="${primaryButtonClasses}" (click)="open.set(!open())" type="button">Open dialog</button>
        @if (open()) {
            <div rdxFocusGuards>
                <div rdxPortal>
                    <div class="pointer-events-none fixed inset-0 bg-black/30"></div>
                </div>
                <div rdxPortal>
                    <div (dismiss)="handleDismiss()" rdxDismissableLayer disableOutsidePointerEvents>
                        <div
                            class="border-border bg-card text-card-foreground fixed left-1/2 top-1/2 flex min-h-48 min-w-80 -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border p-6 shadow-xl"
                            rdxFocusScope
                            trapped
                        >
                            <div>
                                <h3 class="text-base font-semibold">Edit profile</h3>
                                <p class="text-muted-foreground mt-1 text-sm leading-6">
                                    Focus stays inside the dialog until it is dismissed.
                                </p>
                            </div>
                            <input class="${inputClasses}" aria-label="Display name" type="text" value="Ada Lovelace" />
                            <button class="${buttonClasses}" (click)="open.set(false)" type="button">
                                Close dialog
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        }
    `
})
export class DummyDialog {
    readonly open = signal(false);

    handleDismiss() {
        this.open.set(false);
    }
}
