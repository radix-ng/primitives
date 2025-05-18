import { Component } from '@angular/core';
import {
    RdxCollapsibleContentDirective,
    RdxCollapsibleContentPresenceDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';
import { LucideAngularModule, UnfoldVertical, X } from 'lucide-angular';

@Component({
    selector: 'collapsible-demo',
    standalone: true,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective,
        RdxCollapsibleContentPresenceDirective,
        LucideAngularModule
    ],
    template: `
        <div class="CollapsibleRoot" #collapsibleRoot="rdxCollapsibleRoot" [open]="true" rdxCollapsibleRoot>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1em;">
                <span class="Text" style="color: white;">&#64;peduarte starred 3 repositories</span>
                <button class="IconButton" style="flex-shrink: 0;" rdxCollapsibleTrigger>
                    @if (collapsibleRoot.open()) {
                        <lucide-angular [img]="XIcon" size="16" style="display: flex;" />
                    } @else {
                        <lucide-angular [img]="UnfoldVerticalIcon" size="16" style="display: flex;" />
                    }
                </button>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div rdxCollapsibleContent>
                <div *rdxCollapsibleContentPresence>
                    <div class="Repository">
                        <span class="Text">&#64;radix-ui/colors</span>
                    </div>
                    <div class="Repository">
                        <span class="Text">&#64;stitches/react</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrl: 'collapsible-demo.css'
})
export class CollapsibleDemoComponent {
    readonly XIcon = X;
    readonly UnfoldVerticalIcon = UnfoldVertical;
}

export default CollapsibleDemoComponent;
