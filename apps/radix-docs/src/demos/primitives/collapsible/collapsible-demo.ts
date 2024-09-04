import { Component } from '@angular/core';
import {
    RdxCollapsibleContentDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    selector: 'collapsible-demo',
    standalone: true,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective
    ],
    template: `
        <div class="CollapsibleRoot" [open]="true" rdxCollapsibleRoot>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
                <button class="IconButton" rdxCollapsibleTrigger></button>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div rdxCollapsibleContent>
                <div class="Repository">
                    <span class="Text">&#64;radix-ui/colors</span>
                </div>
                <div class="Repository">
                    <span class="Text">&#64;stitches/react</span>
                </div>
            </div>
        </div>
    `,
    styleUrl: 'collapsible-demo.css'
})
export class CollapsibleDemoComponent {}

export default CollapsibleDemoComponent;
