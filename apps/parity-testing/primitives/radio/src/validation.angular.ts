import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RdxFieldError, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { config, installProbe, radioValidationMessage } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldError,
        RdxNgControlField,
        RdxFormRoot,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective
    ],
    template: `
        <form (onFormSubmit)="submits.update(increment)" rdxFormRoot>
            <div [validationMode]="mode" data-testid="field" rdxFieldRoot name="density">
                <div [formControl]="choice" rdxNgControlField rdxRadioRoot aria-label="Density">
                    <span rdxRadioItem value="a">
                        Alpha
                        <input rdxRadioItemInput />
                    </span>
                    <span rdxRadioItem value="b">
                        Beta
                        <span data-testid="indicator" keepMounted rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span rdxRadioItem value="c">
                        Gamma
                        <input rdxRadioItemInput />
                    </span>
                </div>
                <p id="density-error" #error="rdxFieldError" data-testid="error" rdxFieldError>
                    {{ error.messages().join(' ') }}
                </p>
            </div>
            <button type="submit">Submit</button>
            <output data-testid="submits">{{ submits() }}</output>
        </form>
        <button type="button">Outside</button>
        <button (click)="choice.setValue('c')" type="button">Write Gamma</button>
        <button (click)="choice.setValue('a')" type="button">Write Alpha</button>
    `
})
export class AngularRadioValidation {
    protected readonly mode = config().validation;
    protected readonly choice = new FormControl('a', {
        nonNullable: true,
        validators: (control) => {
            const message = radioValidationMessage(control.value);
            return message ? { unavailable: { message } } : null;
        }
    });
    protected readonly submits = signal(0);
    protected readonly increment = (count: number) => count + 1;

    constructor() {
        installProbe();
    }
}
