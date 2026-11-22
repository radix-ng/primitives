import { Component, signal } from '@angular/core';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSwitchRoot, RdxSwitchThumb, type RdxSwitchCheckedChangeEvent } from '@radix-ng/primitives/switch';
import { record, scenario } from './contract';

@Component({
    selector: 'parity-switch-field',
    imports: [
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFormRoot,
        RdxSwitchRoot,
        RdxSwitchThumb
    ],
    template: `
        <form
            id="preferences"
            [errors]="errors"
            (onFormSubmit)="submissions.update(increment)"
            (keydown.f2)="disabled.set(true)"
            (keydown.f3)="visible.set(false)"
            rdxFormRoot
        >
            <div
                [validationMode]="required ? 'onSubmit' : 'onBlur'"
                [disabled]="disabled()"
                rdxFieldRoot
                name="alerts"
                data-testid="field"
            >
                <label id="field-label" rdxFieldLabel>Alerts</label>
                <p id="field-description" rdxFieldDescription>Sends email updates.</p>
                <p id="additional-description">Account settings.</p>
                <span id="external-label">Notification preference</span>
                @if (visible()) {
                    <button
                        [id]="controlId()"
                        [aria-label]="ariaLabel()"
                        [aria-labelledby]="ariaLabelledBy()"
                        [controlledChecked]="checked()"
                        [required]="required"
                        (onCheckedChange)="request($event)"
                        name="fallback"
                        value="yes"
                        rdxSwitchRoot
                        aria-describedby="additional-description field-description"
                    >
                        <span rdxSwitchThumb data-testid="thumb"></span>
                    </button>
                }
                @if (required) {
                    <p id="field-error" rdxFieldError match="valueMissing">Enable alerts.</p>
                } @else if (errors) {
                    <p id="field-error" #error="rdxFieldError" rdxFieldError>{{ error.messages().join(' ') }}</p>
                }
            </div>
            <button type="submit">Save</button>
            <output data-testid="submissions">{{ submissions() }}</output>
        </form>
        <button type="button">Outside</button>
        <button (click)="disabled.set(!disabled())" type="button">Toggle Field disabled</button>
        <button (click)="setExplicitName()" type="button">Set explicit name</button>
        <button (click)="ariaLabelledBy.set('external-label')" type="button">Set label reference</button>
        <button (click)="apply()" type="button">Apply request</button>
    `
})
export class AngularSwitchField {
    protected readonly required = scenario === 'field-required';
    protected readonly errors = scenario === 'field-errors' ? { alerts: ['Use a verified email.'] } : undefined;
    protected readonly checked = signal(this.errors ? false : undefined);
    protected readonly disabled = signal(false);
    protected readonly visible = signal(true);
    protected readonly ariaLabel = signal<string | undefined>(undefined);
    protected readonly ariaLabelledBy = signal<string | undefined>(undefined);
    protected readonly controlId = signal('alerts');
    protected readonly submissions = signal(0);
    protected readonly increment = (value: number) => value + 1;
    private latest?: boolean;

    protected request(event: RdxSwitchCheckedChangeEvent) {
        record(event.checked, event.eventDetails);
        this.latest = event.checked;
    }

    protected setExplicitName(): void {
        this.controlId.set('alerts-renamed');
        this.ariaLabel.set('Email notifications');
    }

    protected apply(): void {
        this.checked.set(this.latest);
    }
}
