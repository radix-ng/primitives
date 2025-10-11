import { Component, contentChild, input, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';

@Component({
    selector: 'dismissable-box',
    imports: [RdxDismissableLayer],
    template: `
        <div
            class="rounded-xl bg-gray-100/10 p-4"
            (dismiss)="onDismiss()"
            (focusOutside)="onFocusOutside()"
            (pointerDownOutside)="onPointerDownOutside()"
            rdxDismissableLayer
        >
            <button
                class="border-white-600 rounded-md border-2 px-4 py-2 text-white"
                #buttonRef
                (click)="open.set(!open())"
            >
                {{ open() ? 'Close' : 'Open' }} new layer
            </button>
            <div class="p-2"></div>
            @if (open()) {
                <dismissable-box [onDismiss]="setDismiss" [onPointerDownOutside]="setonPointerDownOutside" />
            }
        </div>
    `
})
export class DismissableBox {
    readonly onDismiss = input<() => void>();
    readonly onFocusOutside = input<(ev: Event) => void>();
    readonly onPointerDownOutside = input<(ev: PointerEvent) => void>();

    readonly open = signal(false);

    readonly buttonRef = contentChild('buttonRef');

    setDismiss() {
        this.open.set(false);
    }

    setonPointerDownOutside(event: PointerEvent) {
        if (event.target === this.buttonRef()) {
            event.preventDefault();
        }
    }
}
