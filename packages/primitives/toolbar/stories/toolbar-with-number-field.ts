import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';
import { RdxToolbarButton, RdxToolbarInput, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

const stepClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 disabled:opacity-50';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-number-field',
    imports: [
        RdxToolbarRoot,
        RdxToolbarButton,
        RdxToolbarInput,
        RdxToolbarSeparator,
        RdxNumberFieldRoot,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement,
        LucideMinus,
        LucidePlus
    ],
    template: `
        <div
            class="demo-toolbar-root flex items-center gap-1 p-1"
            rdxToolbarRoot
            aria-label="Toolbar with number field"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <div
                class="flex items-center gap-0.5"
                [value]="16"
                rdxNumberFieldRoot
                min="8"
                max="72"
                aria-label="Font size"
            >
                <button class="${stepClass}" aria-label="Decrease" rdxToolbarButton rdxNumberFieldDecrement>
                    <svg lucideMinus size="16"></svg>
                </button>
                <input
                    class="border-border bg-background text-foreground focus-visible:ring-ring h-8 w-12 border text-center text-sm outline-none focus-visible:ring-2"
                    rdxToolbarInput
                    rdxNumberFieldInput
                />
                <button class="${stepClass}" aria-label="Increase" rdxToolbarButton rdxNumberFieldIncrement>
                    <svg lucidePlus size="16"></svg>
                </button>
            </div>
        </div>
    `
})
export class ToolbarWithNumberFieldExample {}
