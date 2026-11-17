import { Component, signal } from '@angular/core';
import { _importsAutocomplete, type AutocompleteValueChangeDetails } from '@radix-ng/primitives/autocomplete';
import type { RdxComboboxOpenChange } from '@radix-ng/primitives/combobox';
import { classes, config, installProbe } from './contract';
import { installKeyProbe } from './navigation';
import { valueItems } from './value';

@Component({
    selector: 'parity-autocomplete',
    imports: [_importsAutocomplete],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <form (submit)="$event.preventDefault()">
            @if (p.kind === 'defaults') {
                <div
                    #root="rdxAutocompleteRoot"
                    [items]="items"
                    [defaultValue]="p.value"
                    (onValueChange)="change($event)"
                    (onOpenChange)="openChange($event)"
                    rdxAutocompleteRoot
                    name="query"
                >
                    <input [class]="s.input" data-testid="input" aria-label="Query" rdxAutocompleteInput />
                    <span #display="rdxAutocompleteValue" rdxAutocompleteValue data-testid="display">
                        {{ display.slotText() }}
                    </span>
                    <div *rdxAutocompletePortal rdxAutocompletePositioner>
                        <div [class]="s.popup" data-testid="popup" rdxAutocompletePopup>
                            <div rdxAutocompleteList aria-label="Suggestions">
                                @for (item of root.filteredItems(); track item; let i = $index) {
                                    <div
                                        [value]="item"
                                        [index]="p.virtualized ? i : undefined"
                                        [class]="s.item"
                                        [attr.data-testid]="'value-item-' + itemIndex(item)"
                                        rdxAutocompleteItem
                                    >
                                        {{ item }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            } @else if (p.controlled) {
                <div
                    #root="rdxAutocompleteRoot"
                    [(value)]="value"
                    [(open)]="open"
                    [items]="items"
                    [mode]="mode()"
                    [autoHighlight]="p.autoHighlight ?? false"
                    [virtualized]="!!p.virtualized"
                    (onValueChange)="change($event)"
                    (onOpenChange)="openChange($event)"
                    rdxAutocompleteRoot
                    name="query"
                >
                    <input [class]="s.input" data-testid="input" aria-label="Query" rdxAutocompleteInput />
                    <span #display="rdxAutocompleteValue" rdxAutocompleteValue data-testid="display">
                        {{ display.slotText() }}
                    </span>
                    <div *rdxAutocompletePortal rdxAutocompletePositioner>
                        <div [class]="s.popup" data-testid="popup" rdxAutocompletePopup>
                            <div rdxAutocompleteList aria-label="Suggestions">
                                @for (item of root.filteredItems(); track item; let i = $index) {
                                    <div
                                        [value]="item"
                                        [index]="p.virtualized ? i : undefined"
                                        [class]="s.item"
                                        [attr.data-testid]="'value-item-' + itemIndex(item)"
                                        rdxAutocompleteItem
                                    >
                                        {{ item }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            } @else {
                <div
                    #root="rdxAutocompleteRoot"
                    [(open)]="open"
                    [defaultValue]="p.value ?? ''"
                    [items]="items"
                    [mode]="mode()"
                    [autoHighlight]="p.autoHighlight ?? false"
                    [virtualized]="!!p.virtualized"
                    (onValueChange)="change($event)"
                    (onOpenChange)="openChange($event)"
                    rdxAutocompleteRoot
                    name="query"
                >
                    <input [class]="s.input" data-testid="input" aria-label="Query" rdxAutocompleteInput />
                    <span #display="rdxAutocompleteValue" rdxAutocompleteValue data-testid="display">
                        {{ display.slotText() }}
                    </span>
                    <div *rdxAutocompletePortal rdxAutocompletePositioner>
                        <div [class]="s.popup" data-testid="popup" rdxAutocompletePopup>
                            <div rdxAutocompleteList aria-label="Suggestions">
                                @for (item of root.filteredItems(); track item; let i = $index) {
                                    <div
                                        [value]="item"
                                        [index]="p.virtualized ? i : undefined"
                                        [class]="s.item"
                                        [attr.data-testid]="'value-item-' + itemIndex(item)"
                                        rdxAutocompleteItem
                                    >
                                        {{ item }}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
            <output data-testid="committed">{{ value() }}</output>
            <button type="submit">Submit</button>
        </form>
    `
})
export class AngularValueState {
    readonly p = config().settings.valueState!;
    readonly items = valueItems;
    readonly s = classes;
    itemIndex(item: unknown): number {
        return valueItems.indexOf(String(item));
    }
    readonly value = signal(this.p.value ?? '');
    readonly open = signal(true);
    readonly mode = signal(this.p.mode ?? 'list');
    readonly trace = installProbe();
    constructor() {
        installKeyProbe();
    }
    command(event: KeyboardEvent): void {
        if (['F2', 'F3', 'F4', 'F5'].includes(event.key)) event.preventDefault();
        if (event.key === 'F2' && this.p.controlled) this.value.set('Gamma');
        if (event.key === 'F3' && this.p.controlled) this.value.set(' Al ');
        if (event.key === 'F4' && this.p.controlled) this.value.set('');
        if (event.key === 'F5') this.mode.update((mode) => (mode === 'list' ? (this.p.mode ?? 'list') : 'list'));
    }
    change({ value, reason, eventDetails: d }: AutocompleteValueChangeDetails): void {
        this.trace.change('value', value, reason, d.isCanceled(), d.event, d.trigger);
        if (!d.isCanceled()) this.value.set(value);
    }
    openChange({ open, reason, eventDetails: d }: RdxComboboxOpenChange): void {
        this.trace.change('open', open, reason, d.isCanceled(), d.event, d.trigger);
    }
}
