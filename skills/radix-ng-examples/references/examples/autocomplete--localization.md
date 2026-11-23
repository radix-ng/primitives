# Autocomplete — Localization

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `locale` to make the default `contains` filter compare strings with that locale's collation rules.
Under Turkish, the lowercase query `i` matches the dotted `İ` but not the dotless `I`; changing `locale`
re-filters the list immediately.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

/** Turkish cities that differ by the dotted/dotless `i`, so the collator's locale is observable. */
const CITIES = ['Ankara', 'Bursa', 'Isparta', 'Iğdır', 'İstanbul', 'İzmir', 'Mersin', 'Trabzon'];

/**
 * The default `contains` filter is locale-aware. Type `i` and switch the locale: under Turkish, the
 * lowercase `i` matches the dotted `İ` (İstanbul, İzmir) but not the dotless `I` (Isparta, Iğdır);
 * under English it matches both. Switching re-filters live because the collator is rebuilt reactively.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-locale',
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteInputGroup,
        RdxAutocompleteInput,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem,
        RdxAutocompleteEmpty
    ],
    template: `
        <div class="flex w-80 flex-col gap-3">
            <div class="flex items-center gap-2">
                <span class="text-muted-foreground text-sm">Locale</span>
                <div class="border-border inline-flex overflow-hidden rounded-md border">
                    @for (loc of locales; track loc.value) {
                        <button
                            class="px-2.5 py-1 text-sm outline-none"
                            [class]="
                                locale() === loc.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-foreground hover:bg-muted'
                            "
                            [attr.aria-pressed]="locale() === loc.value"
                            (click)="locale.set(loc.value)"
                            type="button"
                        >
                            {{ loc.label }}
                        </button>
                    }
                </div>
            </div>

            <div [(value)]="value" [locale]="locale()" rdxAutocompleteRoot>
                <div
                    class="demo-combobox-control focus-within:ring-ring focus-within:ring-offset-background relative inline-flex h-9 w-64 items-center focus-within:ring-2 focus-within:ring-offset-2 data-[disabled]:opacity-50"
                    rdxAutocompleteInputGroup
                >
                    <input
                        class="demo-combobox-input placeholder:text-muted-foreground h-full w-full pr-3 pr-9 pl-3"
                        rdxAutocompleteInput
                        placeholder="Type i…"
                        aria-label="City"
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
                        <div class="flex flex-col" rdxAutocompleteList aria-label="Cities">
                            @for (city of cities; track city) {
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex items-center py-1.5 pr-2 pl-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:font-medium"
                                    rdxAutocompleteItem
                                >
                                    {{ city }}
                                </div>
                            }
                        </div>
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No cities found.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-xs leading-5">
                Under Turkish, typing “i” keeps the dotted-İ cities (İzmir, İstanbul) and drops the dotless-I ones
                (Isparta, Iğdır). Switch to English to match both.
            </p>
        </div>
    `
})
export class AutocompleteLocale {
    readonly value = signal('');
    readonly cities = CITIES;
    readonly locale = signal<Intl.LocalesArgument>('tr');
    readonly locales = [
        { value: 'tr' as Intl.LocalesArgument, label: 'Turkish (tr)' },
        { value: 'en' as Intl.LocalesArgument, label: 'English (en)' }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `match-sorter`, `@tanstack/angular-virtual` when an example imports them.
