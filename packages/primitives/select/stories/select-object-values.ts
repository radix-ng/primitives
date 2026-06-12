import { Component } from '@angular/core';
import { LucideCheck, LucideChevronsUpDown } from '@lucide/angular';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPositioner } from '../src/select-positioner';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

interface ShippingMethod {
    id: string;
    name: string;
    duration: string;
    price: string;
}

/**
 * Object values: each item's `value` is a `ShippingMethod` object rather than a string. Items are
 * compared by their `id` (`[isItemEqualToValue]="'id'"`) so the pre-selected `[value]` matches the
 * right item, and both the trigger and the items render rich, two-line content from the object.
 */
@Component({
    selector: 'select-object-values',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectPositioner,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        LucideChevronsUpDown,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col items-start gap-1.5">
            <label class="text-foreground cursor-default text-sm font-medium" id="shipping-method-label">
                Shipping method
            </label>

            <ng-container #root="rdxSelectRoot" [value]="shippingMethods[0]" [isItemEqualToValue]="'id'" rdxSelectRoot>
                <button
                    class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-9 min-w-64 items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[disabled]:opacity-50"
                    aria-labelledby="shipping-method-label"
                    rdxSelectTrigger
                >
                    <span #value="rdxSelectedValue" rdxSelectValue placeholder="Select a method...">
                        @if (asMethod(root.value()); as method) {
                            <span class="flex flex-col items-start gap-0.5">
                                <span class="text-sm leading-none">{{ method.name }}</span>
                                <span class="text-muted-foreground text-xs leading-none">
                                    {{ method.duration }} ({{ method.price }})
                                </span>
                            </span>
                        } @else {
                            {{ value.placeholder() }}
                        }
                    </span>
                    <svg class="text-muted-foreground shrink-0" lucideChevronsUpDown size="16" />
                </button>

                <div *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                    <div
                        class="border-border bg-popover text-popover-foreground z-[100] min-w-[var(--radix-select-trigger-width)] rounded-lg border shadow-md will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (method of shippingMethods; track method.id) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground group relative grid cursor-default grid-cols-[1.25rem_1fr] items-start gap-2 rounded-sm py-1.5 pr-3 pl-2 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="method"
                                    rdxSelectItem
                                >
                                    <span
                                        class="col-start-1 mt-0.5 inline-flex items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span class="col-start-2 flex flex-col gap-0.5" rdxSelectItemText>
                                        <span class="text-sm leading-none">{{ method.name }}</span>
                                        <span
                                            class="text-muted-foreground group-data-[highlighted]:text-primary-foreground/80 text-xs leading-none"
                                        >
                                            {{ method.duration }} ({{ method.price }})
                                        </span>
                                    </span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class SelectObjectValues {
    readonly shippingMethods: ShippingMethod[] = [
        { id: 'standard', name: 'Standard', duration: 'Delivers in 4-6 business days', price: '$4.99' },
        { id: 'express', name: 'Express', duration: 'Delivers in 2-3 business days', price: '$9.99' },
        { id: 'overnight', name: 'Overnight', duration: 'Delivers next business day', price: '$19.99' }
    ];

    /** Narrows the root's `AcceptableValue` back to the demo's object type for template rendering. */
    asMethod(value: unknown): ShippingMethod | undefined {
        return value as ShippingMethod | undefined;
    }
}
