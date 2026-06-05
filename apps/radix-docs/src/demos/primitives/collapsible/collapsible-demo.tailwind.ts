import { Component } from '@angular/core';
import { LucideDynamicIcon, LucideUnfoldVertical as UnfoldVertical, LucideX as X } from '@lucide/angular';
import {
    RdxCollapsiblePanelDirective,
    RdxCollapsiblePanelPresenceDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'radix-collapsible-tailwind-demo',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsiblePanelDirective,
        RdxCollapsiblePanelPresenceDirective,
        LucideDynamicIcon
    ],
    template: `
        <div
            class="sm:w w-[220px] space-y-2 text-sm sm:w-[280px] lg:w-[320px]"
            #collapsibleRoot="rdxCollapsibleRoot"
            [open]="true"
            rdxCollapsibleRoot
        >
            <div class="flex items-center justify-between space-x-4 px-4">
                <span class="font-medium">&#64;peduarte starred 3 repositories</span>
                <button
                    class="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    type="button"
                    rdxCollapsibleTrigger
                >
                    @if (collapsibleRoot.open()) {
                        <svg [lucideIcon]="XIcon" size="16" style="display: flex;" />
                    } @else {
                        <svg [lucideIcon]="UnfoldVerticalIcon" size="16" style="display: flex;" />
                    }
                </button>
            </div>

            <div class="rounded-md border px-4 py-2">
                <span class="font-mono">&#64;radix-ui/primitives</span>
            </div>

            <div rdxCollapsiblePanel>
                <div class="space-y-2 overflow-hidden" *rdxCollapsiblePanelPresence>
                    <div class="rounded-md border px-4 py-2">
                        <span class="font-mono">&#64;radix-ui/colors</span>
                    </div>
                    <div class="rounded-md border px-4 py-2">
                        <span class="font-mono">&#64;stitches/react</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class CollapsibleDemoComponent {
    readonly XIcon = X;
    readonly UnfoldVerticalIcon = UnfoldVertical;
}

export default CollapsibleDemoComponent;
