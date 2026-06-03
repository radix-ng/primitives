import { cn, demoButton, demoDrawer, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-virtual-keyboard',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button rdxDrawerTrigger [class]="cn(b.base, b.primary, b.size.md)">Edit delivery</button>

            <ng-template rdxDrawerPortal>
                <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                <div
                    class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+var(--drawer-keyboard-inset,0px))] transition-[padding-bottom] duration-200"
                    rdxDrawerViewport
                    rdxDrawerVirtualKeyboardProvider
                >
                    <div
                        class="border-border bg-card text-card-foreground max-h-[min(82vh,calc(100vh-var(--drawer-keyboard-inset,0px)-2rem))] w-full max-w-lg [transform:translateY(var(--drawer-swipe-movement-y))] overflow-hidden rounded-t-xl border px-0 pt-3 shadow-lg outline-none [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),max-height_200ms_ease] data-[ending-style]:[transform:translateY(100%)] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                        rdxDrawerPopup
                    >
                        <div class="bg-muted mx-auto mb-4 h-1 w-10 rounded-full"></div>

                        <form
                            class="max-h-[inherit] [scroll-padding-bottom:calc(var(--drawer-keyboard-inset,0px)+4rem)] overflow-y-auto px-6 pb-6"
                        >
                            <div class="mb-5">
                                <h2 rdxDrawerTitle [class]="d.title">Delivery details</h2>
                                <p rdxDrawerDescription [class]="d.description">
                                    Confirm the address and contact fields before placing the order.
                                </p>
                            </div>

                            <div class="grid gap-4">
                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Name</span>
                                    <input value="Ada Lovelace" [class]="i.base" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Phone</span>
                                    <input inputmode="tel" value="+1 415 555 0142" [class]="i.base" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Street address</span>
                                    <input value="12 Market Street" [class]="i.base" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Apartment</span>
                                    <input placeholder="Optional" [class]="i.base" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Delivery notes</span>
                                    <textarea
                                        class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                                    >
Leave at reception if nobody answers.</textarea
                                    >
                                </label>
                            </div>

                            <div class="bg-card sticky bottom-0 mt-6 flex justify-end gap-2 border-t py-4">
                                <button type="button" rdxDrawerClose [class]="cn(b.base, b.outline, b.size.sm)">
                                    Cancel
                                </button>
                                <button type="button" rdxDrawerClose [class]="cn(b.base, b.primary, b.size.sm)">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerVirtualKeyboardComponent {
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly i = demoInput;
    protected readonly cn = cn;
}
