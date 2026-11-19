import { Component, signal } from '@angular/core';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';
import { collectionOptions, installProbe, type CollectionValue } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <form id="primary">
            <div
                [controlledValue]="selected()"
                (onValueChange)="select($event.value)"
                rdxRadioRoot
                name="choice"
                aria-label="Primary"
            >
                @for (option of options(); track option.id) {
                    <span [value]="option.value" [attr.data-testid]="option.id" rdxRadioItem>
                        {{ option.id }}
                        @if (option.id !== 'array') {
                            <input rdxRadioItemInput />
                        }
                    </span>
                }
            </div>
            <output data-testid="requests">{{ requests() }}</output>
        </form>
        <form id="secondary">
            <div rdxRadioRoot defaultValue="1" name="choice" aria-label="Secondary">
                <span rdxRadioItem value="1">
                    Secondary item
                    <input rdxRadioItemInput />
                </span>
            </div>
        </form>
        <button (click)="options.update(reverse)" type="button">Reverse options</button>
        <button (click)="options.update(changeNumber)" type="button">Change number value</button>
    `
})
export class AngularRadioCollection {
    protected readonly options = signal(collectionOptions);
    protected readonly selected = signal<CollectionValue | null>('1');
    protected readonly requests = signal(0);
    protected readonly reverse = (options: typeof collectionOptions) => [...options].reverse();
    protected readonly changeNumber = (options: typeof collectionOptions) =>
        options.map((option) => (option.id === 'number' ? { ...option, value: option.value === 1 ? 2 : 1 } : option));

    constructor() {
        installProbe();
    }

    protected select(value: CollectionValue): void {
        this.selected.set(value);
        this.requests.update((count) => count + 1);
    }
}
