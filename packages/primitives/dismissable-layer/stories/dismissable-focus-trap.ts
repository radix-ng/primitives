import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';

@Component({
    selector: 'dismissable-focus-trap',
    imports: [RdxDismissableLayer, RdxFocusScope],
    template: `
        <div class="flex flex-col justify-center">
            <button
                class="border-white-600 rounded-md border-2 px-4 py-2 text-white"
                #buttonRef
                (click)="openWithFocusScope.set(!openWithFocusScope())"
            >
                Open
            </button>
            <div class="p-2"></div>
            @if (openWithFocusScope()) {
                <div
                    (dismiss)="handleDismiss()"
                    (pointerDownOutside)="handlePointerDownOutside($event)"
                    disableOutsidePointerEvents
                    rdxDismissableLayer
                >
                    <div
                        class="bg-gray flex h-[300px] w-[400px] flex-col items-center justify-center rounded"
                        rdxFocusScope
                        trapped
                        loop
                    >
                        <input class="border-2 bg-white" type="text" />
                        <input class="border-2 bg-white" type="text" />
                        <input class="border-2 bg-white" type="text" />
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
        if (event.target == this.openButtonRef()?.nativeElement) {
            event.preventDefault();
        }
    }
}
