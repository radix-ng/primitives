import { Component, signal } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
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
import { RdxFormRoot, type RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Component({
    selector: 'parity-checkbox-portal',
    imports: [
        RdxCheckboxButtonDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxRootDirective,
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFormRoot,
        RdxPortal
    ],
    template: `
        <form id="external"></form>
        <div #destination data-testid="destination"></div>
        <form id="owner" (onFormSubmit)="save($event)" (reset)="onReset($event)" rdxFormRoot>
            <div [container]="destination" rdxPortal>
                <div rdxFieldRoot name="features" validationMode="onSubmit">
                    <label id="feature-label" rdxFieldLabel>Features</label>
                    <p id="feature-description" rdxFieldDescription>Choose your features.</p>
                    <div [allValues]="all" [defaultValue]="initial" [form]="formId()" rdxCheckboxGroup>
                        <div rdxCheckboxRoot parent>
                            <button rdxCheckboxButton aria-label="All">All</button>
                            <input rdxCheckboxInput />
                        </div>
                        <div rdxFieldItem>
                            <label rdxFieldLabel>Alpha</label>
                            <div rdxCheckboxRoot value="a" required>
                                <button id="feature-a" rdxCheckboxButton>a</button>
                                <input rdxCheckboxInput />
                            </div>
                        </div>
                        <div [disabled]="disableBeta()" rdxFieldItem>
                            <label rdxFieldLabel>Beta</label>
                            <div rdxCheckboxRoot value="b">
                                <button id="feature-b" rdxCheckboxButton>b</button>
                                <input rdxCheckboxInput />
                            </div>
                        </div>
                    </div>
                    <p id="feature-required" rdxFieldError match="valueMissing">Choose Alpha.</p>
                </div>
            </div>
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </form>
        <output data-testid="submissions">{{ submissions() }}</output>
        <output data-testid="submitted">{{ submitted().join(',') }}</output>
        <button (click)="disableBeta.set(!disableBeta())" type="button">Toggle disabled Beta</button>
        <button (click)="formId.set('owner')" type="button">Use owner form</button>
        <button (click)="formId.set('external')" type="button">Use external form</button>
        <button (click)="cancelNext = true" type="button">Cancel next reset</button>
    `
})
export class AngularCheckboxPortal {
    protected readonly all = ['a', 'b'];
    protected readonly initial = ['a'];
    protected readonly formId = signal<string | undefined>(undefined);
    protected readonly disableBeta = signal(false);
    protected readonly submissions = signal(0);
    protected readonly submitted = signal<string[]>([]);
    protected cancelNext = false;

    protected save(event: RdxFormSubmitEvent): void {
        const values = event.values['features'];
        this.submitted.set((Array.isArray(values) ? values : values === undefined ? [] : [values]).map(String));
        this.submissions.update((value) => value + 1);
    }

    protected onReset(event: Event): void {
        if (!this.cancelNext) return;
        this.cancelNext = false;
        event.preventDefault();
    }
}
