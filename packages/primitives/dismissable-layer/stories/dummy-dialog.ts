import { Component, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { RdxFocusGuards } from '../../focus-guards';

@Component({
    selector: 'dummy-dialog',
    imports: [RdxDismissableLayer, RdxFocusGuards, RdxPortal, RdxFocusScope],
    template: `
        <button
            class="border-white-600 rounded-md border-2 px-4 py-2 text-white"
            (click)="open.set(!open())"
            type="button"
        >
            Open Dialog
        </button>
        @if (open()) {
            <div rdxFocusGuards>
                <div rdxPortal>
                    <div class="pointer-event-none fixed bottom-0 left-0 right-0 top-0 bg-black/30"></div>
                </div>
                <div rdxPortal>
                    <div (dismiss)="handleDismiss()" rdxDismissableLayer disableOutsidePointerEvents>
                        <div
                            class="min-height-[200px] fixed left-1/2 top-1/2 flex min-w-[300px] -translate-x-1/2 -translate-y-1/2 items-start gap-4 rounded-lg bg-white bg-white p-8 shadow-xl"
                            rdxFocusScope
                            trapped
                        >
                            <button (click)="open.set(false)" type="button">Close</button>
                            <input type="text" value="Hello world" />
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
