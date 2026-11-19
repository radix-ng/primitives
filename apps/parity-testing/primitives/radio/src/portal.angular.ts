import { Component, signal } from '@angular/core';
import { RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, type RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';
import { config, installProbe } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [
        RdxFieldRoot,
        RdxFieldError,
        RdxFormRoot,
        RdxPortal,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        <form id="external"></form>
        <div #outside data-testid="outside"></div>
        <form id="owner" #owner (onFormSubmit)="save($event)" rdxFormRoot>
            <div [container]="full ? outside : owner" rdxPortal>
                <div rdxFieldRoot name="density">
                    <div
                        #group
                        [controlledValue]="value()"
                        [required]="full"
                        [form]="formId()"
                        (onValueChange)="value.set($event.value)"
                        rdxRadioRoot
                        aria-label="Density"
                    >
                        <span rdxRadioItem value="a">
                            Alpha
                            <input rdxRadioItemInput />
                        </span>
                        @if (showBeta()) {
                            <span
                                [container]="full ? group : outside"
                                [disabled]="disabledBeta()"
                                rdxPortal
                                rdxRadioItem
                                value="b"
                            >
                                Beta
                                <input rdxRadioItemInput />
                            </span>
                        }
                    </div>
                    <p id="density-missing" rdxFieldError match="valueMissing">Choose a density</p>
                </div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <span data-testid="submits">{{ submits() }}</span>
        <span data-testid="submitted">{{ submitted() ?? 'empty' }}</span>
        <button (click)="showBeta.set(!showBeta())" type="button">Toggle Beta</button>
        <button (click)="disabledBeta.set(!disabledBeta())" type="button">Toggle disabled Beta</button>
        <button (click)="formId.set('owner')" type="button">Use owner form</button>
        <button (click)="formId.set('external')" type="button">Use external form</button>
        <button (click)="formId.set('missing')" type="button">Use missing form</button>
        <button (click)="formId.set(undefined)" type="button">Clear form owner</button>
    `
})
export class AngularRadioPortal {
    protected readonly full = config().portal === 'field';
    protected readonly value = signal<string | null>(null);
    protected readonly formId = signal<string | undefined>(undefined);
    protected readonly showBeta = signal(true);
    protected readonly disabledBeta = signal(false);
    protected readonly submits = signal(0);
    protected readonly submitted = signal<RdxFormSubmitEvent['values'][string] | undefined>(undefined);

    constructor() {
        installProbe();
    }

    protected save({ values }: RdxFormSubmitEvent): void {
        this.submitted.set(values['density']);
        this.submits.update((count) => count + 1);
    }
}
