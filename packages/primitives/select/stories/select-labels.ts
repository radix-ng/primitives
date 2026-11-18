import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxAutocompleteInput, RdxAutocompleteLabel, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import { RdxComboboxInput, RdxComboboxLabel, RdxComboboxRoot } from '@radix-ng/primitives/combobox';
import { RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { SelectTypedControl } from './select-typed-control';

@Component({
    selector: 'select-labels',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
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
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a country">
                        {{ display.slotText() }}
                    </span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" rdxSelectPositioner>
                    <div
                        class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (country of countries; track country) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="country"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                        aria-hidden="true"
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
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
                <input class="demo-input h-9 w-full px-3" rdxComboboxInput placeholder="Search cities" />
            </div>
            <div class="grid gap-2" rdxAutocompleteRoot>
                <div class="text-foreground text-sm font-medium" rdxAutocompleteLabel>Search tags</div>
                <input class="demo-input h-9 w-full px-3" rdxAutocompleteInput placeholder="Type a tag" />
            </div>
        </div>
    `
})
export class SelectLabels {
    readonly help = signal(false);
    readonly countries = ['France', 'Japan', 'United Kingdom'];
}
