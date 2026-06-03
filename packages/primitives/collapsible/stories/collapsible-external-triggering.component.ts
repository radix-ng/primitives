import { Component, signal } from '@angular/core';

import { RdxCollapsibleContentPresenceDirective } from '../src/collapsible-content-presence.directive';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    selector: 'rdx-collapsible-external-triggering',
    imports: [RdxCollapsibleRootDirective, RdxCollapsibleContentDirective, RdxCollapsibleContentPresenceDirective],
    styles: `
        .expanded {
            max-height: 12rem;
            opacity: 1;
            transition:
                max-height 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98),
                opacity 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98);
        }

        .collapsed {
            max-height: 0;
            opacity: 0;
            transition:
                max-height 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98),
                opacity 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98);
        }
    `,
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

            <div class="overflow-hidden" [class]="open() ? 'expanded' : 'collapsed'" rdxCollapsibleContent>
                <div *rdxCollapsibleContentPresence>
                    <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                        <span class="text-sm">&#64;radix-ui/colors</span>
                    </div>
                    <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                        <span class="text-sm">&#64;stitches/react</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RdxCollapsibleExternalTriggeringComponent {
    open = signal(true);
}
