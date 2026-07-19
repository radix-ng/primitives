# Combobox — Reactive forms

> One example from the [Combobox](../components/combobox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

The root is a `ControlValueAccessor`, so it binds to a `FormControl` like any other control.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'combobox-reactive-forms',
    imports: [_importsCombobox, ReactiveFormsModule, LucideChevronDown, LucideCheck],
    template: `
        <form class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxComboboxRoot>
                <div [class]="c.control">
                    <input [class]="c.input" rdxComboboxInput placeholder="Pick a fruit…" aria-label="Fruit" />
                    <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                </div>

                <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                    <div [class]="c.popup" rdxComboboxPopup>
                        <div [class]="c.list" rdxComboboxList aria-label="Fruits">
                            @for (f of fruits; track f) {
                                <div [class]="c.item" [value]="f" rdxComboboxItem>
                                    <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                        <svg lucideCheck size="14"></svg>
                                    </span>
                                    {{ f }}
                                </div>
                            }
                        </div>
                        <div [class]="c.empty" rdxComboboxEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">
                Value:
                <code>{{ fruit.value ?? 'null' }}</code>
            </p>
        </form>
    `
})
export class ComboboxReactiveForms {
    protected readonly c = demoCombobox;
    readonly fruit = new FormControl<string | null>('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
```
