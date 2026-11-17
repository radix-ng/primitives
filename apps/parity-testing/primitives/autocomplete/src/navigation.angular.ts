import { Component, signal } from '@angular/core';
import { _importsAutocomplete, type AutocompleteValueChangeDetails } from '@radix-ng/primitives/autocomplete';
import type { ComboboxItemHighlightedDetails, RdxComboboxOpenChange } from '@radix-ng/primitives/combobox';
import { classes, config, installProbe } from './contract';
import { installKeyProbe, isGrid, navigationItems } from './navigation';
@Component({
    selector: 'parity-autocomplete',
    imports: [_importsAutocomplete],
    template: `
        <form [attr.dir]="p.dir ?? 'ltr'" (submit)="$event.preventDefault()">
            <div
                [(value)]="value"
                [(open)]="open"
                [items]="items"
                [grid]="grid"
                [dir]="p.dir ?? 'ltr'"
                [virtualized]="!!p.virtualized"
                [autoHighlight]="p.autoHighlight"
                [loopFocus]="p.loop"
                (onValueChange)="change($event)"
                (onOpenChange)="openChange($event)"
                (onItemHighlighted)="highlight($event)"
                rdxAutocompleteRoot
                mode="none"
                name="query"
            >
                <input [class]="s.input" data-testid="input" aria-label="Query" rdxAutocompleteInput />
                <div *rdxAutocompletePortal rdxAutocompletePositioner>
                    <div [class]="s.popup" data-testid="popup" rdxAutocompletePopup>
                        <div rdxAutocompleteList aria-label="Suggestions">
                            @if (grid) {
                                @for (row of rows; track $index; let r = $index) {
                                    <div class="flex gap-2" rdxAutocompleteRow>
                                        @for (item of row; track item; let c = $index) {
                                            <div
                                                [class]="s.item"
                                                [value]="item"
                                                [attr.data-testid]="'item-' + (r * 3 + c)"
                                                rdxAutocompleteItem
                                            >
                                                {{ item }}
                                            </div>
                                        }
                                    </div>
                                }
                            } @else {
                                @for (item of items; track item; let i = $index) {
                                    <div
                                        [class]="s.item"
                                        [value]="item"
                                        [index]="p.virtualized ? i : undefined"
                                        [disabled]="i === p.disabledAt"
                                        [attr.data-testid]="'item-' + i"
                                        rdxAutocompleteItem
                                    >
                                        {{ item }}
                                    </div>
                                }
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
export class AngularNavigation {
    readonly p = config().settings.navigation!;
    readonly s = classes;
    readonly grid = isGrid(this.p);
    readonly items = navigationItems(this.p);
    readonly rows = [this.items.slice(0, 3), this.items.slice(3)];
    readonly value = signal(this.p.value ?? '');
    readonly open = signal(this.p.initialOpen ?? false);
    readonly trace = installProbe();
    constructor() {
        installKeyProbe();
    }
    highlight({ value, index, reason }: ComboboxItemHighlightedDetails) {
        this.trace.probe.highlights.push({ value, index, reason });
    }
    change({ value, reason, eventDetails: d }: AutocompleteValueChangeDetails) {
        this.trace.change('value', value, reason, d.isCanceled(), d.event, d.trigger);
    }
    openChange({ open, reason, eventDetails: d }: RdxComboboxOpenChange) {
        this.trace.change('open', open, reason, d.isCanceled(), d.event, d.trigger);
    }
}
