# Select — Native forms and autofill

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The native input serves browser behavior. Select's `ControlValueAccessor` and Signal Forms contract
connect its value to Angular independently of this bridge. Its visible button/popup anatomy needs a
native representation for browser autofill and constraints; direct DOM access does not give the button
those capabilities. When a primitive already has an input representing its form value, the shared
bridge can reuse that control. See
[ADR 0025](https://github.com/radix-ng/primitives/blob/main/docs/adr/0025-separate-angular-forms-from-browser-input-bridge.md).

Select creates a technical native input after hydration for submission, browser autofill and required
validation. Pass `autoComplete` such as `country` / `country-name`. Autofill matches serialized values
or value labels without case sensitivity, then rendered item text. Matching an object keeps its
original reference. Closed options may mount briefly in a hidden probe; the popup does not open or
take focus, and no open-change events are emitted.

The persistent input submits one scalar value. Multiple selections submit repeated entries through
separate hidden inputs, with a nameless input checking the required empty state. Browser autofill is
ignored in multiple, disabled and read-only modes. A canceled or unmatched autofill preserves the
committed value, dirty state and external form errors and restores the native input's value.
An enclosing Field supplies its name, disabled and required state; its name takes precedence over
Root's own `name` when both are provided.

Use `[inputRef]="captureInput"` with `(input: HTMLInputElement | null) => void`, or read
`select.nativeInput()` through `#select="rdxSelectRoot"`. The callback receives the element after
hydration, and `null` on callback replacement or destruction. The signal is `null` on the server,
before hydration and after destruction. Focusing a focusable technical input redirects focus to the
trigger; providing `inputRef` keeps an otherwise unnamed optional input focusable too.

Prefer `nativeInput()` for signal-based Angular access. The callback API adapts Base UI's `inputRef`
name without introducing a separate value store or requiring React-style ref objects.

`required` participates in browser constraint validation; it does not install an additional validation
engine or write Angular validation errors. Angular forms still own their validators and Field state.
Use `ngNativeValidate` on the form when opting into browser validation UI with Angular forms. Native
invalid events mark the control touched, so an Angular required validator can reveal a Field error.
While invalid, the technical input follows the visible trigger's bounds so the browser validation
message stays attached to the control through layout changes, scrolling and resizing.
The example includes an external-form multiple control, native submission and reset.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldError, RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { cn, demoButton } from '../../storybook/styles';
import { SelectTypedControl } from './select-typed-control';

interface Country {
    code: string;
    name: string;
}

@Component({
    selector: 'select-native-forms',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, SelectTypedControl, RdxFieldRoot, RdxFieldLabel, RdxFieldError, RdxNgControlField],
    template: `
        <div class="grid max-w-sm gap-5">
            <form class="grid gap-5" id="native-select-form" (submit)="submit($event)" ngNativeValidate>
                <div class="grid gap-2" name="country" required rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Country</label>
                    <example-select
                        [options]="countries"
                        [formControl]="country"
                        [itemToStringLabel]="label"
                        [itemToStringValue]="serialize"
                        autoComplete="country-name"
                        required
                        rdxNgControlField
                    />
                    <p class="text-destructive text-xs" match="required" rdxFieldError>Choose a country.</p>
                </div>
                <div class="flex gap-2">
                    <button [class]="submitClass" type="submit">Submit</button>
                    <button [class]="resetClass" (click)="submitted.set('Not submitted')" type="reset">Reset</button>
                </div>
            </form>
            <div class="grid gap-2" name="destinations" required rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Destinations</label>
                <example-select
                    [options]="countries"
                    [formControl]="destinations"
                    [multiple]="true"
                    [itemToStringLabel]="label"
                    [itemToStringValue]="serialize"
                    form="native-select-form"
                    placeholder="Choose destinations"
                    required
                    rdxNgControlField
                />
                <p class="text-destructive text-xs" match="required" rdxFieldError>Choose at least one destination.</p>
            </div>
            <output class="text-muted-foreground font-mono text-xs" data-testid="country-value">
                {{ country.value?.code ?? 'none' }}
            </output>
            <output class="text-muted-foreground font-mono text-xs" data-testid="submission">{{ submitted() }}</output>
        </div>
    `
})
export class SelectNativeForms {
    readonly countries: Country[] = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'FR', name: 'France' }
    ];
    readonly country = new FormControl<Country | null>(null, Validators.required);
    readonly destinations = new FormControl<Country[]>([], { nonNullable: true, validators: Validators.required });
    readonly submitted = signal('Not submitted');
    readonly label = (country: Country) => country.name;
    readonly serialize = (country: Country) => country.code;
    protected readonly submitClass = cn(demoButton.base, demoButton.primary, demoButton.size.md);
    protected readonly resetClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);

    submit(event: Event): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.submitted.set(`country=${data.get('country')}; destinations=${data.getAll('destinations').join(',')}`);
    }
}
```
