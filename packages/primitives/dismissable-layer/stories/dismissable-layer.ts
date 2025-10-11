import { booleanAttribute, Component, input, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';

@Component({
    selector: 'dismissable-layer',
    imports: [RdxDismissableLayer],
    template: `
        <div class="w-2xs flex flex-col items-center">
            <button class="border-white-600 rounded-md border-2 px-4 py-2 text-white" (click)="open.set(!open())">
                Open
            </button>
            <div class="p-2"></div>
            @if (open()) {
                <div
                    class="border-white-600 w-[250px] border-2 p-5 text-white"
                    (dismiss)="handleDismiss()"
                    (pointerDownOutside)="handlePointerDownOutside($event)"
                    (escapeKeyDown)="handleEscapeKeyDown($event)"
                    (focusOutside)="handleFocusOutside($event)"
                    rdxDismissableLayer
                >
                    <div>Content</div>
                    <button
                        class="border-white-600 rounded-md border-2 px-4 py-2 text-white"
                        (click)="open.set(false)"
                        type="button"
                    >
                        Close button
                    </button>
                </div>
            }
            <div class="p-2"></div>
            <button class="border-white-600 rounded-md border-2 px-4 py-2 text-white" id="outside">
                Outside Click
            </button>
        </div>
    `
})
export class DismissableLayer {
    readonly preventEscapeKeyDownEvent = input(false, { transform: booleanAttribute });

    readonly preventPointerDownOutsideEvent = input(false, { transform: booleanAttribute });

    readonly preventFocusOutsideEvent = input(false, { transform: booleanAttribute });

    readonly open = signal(false);

    handleDismiss() {
        this.open.set(false);
    }

    handleEscapeKeyDown(event: KeyboardEvent) {
        if (this.preventEscapeKeyDownEvent()) event.preventDefault();
    }

    handlePointerDownOutside(event: PointerEvent) {
        if (this.preventPointerDownOutsideEvent()) event.preventDefault();
    }

    handleFocusOutside(event: FocusEvent) {
        console.log('handleFocusOutside : ', this.preventFocusOutsideEvent());
        if (this.preventFocusOutsideEvent()) event.preventDefault();
    }
}
