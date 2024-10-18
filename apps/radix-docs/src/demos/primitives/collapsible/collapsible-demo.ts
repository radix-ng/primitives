import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
    RdxCollapsibleContentDirective,
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
        LucideAngularModule,
        NgIf
    ],
    template: `
        <div class="CollapsibleRoot" #collapsibleRoot="collapsibleRoot" [open]="true" rdxCollapsibleRoot>
            <div class="Title">
                <span class="Text">Starred 3 repositories</span>
                <button class="IconButton" rdxCollapsibleTrigger>
                    @if (collapsibleRoot.isOpen()) {
                        <lucide-angular [img]="XIcon" size="16" style="display: flex;" />
                    } @else {
                        <lucide-angular [img]="UnfoldVerticalIcon" size="16" style="display: flex;" />
                    }
                </button>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div class="RepositoryGroup" rdxCollapsibleContent>
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
export class CollapsibleDemoComponent {
    readonly XIcon = X;
    readonly UnfoldVerticalIcon = UnfoldVertical;
}

export default CollapsibleDemoComponent;
