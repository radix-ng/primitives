import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxToggle, type RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup, type RdxToggleGroupValueChangeEvent } from '@radix-ng/primitives/toggle-group';
import { initialDefault, initialValue, installProbe, recordGroup, recordItem } from './contract';

installProbe();

@Component({
    selector: 'parity-toggle-group',
    imports: [RdxToggle, RdxToggleGroup],
    template: `
        <div
            [controlledValue]="controlled()"
            [defaultValue]="defaults()"
            (onValueChange)="request($event)"
            rdxToggleGroup
            aria-label="Formatting"
        >
            <button (onPressedChange)="item('bold', $event)" value="bold" rdxToggle>Bold</button>
            <button (onPressedChange)="item('italic', $event)" value="italic" rdxToggle>Italic</button>
        </div>
        <button (click)="defaults.set(['italic'])" type="button">Change default</button>
        <button (click)="apply()" type="button">Apply request</button>
        <button (click)="controlled.set([])" type="button">Clear selection</button>
    `
})
class ToggleGroupFixture {
    protected readonly defaults = signal<string[] | undefined>(initialDefault);
    protected readonly controlled = signal<string[] | undefined>(initialValue);
    private pending?: string[];

    protected item(value: string, change: RdxTogglePressedChangeEvent): void {
        recordItem(value, change.pressed, change.eventDetails);
    }

    protected request(change: RdxToggleGroupValueChangeEvent): void {
        recordGroup(change.value, change.eventDetails);
        this.pending = change.value;
    }

    protected apply(): void {
        this.controlled.set(this.pending);
    }
}

void bootstrapApplication(ToggleGroupFixture, { providers: [provideZonelessChangeDetection()] });
