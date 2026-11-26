# Checkbox — Select all

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A parent checkbox derived from its children — `indeterminate` when only some are checked. Here the
parent/child logic (and the flat all ↔ none toggle) is wired **by hand** in the component.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon, LucideMinus } from '@lucide/angular';
import {
    CheckedState,
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

interface Item {
    id: string;
    label: string;
    checked: boolean;
}

/**
 * A "select all" parent whose state is derived from its children: checked when
 * all are ticked, `indeterminate` when only some are, unchecked otherwise.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-select-all-example',
    imports: [
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <div
                    [checked]="parentState() === true"
                    [indeterminate]="parentState() === 'indeterminate'"
                    (onCheckedChange)="toggleAll($event)"
                    rdxCheckboxRoot
                >
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="all"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            *rdxCheckboxIndicatorPresence
                            [lucideIcon]="parentState() === 'indeterminate' ? minusIcon : checkIcon"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" for="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items(); track item.id) {
                    <div class="flex items-center gap-3">
                        <div [checked]="item.checked" (onCheckedChange)="toggleItem(item.id, $event)" rdxCheckboxRoot>
                            <button
                                class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                [id]="item.id"
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
                            <input rdxCheckboxInput />
                        </div>
                        <label class="text-foreground text-sm font-medium" [attr.for]="item.id">
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxSelectAllExample {
    protected readonly minusIcon = LucideMinus;
    protected readonly checkIcon = LucideCheck;
    readonly items = signal<Item[]>([
        { id: 'apples', label: 'Apples', checked: true },
        { id: 'bananas', label: 'Bananas', checked: false },
        { id: 'cherries', label: 'Cherries', checked: false }
    ]);

    protected readonly parentState = computed<CheckedState>(() => {
        const items = this.items();
        if (items.every((item) => item.checked)) {
            return true;
        }
        return items.some((item) => item.checked) ? 'indeterminate' : false;
    });

    protected toggleAll(change: { checked: boolean }): void {
        // Clicking the parent resolves indeterminate -> checked (tick all),
        // or checked -> unchecked (clear all).
        this.items.update((items) => items.map((item) => ({ ...item, checked: change.checked })));
    }

    protected toggleItem(id: string, change: { checked: boolean }): void {
        this.items.update((items) =>
            items.map((item) => (item.id === id ? { ...item, checked: change.checked } : item))
        );
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
