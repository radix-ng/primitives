import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const inputClasses =
    'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'dismissable-focus-trap',
    imports: [RdxDismissableLayer, RdxFocusScope],
    template: `
        <div class="flex w-md flex-col items-start gap-4">
            <div>
                <h3 class="text-base font-semibold">Focus trap</h3>
                <p class="text-muted-foreground mt-1 text-sm leading-6">
                    Open the layer and use Tab. Focus loops through the fields and close button.
                </p>
            </div>
            <button class="${primaryButtonClasses}" #buttonRef (click)="openWithFocusScope.set(true)">
                Open layer
            </button>
            @if (openWithFocusScope()) {
                <div
                    (dismiss)="handleDismiss()"
                    (pointerDownOutside)="handlePointerDownOutside($event)"
                    disableOutsidePointerEvents
                    rdxDismissableLayer
                >
                    <div
                        class="border-border bg-card flex w-sm flex-col gap-3 rounded-xl border p-5 shadow-sm"
                        rdxFocusScope
                        trapped
                        loop
                    >
                        <p class="text-sm font-medium">Profile details</p>
                        <input class="${inputClasses}" placeholder="First name" type="text" />
                        <input class="${inputClasses}" placeholder="Last name" type="text" />
                        <button class="${buttonClasses}" (click)="openWithFocusScope.set(false)" type="button">
                            Close layer
                        </button>
                    </div>
                </div>
            }
        </div>
    `
})
export class DismissableFocusTrap {
    readonly openWithFocusScope = signal(false);

    readonly openButtonRef = viewChild<ElementRef>('buttonRef');

    handleDismiss() {
        this.openWithFocusScope.set(false);
    }

    handlePointerDownOutside(event: PointerEvent) {
        if (event.target === this.openButtonRef()?.nativeElement) {
            event.preventDefault();
        }
    }
}
