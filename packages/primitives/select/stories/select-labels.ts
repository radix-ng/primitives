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
