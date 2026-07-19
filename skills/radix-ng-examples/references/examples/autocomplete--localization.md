# Autocomplete — Localization

> One example from the [Autocomplete](../components/autocomplete.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `locale` to make the default `contains` filter compare strings with that locale's collation rules.
Under Turkish, the lowercase query `i` matches the dotted `İ` but not the dotless `I`; changing `locale`
re-filters the list immediately.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

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
    imports: [_importsAutocomplete],
    template: `
        <div class="flex w-80 flex-col gap-3">
            <div class="flex items-center gap-2">
                <span class="text-muted-foreground text-sm">Locale</span>
                <div class="border-border inline-flex overflow-hidden rounded-md border">
                    @for (loc of locales; track loc.value) {
                        <button
                            [class]="
                                cn(
                                    'px-2.5 py-1 text-sm outline-none',
                                    locale() === loc.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-foreground hover:bg-muted'
                                )
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
                <div [class]="c.control" rdxAutocompleteInputGroup>
                    <input [class]="cn(c.input, 'pr-3')" rdxAutocompleteInput placeholder="Type i…" aria-label="City" />
                </div>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner>
                    <div [class]="c.popup" rdxAutocompletePopup>
                        <div [class]="c.list" rdxAutocompleteList aria-label="Cities">
                            @for (city of cities; track city) {
                                <div [class]="c.item" rdxAutocompleteItem>{{ city }}</div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No cities found.</div>
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
    protected readonly c = demoCombobox;
    protected readonly cn = cn;
    readonly value = signal('');
    readonly cities = CITIES;
    readonly locale = signal<Intl.LocalesArgument>('tr');
    readonly locales = [
        { value: 'tr' as Intl.LocalesArgument, label: 'Turkish (tr)' },
        { value: 'en' as Intl.LocalesArgument, label: 'English (en)' }
    ];
}
```
