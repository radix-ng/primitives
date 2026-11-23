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
import { LucideCheck, LucideDynamicIcon, LucideMinus } from '@lucide/angular';
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
        <div
            class="flex flex-col items-start gap-1"
            #group="rdxCheckboxGroup"
            [(value)]="value"
            [allValues]="all"
            rdxCheckboxGroup
            aria-label="Fruits"
        >
            <div class="flex items-center gap-2">
                <div parent rdxCheckboxRoot>
                    <button class="demo-choice size-4" id="all" rdxCheckboxButton>
                        <svg
                            class="flex items-center"
                            *rdxCheckboxIndicatorPresence
                            [lucideIcon]="group.parentState() === 'indeterminate' ? minusIcon : checkIcon"
                            rdxCheckboxIndicator
                            size="12"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ms-4 flex flex-col items-start gap-1">
                @for (item of items; track item.value) {
                    <div class="flex items-center gap-2">
                        <div [value]="item.value" rdxCheckboxRoot>
                            <button class="demo-choice size-4" [id]="item.value" rdxCheckboxButton>
                                <svg
                                    class="flex items-center"
                                    *rdxCheckboxIndicatorPresence
                                    rdxCheckboxIndicator
                                    size="12"
                                    lucideCheck
                                />
                            </button>
                        </div>
                        <label class="text-foreground text-sm" [htmlFor]="item.value" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly minusIcon = LucideMinus;
    protected readonly checkIcon = LucideCheck;
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
