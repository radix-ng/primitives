# Checkbox — Checkbox group

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The same UI, but `rdxCheckboxGroup` owns it. It manages a single array value — the `value`s of the
checked checkboxes — and a child marked `parent` becomes the "select all", with its state derived
from `allValues`. Clicking the parent **remembers the partial selection** (partial → all → none →
back to the partial), and disabled selections are preserved. Bind the group's `string[]` value with
`[(value)]`, `ngModel`, or Reactive Forms. Give the group a `name` to submit its enabled selections
as repeated entries. With an unnamed group, each named child contributes its own native entry.
The effective native name supplies a child's group identity when `value` is omitted.

To label a group, wrap it with `rdxFieldRoot` and use one `rdxFieldLabel` for the group. Give each
checkbox a distinct `value` and wrap it in `rdxFieldItem` for its own label and description. Group
descriptions also apply to its children. Give the select-all button an explicit accessible name,
such as `aria-label="Select all features"`. If the Field has a `name`, each enabled checked child
submits under that name. A child with `required` must be checked individually. Use
`rdxFieldError` to display its native validation failure.

A group moved through `rdxPortal` can still submit via its declaring `rdxFormRoot` when it lives
inside a Field. The form collects values from the group's connected, enabled native inputs.
An explicit `form` attribute assigns native form ownership. Resetting the declaring form restores
the editable selection even when the group has moved outside it.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

/**
 * `rdxCheckboxGroup` holds the array of checked values. Each child participates by its `value`, and
 * the checkbox marked `parent` becomes a "select all" whose state (checked / indeterminate /
 * unchecked) is derived from `allValues` — no manual wiring.
 *
 * Try the parent from a partial selection: it cycles partial → all → none → back to your partial
 * selection, instead of a flat all/none toggle.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-group-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3" #group="rdxCheckboxGroup" [(value)]="value" [allValues]="all" rdxCheckboxGroup>
            <div class="flex items-center gap-3">
                <div parent rdxCheckboxRoot>
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="all"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            *rdxCheckboxIndicatorPresence
                            [lucideIcon]="group.parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items; track item.value) {
                    <div class="flex items-center gap-3">
                        <div [value]="item.value" rdxCheckboxRoot>
                            <button
                                class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                [id]="item.value"
                                rdxCheckboxButton
                            >
                                <svg
                                    class="text-primary flex items-center"
                                    *rdxCheckboxIndicatorPresence
                                    rdxCheckboxIndicator
                                    size="16"
                                    lucideCheck
                                />
                            </button>
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.value" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly items = [
        { value: 'apples', label: 'Apples' },
        { value: 'bananas', label: 'Bananas' },
        { value: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.value);

    value = signal<string[]>(['apples']);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
