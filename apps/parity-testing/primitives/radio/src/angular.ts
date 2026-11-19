import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective,
    type RdxRadioValueChangeEvent
} from '@radix-ng/primitives/radio';
import { AngularRadioCollection } from './collection.angular';
import { config, installProbe, options } from './contract';
import { AngularRadioForms } from './forms.angular';
import { AngularRadioRefs } from './refs.angular';
import { AngularRadioValidation } from './validation.angular';

@Component({
    selector: 'parity-radio-items',
    imports: [
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective
    ],
    template: `
        @for (option of choices; track option.value) {
            @if (nativeButton) {
                <button [value]="option.value" [attr.data-testid]="'radio-' + option.value" rdxRadioItem>
                    {{ option.label }}
                </button>
            } @else {
                <label>
                    <span
                        [attr.data-testid]="'radio-' + option.value"
                        [value]="option.value"
                        [disabled]="settings.disabledItem === option.value"
                        (keyup)="maybePreventSpace($event)"
                        rdxRadioItem
                    >
                        {{ option.label }}
                        @if (settings.indicator) {
                            <span
                                *rdxRadioIndicatorPresence="{ keepMounted: settings.indicator === 'keep-mounted' }"
                                [attr.data-testid]="'indicator-' + option.value"
                                rdxRadioIndicator
                            ></span>
                        }
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
    protected readonly settings = config();
    protected readonly nativeButton = this.settings.nativeButton;

    protected maybePreventSpace(event: KeyboardEvent): void {
        if (this.settings.keyboard === 'prevent-space' && event.key === ' ') event.preventDefault();
    }
}

@Component({
    selector: 'parity-radio',
    imports: [RdxDirectionProvider, RdxRadioGroupDirective, RadioItems],
    template: `
        <button type="button" tabindex="0" data-testid="before">Before</button>
        <form [direction]="settings.dir" [attr.dir]="settings.dir ?? 'ltr'" rdxDirectionProvider>
            @if (response) {
                <div
                    [controlledValue]="value()"
                    [defaultValue]="defaultValue()"
                    [disabled]="settings.disabled ?? false"
                    [readOnly]="settings.readOnly ?? false"
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
                    [disabled]="settings.disabled ?? false"
                    [readOnly]="settings.readOnly ?? false"
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
                    [disabled]="settings.disabled ?? false"
                    [readOnly]="settings.readOnly ?? false"
                    (onValueChange)="recordChange($event)"
                    rdxRadioRoot
                    name="density"
                    aria-label="Density"
                >
                    <parity-radio-items />
                </div>
            }
        </form>
        <button type="button" tabindex="0" data-testid="after">After</button>
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
    protected readonly settings = config();
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

const settings = config();
const fixture = settings.validation
    ? AngularRadioValidation
    : settings.refs
      ? AngularRadioRefs
      : settings.collection
        ? AngularRadioCollection
        : settings.forms
          ? AngularRadioForms
          : AngularRadio;
void bootstrapApplication(fixture, {
    providers: [provideZonelessChangeDetection()]
});
