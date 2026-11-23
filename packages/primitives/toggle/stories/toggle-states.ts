import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideItalic } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-pressed-example',
    imports: [RdxToggle, LucideItalic],
    template: `
        <button class="demo-button demo-toolbar-pressable size-8" rdxToggle defaultPressed aria-label="Toggle italic">
            <svg class="flex" lucideItalic size="16" aria-hidden="true"></svg>
        </button>
    `
})
export class TogglePressedExample {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-disabled-example',
    imports: [RdxToggle, LucideItalic],
    template: `
        <button class="demo-button demo-toolbar-pressable size-8" rdxToggle disabled aria-label="Toggle italic">
            <svg class="flex" lucideItalic size="16" aria-hidden="true"></svg>
        </button>
    `
})
export class ToggleDisabledExample {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-controlled-example',
    imports: [RdxToggle, LucideItalic],
    template: `
        <div class="flex flex-col items-center gap-3">
            <button
                class="demo-button demo-toolbar-pressable size-8"
                [(pressed)]="pressed"
                rdxToggle
                aria-label="Toggle italic"
            >
                <svg class="flex" lucideItalic size="16" aria-hidden="true"></svg>
            </button>
            <span class="text-muted-foreground text-sm">pressed: {{ pressed() }}</span>
        </div>
    `
})
export class ToggleControlledExample {
    protected readonly pressed = signal(false);
}
