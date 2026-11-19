import { Component, signal } from '@angular/core';
import { RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { config, installProbe } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [
        RdxFieldRoot,
        RdxFieldError,
        RdxFormRoot,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective
    ],
    template: `
        <form id="external"></form>
        <form (onFormSubmit)="submits.update(increment)" data-testid="owner" rdxFormRoot>
            <fieldset [disabled]="fieldsetDisabled()">
                <div data-testid="field" rdxFieldRoot name="density" validationMode="onSubmit">
                    <div
                        [controlledValue]="value()"
                        [form]="external() ? 'external' : undefined"
                        (onValueChange)="value.set($event.value)"
                        rdxRadioRoot
                        required
                        aria-label="Density"
                    >
                        @if (mounted()) {
                            <span [disabled]="disabledAlpha" rdxRadioItem value="a">
                                Alpha
                                <input rdxRadioItemInput />
                            </span>
                            <span rdxRadioItem value="b">
                                Beta
                                <span data-testid="indicator" keepMounted rdxRadioIndicator></span>
                                <input rdxRadioItemInput />
                            </span>
                        }
                    </div>
                    <p id="density-missing" data-testid="missing" rdxFieldError match="valueMissing">
                        Choose a density
                    </p>
                </div>
            </fieldset>
            <button type="submit">Submit</button>
            <output data-testid="submits">{{ submits() }}</output>
        </form>
        <button (click)="mounted.set(!mounted())" type="button">Toggle items</button>
        <button (click)="fieldsetDisabled.set(!fieldsetDisabled())" type="button">Toggle fieldset</button>
        <button (click)="external.set(!external())" type="button">Toggle form owner</button>
    `
})
export class AngularRadioConstraints {
    protected readonly disabledAlpha = config().constraints === 'disabled-selection';
    protected readonly value = signal<string | null>(this.disabledAlpha ? 'a' : null);
    protected readonly submits = signal(0);
    protected readonly increment = (count: number) => count + 1;
    protected readonly mounted = signal(true);
    protected readonly fieldsetDisabled = signal(false);
    protected readonly external = signal(false);

    constructor() {
        installProbe();
    }
}
