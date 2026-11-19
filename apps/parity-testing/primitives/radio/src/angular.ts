import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxRadioGroupDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective,
    type RdxRadioValueChangeEvent
} from '@radix-ng/primitives/radio';
import { config, installProbe, options } from './contract';

@Component({
    selector: 'parity-radio-items',
    imports: [RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        @for (option of choices; track option.value) {
            @if (nativeButton) {
                <button [value]="option.value" rdxRadioItem>{{ option.label }}</button>
            } @else {
                <label>
                    <span [value]="option.value" rdxRadioItem>
                        {{ option.label }}
                        <input rdxRadioItemInput />
                    </span>
                    <span [attr.data-testid]="'label-' + option.value">Select</span>
                </label>
            }
        }
    `
})
class RadioItems {
    protected readonly choices = options;
    protected readonly nativeButton = config().nativeButton;
}

@Component({
    selector: 'parity-radio',
    imports: [RdxRadioGroupDirective, RadioItems],
    template: `
        <form>
            @if (response) {
                <div
                    [controlledValue]="value()"
                    [defaultValue]="defaultValue()"
                    (onValueChange)="recordChange($event)"
                    rdxRadioRoot
                    name="density"
                    aria-label="Density"
                >
                    <parity-radio-items />
                </div>
            } @else if (bound) {
                <div
                    [(value)]="value"
                    [defaultValue]="defaultValue()"
                    (onValueChange)="recordChange($event)"
                    rdxRadioRoot
                    name="density"
                    aria-label="Density"
                >
                    <parity-radio-items />
                </div>
            } @else {
                <div
                    [defaultValue]="defaultValue()"
                    (onValueChange)="recordChange($event)"
                    rdxRadioRoot
                    name="density"
                    aria-label="Density"
                >
                    <parity-radio-items />
                </div>
            }
        </form>
        <button (click)="changeDefault()" type="button">Change default</button>
        @if (bound) {
            <button (click)="value.set('standard')" type="button">Write value</button>
        }
        @if (response === 'delay') {
            <button (click)="value.set(pending)" type="button">Apply request</button>
        }
    `
})
class AngularRadio {
    private readonly settings = config();
    private readonly probe = installProbe();
    protected readonly bound = this.settings.value !== undefined;
    protected readonly response = this.settings.response;
    protected pending: string | null = null;
    protected readonly value = signal<string | null>(this.settings.value ?? null);
    protected readonly defaultValue = signal(this.settings.defaultValue);

    protected changeDefault() {
        this.defaultValue.update((value) => (value === 'standard' ? 'compact' : 'standard'));
    }

    protected recordChange({ value, eventDetails }: RdxRadioValueChangeEvent) {
        this.probe.changes.push({ value, reason: eventDetails.reason });
        this.probe.nativeEvents.push({ type: eventDetails.event.type, trusted: eventDetails.event.isTrusted });
        if (this.probe.cancelNext || this.response === 'cancel') {
            this.probe.cancelNext = false;
            eventDetails.cancel();
            return;
        }
        if (this.response === 'delay') this.pending = value;
        if (this.response === 'replace') this.value.set('');
        if (this.response === 'clear') this.value.set(null);
    }
}

void bootstrapApplication(AngularRadio, { providers: [provideZonelessChangeDetection()] });
