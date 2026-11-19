import { Component, signal } from '@angular/core';
import { RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, type RdxFormErrors } from '@radix-ng/primitives/form';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';
import { config, installProbe } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [
        RdxFieldError,
        RdxFieldRoot,
        RdxFormRoot,
        RdxPortal,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        <form id="external"></form>
        <div #outside data-testid="outside"></div>
        <form id="owner" #owner [errors]="errors()" rdxFormRoot>
            <div [container]="portaled ? outside : owner" data-testid="field" rdxPortal rdxFieldRoot name="density">
                <div
                    [controlledValue]="parentOwned ? parentValue() : undefined"
                    [form]="formId()"
                    (onValueChange)="change($event.value)"
                    rdxRadioRoot
                    defaultValue="a"
                    aria-label="Density"
                >
                    <span data-testid="alpha" rdxRadioItem value="a">
                        Alpha
                        <input rdxRadioItemInput />
                    </span>
                    <span data-testid="beta" rdxRadioItem value="b">
                        Beta
                        <input rdxRadioItemInput />
                    </span>
                </div>
                <p #error="rdxFieldError" data-testid="reset-error" rdxFieldError>{{ error.messages().join(' ') }}</p>
            </div>
        </form>
        <span data-testid="requests">{{ requests() }}</span>
        <button (click)="errors.set({ density: 'Density is unavailable' })" type="button">Set server error</button>
        <button (click)="formId.set('external')" type="button">Use external form</button>
        <button (click)="formId.set('missing')" type="button">Use missing form</button>
    `
})
export class AngularRadioReset {
    protected readonly parentOwned = config().reset === 'parent-owned';
    protected readonly portaled = config().reset === 'portal';
    protected readonly parentValue = signal('a');
    protected readonly formId = signal<string | undefined>(undefined);
    protected readonly requests = signal(0);
    protected readonly errors = signal<RdxFormErrors>({});

    constructor() {
        installProbe();
    }

    protected change(value: string): void {
        if (this.parentOwned) this.parentValue.set(value);
        this.requests.update((count) => count + 1);
    }
}
