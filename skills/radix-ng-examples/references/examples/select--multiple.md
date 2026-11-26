# Select — Multiple

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

With `multiple`, picks accumulate in the value array, the trigger joins their labels, and every chosen
item keeps its indicator. Shows `RdxSelectIcon` and `RdxSelectSeparator`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectIcon,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectSeparator,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

/**
 * Multiple selection: picks accumulate in the value array, `RdxSelectValue` joins their labels, and
 * each selected item keeps its `RdxSelectItemIndicator` visible. Uses `RdxSelectIcon` for the chevron
 * and `RdxSelectSeparator` between groups.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-multiple',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectIcon,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectSeparator,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <div [(value)]="value" multiple rdxSelectRoot>
            <button
                class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 min-w-52 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                aria-label="Pick fruits"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Pick fruits…">
                    {{ selectedValue.slotText() }}
                </span>
                <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" rdxSelectIcon></svg>
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" rdxSelectPositioner>
                <div
                    class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div class="p-1" rdxSelectList>
                        <div class="demo-select-group-label px-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (fruit of fruits; track fruit) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="fruit"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true"></svg>
                                    </span>
                                    <span rdxSelectItemText>{{ fruit }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px" rdxSelectSeparator></div>
                        <div class="demo-select-group-label px-6" rdxSelectGroupLabel>Berries</div>
                        <div rdxSelectGroup>
                            @for (berry of berries; track berry) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="berry"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true"></svg>
                                    </span>
                                    <span rdxSelectItemText>{{ berry }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SelectMultiple {
    readonly value = signal<string[]>(['Apple']);
    readonly fruits = ['Apple', 'Banana', 'Grapes', 'Pineapple'];
    readonly berries = ['Blueberry', 'Raspberry', 'Strawberry'];
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
