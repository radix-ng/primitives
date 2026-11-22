import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxToggle, type RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { custom, disabled, initialDefault, initialPressed, installProbe, record } from './contract';

installProbe();

@Component({
    selector: 'parity-toggle',
    imports: [RdxToggle],
    template: `
        <input aria-label="Before" />
        @if (custom) {
            <span [nativeButton]="false" [disabled]="disabled" (onPressedChange)="request($event)" rdxToggle>Bold</span>
        } @else {
            <button
                [pressed]="pressed()"
                [defaultPressed]="defaultPressed()"
                (onPressedChange)="request($event)"
                rdxToggle
            >
                Bold
            </button>
        }
        <input aria-label="After" />
        <button (click)="defaultPressed.set(!defaultPressed())" type="button">Change default</button>
        <button (click)="apply()" type="button">Apply request</button>
        <button (click)="pressed.set(false)" type="button">Set off</button>
    `
})
class ToggleFixture {
    protected readonly custom = custom;
    protected readonly disabled = disabled;
    protected readonly defaultPressed = signal(initialDefault);
    protected readonly pressed = signal<boolean | undefined>(initialPressed);
    private pending?: boolean;

    protected request(event: RdxTogglePressedChangeEvent): void {
        record(event.pressed, event.eventDetails);
        this.pending = event.pressed;
    }

    protected apply(): void {
        this.pressed.set(this.pending);
    }
}

void bootstrapApplication(ToggleFixture, { providers: [provideZonelessChangeDetection()] });
