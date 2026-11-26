# Select — Migrating existing Select consumers

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

- A named empty single Select now contributes `name=""` to `FormData`, matching the persistent native
  input contract. Previously an empty value contributed no entry. Multiple empty selections still
  contribute no entries. Disabled controls are excluded.

- Root's `id` now identifies the trigger and is forwarded there. For a separate DOM id on a Root
  wrapper, use `[attr.id]` with a different value or put that wrapper outside Root.

- Empty uncontrolled values now start as `null` (single) or `[]` (multiple), replacing `undefined`.
  Angular bindings may still write `undefined`; use nullish checks for an empty single value.
- Unparameterized TypeScript Root/Item references now use `unknown` instead of `AcceptableValue`.
  Supply `RdxSelectRoot<MyValue, false/true>` / `RdxSelectItem<MyValue>` or narrow before reading values.
- A single-mode array is now one item for labels, selection and submission. Set `[multiple]="true"`
  when the array represents a collection of selected values.
- Selection now uses `Object.is` instead of structural equality. Keep object references stable or
  supply `[isItemEqualToValue]="'id'"` / an explicit comparator. To retain the previous deep comparison,
  import `isEqual` from `@radix-ng/primitives/core` and pass it as the comparator.
- Display labels no longer depend on mounted `rdxSelectItemText` nodes. Provide `items` or
  `itemToStringLabel` when item text differs from the raw value. Object `label` / `value` properties
  remain fallback labels.

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
