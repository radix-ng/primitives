import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideUnfoldVertical, LucideX } from '@lucide/angular';
import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-collapsible-animation',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsiblePanelDirective,
        LucideX,
        LucideUnfoldVertical
    ],
    template: `
        <div class="w-full max-w-sm" [open]="open()" (onOpenChange)="open.set($event.open)" rdxCollapsibleRoot>
            <div class="flex items-center justify-between gap-3">
                <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
                <button
                    class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
                    type="button"
                    rdxCollapsibleTrigger
                >
                    @if (open()) {
                        <svg class="flex" size="16" lucideX />
                    } @else {
                        <svg class="flex" size="16" lucideUnfoldVertical />
                    }
                </button>
            </div>

            <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                <span class="text-sm">&#64;radix-ui/primitives</span>
            </div>

            <!--
                The panel animates between 0 and its measured size using the
                \`--collapsible-panel-height\` variable. \`keepMounted\` leaves it in the DOM after
                collapse; \`data-starting-style\` / \`data-ending-style\` drive the open and close transitions.
            -->
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
export class RdxCollapsibleAnimationComponent {
    open = signal(true);
}
