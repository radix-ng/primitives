# Select — Object values

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Each item's `value` is an object. Set `[isItemEqualToValue]="'id'"` so items are matched by a stable
key (here `id`) instead of reference, and render rich, two-line content in both the trigger and the
items from the selected object.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

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
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 min-w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
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
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>

                <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                    <div
                        class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (method of shippingMethods; track method.id) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground group relative flex min-h-7 items-center gap-2 py-1.5 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="method"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.

#### `./select-typed-control.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    provideRdxSelectRoot,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <button
            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                rdxSelectPopup
            >
                <div class="p-1" rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span
                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                aria-hidden="true"
                                rdxSelectItemIndicator
                            >
                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<Value = unknown, Multiple extends boolean = false> extends RdxSelectRoot<
    Value,
    Multiple
> {
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
```
