import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
                <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="open.set(true)">Open externally</button>
                <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="open.set(false)">Close externally</button>
            </div>

            <p class="text-muted-foreground text-xs">State: {{ open() ? 'open' : 'closed' }}</p>

            <ng-container rdxPopoverRoot [(open)]="open">
                <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">Toggle popover</button>

                <ng-template rdxPopoverPortal>
                    <div rdxPopoverBackdrop [class]="p.backdrop"></div>
                    <div sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                        <div rdxPopoverPopup [class]="p.popup">
                            <span rdxPopoverArrow [class]="p.arrow"></span>
                            <h2 rdxPopoverTitle [class]="p.title">Controlled state</h2>
                            <p rdxPopoverDescription [class]="p.description">
                                The root uses Angular two-way binding with a signal.
                            </p>
                            <button aria-label="Close" rdxPopoverClose [class]="p.close">
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly open = signal(false);
}
