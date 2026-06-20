import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-collapsible-external-triggering',
    imports: [RdxCollapsibleRootDirective, RdxCollapsiblePanelDirective],
    template: `
        <button
            class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border mb-3 inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium shadow-sm transition-colors outline-none focus-visible:ring-2"
            (click)="open.set(!open())"
            type="button"
        >
            External Trigger
        </button>

        <div class="w-full max-w-sm" [open]="open()" rdxCollapsibleRoot>
            <div class="flex items-center justify-between gap-3">
                <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
            </div>

            <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                <span class="text-sm">&#64;radix-ui/primitives</span>
            </div>

            <div
                class="h-[var(--collapsible-panel-height)] overflow-hidden opacity-100 transition-[height,opacity] duration-300 ease-out data-[closed]:h-0 data-[closed]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0"
                [keepMounted]="true"
                rdxCollapsiblePanel
            >
                <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                    <span class="text-sm">&#64;radix-ui/colors</span>
                </div>
                <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                    <span class="text-sm">&#64;stitches/react</span>
                </div>
            </div>
        </div>
    `
})
export class RdxCollapsibleExternalTriggeringComponent {
    open = signal(true);
}
