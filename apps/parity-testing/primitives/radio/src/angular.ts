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
            <span [value]="option.value" rdxRadioItem>
                {{ option.label }}
                <input rdxRadioItemInput />
            </span>
        }
    `
})
class RadioItems {
    protected readonly choices = options;
}

@Component({
    selector: 'parity-radio',
    imports: [RdxRadioGroupDirective, RadioItems],
    template: `
        <form>
            @if (bound) {
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
    `
})
class AngularRadio {
    private readonly settings = config();
    private readonly probe = installProbe();
    protected readonly bound = this.settings.value !== undefined;
    protected readonly value = signal<string | null>(this.settings.value ?? null);
    protected readonly defaultValue = signal(this.settings.defaultValue);

    protected changeDefault() {
        this.defaultValue.update((value) => (value === 'standard' ? 'compact' : 'standard'));
    }

    protected recordChange({ value, eventDetails }: RdxRadioValueChangeEvent) {
        this.probe.changes.push({ value, reason: eventDetails.reason });
        this.probe.nativeEvents.push({ type: eventDetails.event.type, trusted: eventDetails.event.isTrusted });
        if (this.probe.cancelNext) {
            this.probe.cancelNext = false;
            eventDetails.cancel();
        }
    }
}

void bootstrapApplication(AngularRadio, { providers: [provideZonelessChangeDetection()] });
