import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxAutocompleteClear,
    RdxAutocompleteInput,
    RdxAutocompleteItem,
    RdxAutocompleteList,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot,
    type AutocompleteValueChangeDetails
} from '@radix-ng/primitives/autocomplete';
import type { RdxComboboxOpenChange } from '@radix-ng/primitives/combobox';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe } from './contract';
import { AngularNavigation } from './navigation.angular';

@Component({
    selector: 'parity-autocomplete-parts',
    imports: [
        RdxAutocompleteInput,
        RdxAutocompleteClear,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteList,
        RdxAutocompleteItem
    ],
    template: `
        <div [class]="s.control">
            <input [class]="s.input" data-testid="input" aria-label="Query" rdxAutocompleteInput />
            <button type="button" data-testid="clear" rdxAutocompleteClear>Clear</button>
        </div>
        <div *rdxAutocompletePortal rdxAutocompletePositioner>
            <div [class]="s.popup" data-testid="popup" rdxAutocompletePopup>
                <div aria-label="Suggestions" rdxAutocompleteList>
                    <div [class]="s.item" value="Alpha" rdxAutocompleteItem>Alpha</div>
                    <div [class]="s.item" value="Beta" rdxAutocompleteItem>Beta</div>
                </div>
            </div>
        </div>
    `
})
class Parts {
    readonly s = classes;
}

@Component({
    selector: 'parity-autocomplete',
    imports: [RdxAutocompleteRoot, Parts],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <button type="button" data-testid="before">Before</button>
        <form>
            @if (present()) {
                @if (hasValue && hasOpen) {
                    <div
                        [value]="value()"
                        [open]="open()"
                        [defaultValue]="defaultValue()"
                        [defaultOpen]="defaultOpen()"
                        [items]="items"
                        (valueChange)="acceptValue($event)"
                        (openChange)="acceptOpen($event)"
                        (onValueChange)="valueRequest($event)"
                        (onOpenChange)="openRequest($event)"
                        rdxAutocompleteRoot
                        mode="none"
                        name="query"
                    >
                        <parity-autocomplete-parts />
                    </div>
                } @else if (hasValue) {
                    <div
                        [value]="value()"
                        [defaultValue]="defaultValue()"
                        [defaultOpen]="defaultOpen()"
                        [items]="items"
                        (valueChange)="acceptValue($event)"
                        (openChange)="acceptOpen($event)"
                        (onValueChange)="valueRequest($event)"
                        (onOpenChange)="openRequest($event)"
                        rdxAutocompleteRoot
                        mode="none"
                        name="query"
                    >
                        <parity-autocomplete-parts />
                    </div>
                } @else if (hasOpen) {
                    <div
                        [open]="open()"
                        [defaultValue]="defaultValue()"
                        [defaultOpen]="defaultOpen()"
                        [items]="items"
                        (valueChange)="acceptValue($event)"
                        (openChange)="acceptOpen($event)"
                        (onValueChange)="valueRequest($event)"
                        (onOpenChange)="openRequest($event)"
                        rdxAutocompleteRoot
                        mode="none"
                        name="query"
                    >
                        <parity-autocomplete-parts />
                    </div>
                } @else {
                    <div
                        [defaultValue]="defaultValue()"
                        [defaultOpen]="defaultOpen()"
                        [items]="items"
                        (valueChange)="acceptValue($event)"
                        (openChange)="acceptOpen($event)"
                        (onValueChange)="valueRequest($event)"
                        (onOpenChange)="openRequest($event)"
                        rdxAutocompleteRoot
                        mode="none"
                        name="query"
                    >
                        <parity-autocomplete-parts />
                    </div>
                }
            }
        </form>
        <output data-testid="default-value">{{ defaultValue() ?? 'omitted' }}</output>
        <output data-testid="default-open">{{ defaultOpen() }}</output>
    `
})
class AngularAutocomplete {
    readonly items = ['Alpha', 'Beta'];
    readonly config = config();
    readonly p = this.config.settings;
    readonly hasValue = Object.hasOwn(this.p, 'value');
    readonly hasOpen = Object.hasOwn(this.p, 'open');
    readonly value = signal(this.p.value ?? '');
    readonly open = signal(this.p.open ?? false);
    readonly defaultValue = signal(this.p.defaultValue);
    readonly defaultOpen = signal(this.p.defaultOpen ?? false);
    readonly present = signal(true);
    readonly trace = installProbe();
    command(event: KeyboardEvent) {
        if (event.key === 'F2') {
            this.defaultValue.set('Later');
            this.defaultOpen.update((value) => !value);
        }
        if (event.key === 'F3') {
            this.value.set('External');
            this.open.set(true);
        }
        if (event.key === 'F4') {
            this.value.set('');
            this.open.set(false);
        }
        if (event.key === 'F5') this.present.set(false);
        if (event.key === 'F6') this.present.set(true);
    }
    acceptValue(value: string) {
        this.trace.probe.modelOutputs.push({ kind: 'value', value });
        if (this.hasValue) this.value.set(value);
    }
    acceptOpen(value: boolean) {
        this.trace.probe.modelOutputs.push({ kind: 'open', value });
        if (this.hasOpen) this.open.set(value);
    }
    valueRequest({ value, reason, eventDetails: d }: AutocompleteValueChangeDetails) {
        this.trace.change('value', value, reason, d.isCanceled(), d.event, d.trigger);
    }
    openRequest({ open, reason, eventDetails: d }: RdxComboboxOpenChange) {
        this.trace.change('open', open, reason, d.isCanceled(), d.event, d.trigger);
    }
}
void bootstrapApplication(config().settings.navigation ? AngularNavigation : AngularAutocomplete);
