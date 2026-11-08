# Select — Labels and control ids

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Place `rdxSelectLabel` inside Root to name the trigger automatically. It supports both a native
`<label>` and ordinary markup such as `<div>`. Clicking label text focuses the trigger without
opening the popup; nested interactive elements keep their own behavior.

Set `id` on Root to identify the trigger. Root forwards it without duplicating it on a separate
root element, and `rdxSelectLabel` derives its id as `<root-id>-label`. Customize the label id through
Root, not a separate `id` on Label. An explicit Trigger `id` overrides the forwarded control id;
removing an override restores its fallback. Container roots (`ng-container`) and Root/Trigger on
the same button are supported.

`rdxFieldLabel` remains the native label for a surrounding Field. The most recently registered live
label in a Field supplies its accessible name; removing it restores the preceding label. Explicit
`aria-labelledby` on Trigger takes precedence. Select.Label also reflects Field's validation and
interaction attributes.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxAutocompleteInput, RdxAutocompleteLabel, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import { RdxComboboxInput, RdxComboboxLabel, RdxComboboxRoot } from '@radix-ng/primitives/combobox';
import { RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { demoInput, demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';
import { SelectTypedControl } from './select-typed-control';

@Component({
    selector: 'select-labels',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        _importsSelect,
        LucideCheck,
        LucideChevronDown,
        SelectTypedControl,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxComboboxRoot,
        RdxComboboxLabel,
        RdxComboboxInput,
        RdxAutocompleteRoot,
        RdxAutocompleteLabel,
        RdxAutocompleteInput
    ],
    template: `
        <div class="grid w-64 gap-6">
            <div class="grid gap-2" id="labelled-country" rdxSelectRoot>
                <div class="text-foreground flex items-center justify-between text-sm font-medium" rdxSelectLabel>
                    Country
                    <button class="text-muted-foreground text-xs underline" (click)="help.set(!help())" type="button">
                        Help
                    </button>
                </div>
                @if (help()) {
                    <p class="text-muted-foreground text-xs">Choose the country you live in.</p>
                }
                <button class="w-full" [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a country">
                        {{ display.slotText() }}
                    </span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="4" rdxSelectPositioner>
                    <div [class]="s.popup" rdxSelectPopup>
                        <div [class]="s.list" rdxSelectList>
                            @for (country of countries; track country) {
                                <div [class]="s.item" [value]="country" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator aria-hidden="true">
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ country }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Billing country</label>
                <example-select id="billing-country" [options]="countries" />
            </div>
            <div class="grid gap-2" rdxComboboxRoot>
                <div class="text-foreground text-sm font-medium" rdxComboboxLabel>City</div>
                <input [class]="inputClass" rdxComboboxInput placeholder="Search cities" />
            </div>
            <div class="grid gap-2" rdxAutocompleteRoot>
                <div class="text-foreground text-sm font-medium" rdxAutocompleteLabel>Search tags</div>
                <input [class]="inputClass" rdxAutocompleteInput placeholder="Type a tag" />
            </div>
        </div>
    `
})
export class SelectLabels {
    protected readonly s = demoSelect;

    readonly help = signal(false);
    readonly countries = ['France', 'Japan', 'United Kingdom'];
    protected readonly inputClass = demoInput;
}
```

Label registration and interaction behavior live in `core`, shared by Field, Select and Combobox;
Autocomplete inherits the Combobox label through directive composition. The example retains the
existing Angular support for labeling an outside Combobox/Autocomplete input. Current upstream's
Combobox.Label targets a trigger; sharing this helper does not establish complete Combobox part parity.
