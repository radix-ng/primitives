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
