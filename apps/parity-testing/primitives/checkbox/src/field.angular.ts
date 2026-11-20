import { Component, signal } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldItem,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { scenario } from './contract';

@Component({
    selector: 'parity-checkbox-field',
    imports: [
        RdxCheckboxButtonDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxRootDirective,
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFormRoot
    ],
    template: `
        <form (onFormSubmit)="submissions.update(increment)" rdxFormRoot>
            @if (grouped) {
                <div rdxFieldRoot validationMode="onBlur" name="features" data-testid="field">
                    <label id="group-label" rdxFieldLabel>Features</label>
                    <p id="group-description" rdxFieldDescription>Choose your features.</p>
                    @if (required) {
                        <p id="features-error" rdxFieldError>Select option a.</p>
                    }
                    <div [allValues]="values" [defaultValue]="required ? requiredValues : undefined" rdxCheckboxGroup>
                        <div rdxCheckboxRoot parent>
                            <button id="all" rdxCheckboxButton aria-label="All">All</button>
                            <input rdxCheckboxInput />
                        </div>
                        @for (value of values; track value) {
                            <div [disabled]="value === 'a' && disableFirst()" rdxFieldItem>
                                <label [id]="'label-' + value" rdxFieldLabel>Option {{ value }}</label>
                                <p [id]="'description-' + value" rdxFieldDescription>About {{ value }}</p>
                                <div
                                    [value]="value"
                                    [required]="required && value === 'a'"
                                    rdxCheckboxRoot
                                    name="ignored"
                                >
                                    <button
                                        [id]="'item-' + value"
                                        (keydown.f2)="disableFirst.set(true)"
                                        rdxCheckboxButton
                                    >
                                        {{ value }}
                                    </button>
                                    <input rdxCheckboxInput />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            } @else {
                <div rdxFieldRoot validationMode="onBlur" name="terms" data-testid="field">
                    <label id="terms-label" rdxFieldLabel>Terms</label>
                    <p id="terms-description" rdxFieldDescription>Terms and conditions.</p>
                    @if (required) {
                        <p id="terms-error" rdxFieldError>Accept the terms.</p>
                    }
                    <span id="extra-description">Additional details.</span>
                    <div [required]="required" [defaultChecked]="required" rdxCheckboxRoot name="ignored" value="yes">
                        <button id="terms" rdxCheckboxButton aria-describedby="extra-description">
                            <span
                                *rdxCheckboxIndicatorPresence="{ keepMounted: true }"
                                rdxCheckboxIndicator
                                aria-hidden="true"
                                data-testid="indicator"
                            >
                                ✓
                            </span>
                        </button>
                        <input rdxCheckboxInput />
                    </div>
                </div>
            }
            <button type="button">Outside</button>
            @if (required) {
                <button type="submit">Submit</button>
                <output data-testid="submissions">{{ submissions() }}</output>
            }
        </form>
    `
})
export class AngularCheckboxField {
    protected readonly grouped = scenario.startsWith('field-group');
    protected readonly required = scenario.endsWith('-required');
    protected readonly values = ['a', 'b'];
    protected readonly requiredValues = ['a'];
    protected readonly disableFirst = signal(false);
    protected readonly submissions = signal(0);
    protected readonly increment = (value: number) => value + 1;
}
