# Select — Typed application wrapper

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

An application-owned component can extend `RdxSelectRoot<Value, Multiple>` and use
`provideRdxSelectRoot(YourSelect)` to rebind the primitive's context, floating-tree and form providers.
It inherits the inputs, cancellable events, CVA and Signal Forms contract; no second value store or
hand-written CVA is needed. Use `[multiple]="true"` or `[multiple]="false"` for precise mode inference.

The [wrapper source](https://github.com/radix-ng/primitives/blob/main/packages/primitives/select/stories/select-typed-control.ts)
owns only its rendering options, placeholder and Tailwind markup. This example uses it with typed
object values in Reactive Forms, Signal Forms and multiple selection, including reset.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import { SelectTypedControl } from './select-typed-control';

export interface SelectCountry {
    code: string;
    name: string;
}

@Component({
    selector: 'select-typed-wrapper',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        SelectTypedControl,
        ReactiveFormsModule,
        FormField,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxNgControlField,
        RdxSignalField
    ],
    template: `
        <form class="flex flex-col gap-6">
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Reactive Forms country</label>
                <example-select
                    [options]="countries"
                    [formControl]="reactiveCountry"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                    name="reactiveCountry"
                    rdxNgControlField
                />
                <output class="text-muted-foreground text-sm" data-testid="reactive-value">
                    {{ reactiveCountry.value?.code ?? 'none' }}
                </output>
            </div>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Signal Forms country</label>
                <example-select
                    [options]="countries"
                    [formField]="profileForm.country"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                    rdxSignalField
                />
                <output class="text-muted-foreground text-sm" data-testid="signal-value">
                    {{ profile().country?.code ?? 'none' }}
                </output>
            </div>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Multiple countries</label>
                <example-select
                    [(value)]="selectedCountries"
                    [options]="countries"
                    [multiple]="true"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                />
                <output class="text-muted-foreground text-sm" data-testid="multiple-value">
                    {{ selectedCodes() }}
                </output>
            </div>
            <button
                class="border-border text-foreground rounded-md border px-3 py-2 text-sm"
                (click)="reset()"
                type="button"
            >
                Reset countries
            </button>
        </form>
    `
})
export class SelectTypedWrapper {
    readonly countries: SelectCountry[] = [
        { code: 'fr', name: 'France' },
        { code: 'de', name: 'Germany' },
        { code: 'jp', name: 'Japan' }
    ];
    readonly countryLabel = (country: SelectCountry) => country.name;
    readonly countryCode = (country: SelectCountry) => country.code;
    readonly sameCountry = (a: SelectCountry, b: SelectCountry) => a.code === b.code;
    readonly reactiveCountry = new FormControl<SelectCountry | null>(this.countries[0]);
    readonly profile = signal<{ country: SelectCountry | null }>({ country: this.countries[0] });
    readonly profileForm = form(this.profile);
    readonly selectedCountries = signal<SelectCountry[] | undefined>([]);
    readonly selectedCodes = () => this.selectedCountries()?.map(this.countryCode).join(', ') || 'none';

    reset(): void {
        this.reactiveCountry.reset(this.countries[0]);
        this.profileForm().reset({ country: this.countries[0] });
        this.selectedCountries.set([]);
    }
}
```

The strict Angular AOT fixtures in `tools/typecheck/select` check both valid consumers and invalid
value, mode, label, event and Signal Forms bindings. Classic CVA bindings retain Angular's runtime
interface; `formControl` does not by itself infer or validate a custom control's generic value type.
Angular DI also does not connect an independently declared Item's generic to its parent Root. The
wrapper's `options: readonly Value[]` ties the collection to the public selection/callback types.
Internal part communication uses `unknown`; no `any` fallback is required. See
[ADR 0028](https://github.com/radix-ng/primitives/blob/main/docs/adr/0028-select-arbitrary-value-contract.md).
