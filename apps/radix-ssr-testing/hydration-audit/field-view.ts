import { Component, signal } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxFieldValidity
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';

@Component({
    selector: 'audit-field-view',
    imports: [
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFieldValidity,
        RdxFormRoot
    ],
    template: `
        <span id="audit-field-name">Account name</span>
        <p id="audit-field-help">Shown on your profile.</p>
        <form [errors]="errors" rdxFormRoot>
            <div rdxFieldRoot name="account" data-field-node="root">
                @if (showLabel()) {
                    <label rdxFieldLabel data-field-node="label">Account</label>
                }
                <input
                    rdxFieldControl
                    aria-labelledby="audit-field-name"
                    aria-describedby="audit-field-help"
                    data-field-node="control"
                />
                <p rdxFieldDescription data-field-node="description">Use at least three characters.</p>
                <p rdxFieldError data-field-node="error">This name is taken.</p>
                <ng-container #validity="rdxFieldValidity" rdxFieldValidity>
                    <output data-field-node="validity">{{ validity.state().messages.join(' ') }}</output>
                </ng-container>
            </div>
        </form>
        <button (click)="showLabel.set(!showLabel())" type="button">Toggle account label</button>
    `
})
export class FieldAuditView {
    protected readonly errors = { account: 'This name is taken.' };
    protected readonly showLabel = signal(true);
}
