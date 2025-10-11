import { booleanAttribute, Component, input, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';
import { RdxFocusGuards } from '@radix-ng/primitives/focus-guards';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import {
    RdxPopper,
    RdxPopperAnchor,
    RdxPopperArrow,
    RdxPopperContent,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Component({
    selector: 'dummy-popover',
    imports: [
        RdxDismissableLayer,
        RdxFocusGuards,
        RdxPortal,
        RdxFocusScope,
        RdxPopperAnchor,
        RdxPopper,
        RdxPopperContentWrapper,
        RdxPopperContent,
        RdxPopperArrow
    ],
    template: `
        <ng-container rdxPopperRoot>
            <button
                class="border-white-600 rounded-md border-2 px-4 py-2 text-white"
                (click)="open.set(!open())"
                type="button"
                rdxPopperAnchor
            >
                Open Popover
            </button>

            @if (open()) {
                <div rdxPortal>
                    <div
                        [disableOutsidePointerEvents]="disableOutsidePointerEvents()"
                        (dismiss)="handleDismiss()"
                        rdxDismissableLayer
                    >
                        <div [trapped]="trapped()" rdxFocusScope>
                            <div
                                class="flex min-h-[150px] min-w-[200px] items-start gap-4 rounded-md bg-white p-6"
                                rdxPopperContentWrapper
                                sideOffset="8"
                                align="start"
                                side="bottom"
                            >
                                <div rdxPopperContent>
                                    <button (click)="open.set(false)">Close Popover</button>
                                    <input type="text" value="hello world" />
                                </div>
                                <span class="fill-white" rdxPopperArrow width="10" height="4"></span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </ng-container>
    `
})
export class DummyPopover {
    readonly disableOutsidePointerEvents = input(false, { transform: booleanAttribute });

    readonly trapped = input(false, { transform: booleanAttribute });

    readonly open = signal(false);

    handleDismiss() {
        this.open.set(false);
    }
}
