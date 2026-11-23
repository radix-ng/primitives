# Autocomplete — Reactive forms

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The form value is the input string. Bind `[formControl]` to the root.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    RdxAutocompleteEmpty,
    RdxAutocompleteInput,
    RdxAutocompleteInputGroup,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot
} from '@radix-ng/primitives/autocomplete';

/**
 * Reactive forms: the form value **is** the input string (typed or selected). Bind `[formControl]`
 * directly to the root.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-reactive-forms',
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteInputGroup,
        RdxAutocompleteInput,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteEmpty,
        ReactiveFormsModule
    ],
    template: `
        <div class="flex flex-col gap-3">
            <div [formControl]="fruit" rdxAutocompleteRoot>
                <div
                    class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                    rdxAutocompleteInputGroup
                >
                    <input
                        class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-9 pl-3"
                        rdxAutocompleteInput
                        placeholder="Search a fruit…"
                        aria-label="Fruit"
                    />
                </div>

                <div
                    class="z-50 w-64 data-[closed]:pointer-events-none"
                    *rdxAutocompletePortal
                    rdxAutocompletePositioner
                >
                    <div
                        class="demo-combobox-popup mt-2 max-h-60 overflow-y-auto p-1 data-[closed]:hidden"
                        rdxAutocompletePopup
                    >
                        <div class="flex flex-col" rdxAutocompleteList aria-label="Fruits">
                            @for (item of fruits; track item) {
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                    rdxAutocompleteItem
                                >
                                    {{ item }}
                                </div>
                            }
                        </div>
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No fruit found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Value: {{ fruit.value || '—' }}</p>
        </div>
    `
})
export class AutocompleteReactiveForms {
    readonly fruit = new FormControl('Banana');
    readonly fruits = ['Apple', 'Banana', 'Blueberry', 'Grape', 'Orange'];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `match-sorter`, `@tanstack/angular-virtual` when an example imports them.
