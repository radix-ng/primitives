import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverOpenChange,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled-multiple',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="handleOpenChange($event)"
                rdxPopoverRoot
            >
                <div class="flex flex-wrap justify-center gap-2">
                    @for (item of items; track item.id) {
                        <button
                            class="demo-button demo-button-outline h-8 px-3 text-xs"
                            [id]="item.id"
                            [payload]="item"
                            rdxPopoverTrigger
                        >
                            {{ item.label }}
                        </button>
                    }

                    <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="openProgrammatically()">
                        Open programmatically
                    </button>
                </div>

                <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>{{ activeItem()?.label }}</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            The externally controlled trigger id is {{ triggerId() }}.
                        </p>
                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
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
