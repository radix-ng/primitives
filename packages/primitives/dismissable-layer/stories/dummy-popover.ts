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

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const inputClasses =
    'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

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
            <button class="${primaryButtonClasses}" (click)="open.set(!open())" type="button" rdxPopperAnchor>
                Open popover
            </button>

            @if (open()) {
                <div rdxPortal>
                    <div
                        [disableOutsidePointerEvents]="disableOutsidePointerEvents()"
                        (dismiss)="handleDismiss()"
                        rdxDismissableLayer
                    >
                        <div [trapped]="trapped()" rdxFocusScope>
                            <div rdxPopperContentWrapper sideOffset="8" align="start" side="bottom">
                                <div
                                    class="border-border bg-card text-card-foreground flex min-w-64 flex-col gap-4 rounded-xl border p-5 shadow-lg"
                                    rdxPopperContent
                                >
                                    <div>
                                        <h3 class="text-sm font-semibold">Quick note</h3>
                                        <p class="text-muted-foreground mt-1 text-xs leading-5">
                                            Click outside or press Escape to dismiss.
                                        </p>
                                    </div>
                                    <input class="${inputClasses}" aria-label="Note" type="text" value="Review draft" />
                                    <button class="${buttonClasses}" (click)="open.set(false)">Close Popover</button>
                                </div>
                                <span
                                    class="text-card my-px drop-shadow-[0_1px_0_var(--color-border)]"
                                    rdxPopperArrow
                                    width="10"
                                    height="4"
                                ></span>
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
