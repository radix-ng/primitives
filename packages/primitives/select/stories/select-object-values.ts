import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
        LucideChevronDown,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col items-start gap-1.5">
            <label class="text-foreground cursor-default text-sm font-medium" id="shipping-method-label">
                Shipping method
            </label>

            <ng-container #root="rdxSelectRoot" [value]="shippingMethods[0]" [isItemEqualToValue]="'id'" rdxSelectRoot>
                <button class="min-w-64" [class]="s.trigger" aria-labelledby="shipping-method-label" rdxSelectTrigger>
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
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>

                <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="5" align="start" rdxSelectPositioner>
                    <div [class]="s.popup" rdxSelectPopup>
                        <div [class]="s.list" rdxSelectList>
                            @for (method of shippingMethods; track method.id) {
                                <div class="group py-1.5" [class]="s.item" [value]="method" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span class="flex flex-col gap-0.5" rdxSelectItemText>
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
    protected readonly s = demoSelect;

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
