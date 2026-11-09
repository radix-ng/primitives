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
