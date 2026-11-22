import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxInputDirective, type RdxInputValueChangeEvent } from '@radix-ng/primitives/input';
import { initialDefault, initialValue, installProbe, locked, record, required } from './contract';

installProbe();

@Component({
    selector: 'parity-input',
    imports: [RdxInputDirective, RdxFieldRoot, RdxFieldLabel, RdxFieldDescription, RdxFieldError],
    template: `
        <form id="profile">
            <button type="submit">Submit profile</button>
            <button type="reset">Reset profile</button>
        </form>
        <div [disabled]="disabled()" rdxFieldRoot name="profile-name" validationMode="onBlur">
            <label rdxFieldLabel>Name</label>
            <input
                id="profile-input"
                #editable="rdxInput"
                [attr.data-editable-value]="editable.value()"
                [attr.data-parent-value]="value()"
                [controlledValue]="value()"
                [defaultValue]="defaults()"
                [readonly]="locked"
                [required]="required"
                [type]="required ? 'email' : 'text'"
                (onValueChange)="request($event)"
                rdxInput
                data-test-input
                name="local-name"
                form="profile"
                autocomplete="name"
            />
            <p id="profile-description" rdxFieldDescription>Used for your profile.</p>
            <p id="profile-error" rdxFieldError match="valueMissing">Enter a name.</p>
            <p id="profile-email-error" rdxFieldError match="typeMismatch">Enter an email address.</p>
        </div>
        <button (click)="defaults.set('late seed')" type="button">Change default</button>
        <button (click)="value.set(pending)" type="button">Accept request</button>
        <button (click)="value.set('parent')" type="button">Replace value</button>
        <button (click)="disabled.set(!disabled())" type="button">Toggle disabled</button>
    `
})
class InputFixture {
    protected readonly value = signal(initialValue);
    protected readonly defaults = signal(initialDefault);
    protected readonly disabled = signal(false);
    protected readonly locked = locked;
    protected readonly required = required;
    protected pending?: string;

    protected request(change: RdxInputValueChangeEvent): void {
        record(change.value, change.eventDetails);
        this.pending = change.value;
        if (window.inputParity.acceptEdit) this.value.set(change.value);
    }
}

void bootstrapApplication(InputFixture, { providers: [provideZonelessChangeDetection()] });
