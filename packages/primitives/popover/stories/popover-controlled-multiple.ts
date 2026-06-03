import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports, RdxPopoverOpenChange } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled-multiple',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container
                rdxPopoverRoot
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="handleOpenChange($event)"
            >
                <div class="flex flex-wrap justify-center gap-2">
                    @for (item of items; track item.id) {
                        <button
                            rdxPopoverTrigger
                            [class]="cn(b.base, b.outline, b.size.sm)"
                            [id]="item.id"
                            [payload]="item"
                        >
                            {{ item.label }}
                        </button>
                    }

                    <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openProgrammatically()">
                        Open programmatically
                    </button>
                </div>

                <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                    <div rdxPopoverPopup [class]="p.popup">
                        <span rdxPopoverArrow [class]="p.arrow"></span>
                        <h2 rdxPopoverTitle [class]="p.title">{{ activeItem()?.label }}</h2>
                        <p rdxPopoverDescription [class]="p.description">
                            The externally controlled trigger id is {{ triggerId() }}.
                        </p>
                        <button aria-label="Close" rdxPopoverClose [class]="p.close">
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>

            <p class="text-muted-foreground text-center text-xs">
                State: {{ open() ? 'open' : 'closed' }} · Trigger: {{ triggerId() ?? 'none' }} · Reason:
                {{ lastReason() }}
            </p>
        </div>
    `
})
export class RdxPopoverControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);
    protected readonly lastReason = signal('none');
    protected readonly items = [
        { id: 'notifications', label: 'Notifications' },
        { id: 'activity', label: 'Activity' },
        { id: 'profile', label: 'Profile' }
    ];

    protected activeItem() {
        return this.items.find((item) => item.id === this.triggerId());
    }

    protected openProgrammatically() {
        this.triggerId.set('activity');
        this.open.set(true);
    }

    protected handleOpenChange(change: RdxPopoverOpenChange) {
        this.lastReason.set(change.reason);
    }
}
