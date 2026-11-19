import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxNumberFieldHiddenInput,
    RdxNumberFieldInput,
    RdxNumberFieldRoot,
    type RdxNumberFieldValueChangeEvent
} from '@radix-ng/primitives/number-field';
import { config, installProbe } from './contract';

@Component({
    selector: 'parity-number-field-parts',
    imports: [RdxNumberFieldInput, RdxNumberFieldHiddenInput],
    template: `
        <input aria-label="Amount" rdxNumberFieldInput />
        <input rdxNumberFieldHiddenInput />
    `
})
class NumberFieldParts {}

@Component({
    selector: 'parity-number-field',
    imports: [NumberFieldParts, RdxNumberFieldRoot],
    template: `
        <form>
            @if (bound) {
                <div
                    [(value)]="value"
                    [defaultValue]="defaultValue()"
                    [format]="settings.format"
                    (onValueChange)="recordChange($event)"
                    (onValueCommitted)="probe.commits.push($event)"
                    name="amount"
                    rdxNumberFieldRoot
                >
                    <parity-number-field-parts />
                </div>
            } @else {
                <div
                    [defaultValue]="defaultValue()"
                    [format]="settings.format"
                    (onValueChange)="recordChange($event)"
                    (onValueCommitted)="probe.commits.push($event)"
                    name="amount"
                    rdxNumberFieldRoot
                >
                    <parity-number-field-parts />
                </div>
            }
        </form>
        <button (click)="changeDefault()" type="button">Change default</button>
        @if (bound) {
            <button (click)="value.set(8)" type="button">Write value</button>
        }
    `
})
class AngularNumberField {
    protected readonly settings = config();
    protected readonly bound = this.settings.value !== undefined;
    protected readonly value = signal<number | null>(this.settings.value ?? null);
    protected readonly defaultValue = signal<number | undefined>(this.settings.defaultValue);
    protected readonly probe = installProbe();

    protected recordChange({ value, eventDetails }: RdxNumberFieldValueChangeEvent): void {
        if (eventDetails.reason === this.settings.cancelReason) eventDetails.cancel();
        this.probe.changes.push({ value, reason: eventDetails.reason });
        this.probe.nativeEvents.push({ type: eventDetails.event.type, trusted: eventDetails.event.isTrusted });
    }

    protected changeDefault(): void {
        this.defaultValue.update((value) => (value ?? 0) + 40);
    }
}

void bootstrapApplication(AngularNumberField, { providers: [provideZonelessChangeDetection()] });
