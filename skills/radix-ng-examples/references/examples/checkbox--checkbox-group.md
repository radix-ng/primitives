# Checkbox — Checkbox group

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

The same UI, but `rdxCheckboxGroup` owns it. It manages a single array value — the `value`s of the
checked checkboxes — and a child marked `parent` becomes the "select all", with its state derived
from `allValues`. Clicking the parent **remembers the partial selection** (partial → all → none →
back to the partial), disabled-but-checked children are preserved, and the group is itself a form
control, so `[(value)]`, `ngModel`, and reactive forms bind to the `string[]` value. For native forms,
put `name` on the group; selected children become repeated entries under that name. A child `name`
still works as a compatibility fallback when its `value` is omitted.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxGroupDirective } from '../src/checkbox-group';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

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
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3" #group="rdxCheckboxGroup" [(value)]="value" [allValues]="all" rdxCheckboxGroup>
            <div class="flex items-center gap-3">
                <div parent rdxCheckboxRoot>
                    <button id="all" [class]="c.button" rdxCheckboxButton>
                        <svg
                            [class]="c.indicator"
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
                            <button [class]="c.button" [id]="item.value" rdxCheckboxButton>
                                <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
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
    protected readonly c = demoCheckbox;

    protected readonly items = [
        { value: 'apples', label: 'Apples' },
        { value: 'bananas', label: 'Bananas' },
        { value: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.value);

    value = signal<string[]>(['apples']);
}
```
