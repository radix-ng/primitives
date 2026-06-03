import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

@Component({
    selector: 'rdx-collapsible-animation',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective,
        LucideAngularModule
    ],
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
        <div class="w-full max-w-sm" [open]="open()" (onOpenChange)="open.set($event)" rdxCollapsibleRoot>
            <div class="flex items-center justify-between gap-3">
                <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
                <button
                    class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
                    type="button"
                    rdxCollapsibleTrigger
                >
                    @if (open()) {
                        <lucide-angular class="flex" size="16" name="x" />
                    } @else {
                        <lucide-angular class="flex" size="16" name="unfold-vertical" />
                    }
                </button>
            </div>

            <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                <span class="text-sm">&#64;radix-ui/primitives</span>
            </div>

            <div class="overflow-hidden" [class]="open() ? 'expanded' : 'collapsed'" rdxCollapsibleContent>
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
