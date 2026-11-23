import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LucideTextAlignCenter, LucideTextAlignEnd, LucideTextAlignStart } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toggle-group',
    imports: [RdxToggleGroup, RdxToggle, LucideTextAlignStart, LucideTextAlignCenter, LucideTextAlignEnd],
    template: `
        <div
            class="border-foreground inline-flex gap-px border p-px"
            [(value)]="align"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="left" aria-label="Left aligned">
                <svg lucideTextAlignStart size="16" aria-hidden="true" />
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="center"
                aria-label="Center aligned"
            >
                <svg lucideTextAlignCenter size="16" aria-hidden="true" />
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="right"
                aria-label="Right aligned"
            >
                <svg lucideTextAlignEnd size="16" aria-hidden="true" />
            </button>
        </div>

        <div class="text-muted-foreground mt-3 text-sm">value: [{{ align().join(', ') }}]</div>
    `
})
export class ToggleGroup {
    readonly align = model<string[]>(['right']);
}
