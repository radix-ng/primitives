import { Component, signal } from '@angular/core';
import { popoverImports, RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-controlled-multiple',
    imports: [...popoverImports, LucideAngularModule],
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
                            [class]="cn(b.base, b.outline, b.size.sm)"
                            [id]="item.id"
                            [payload]="item"
                            rdxPopoverTrigger
                        >
                            {{ item.label }}
                        </button>
                    }

                    <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openProgrammatically()">
                        Open programmatically
                    </button>
                </div>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                            <div [class]="p.popup" rdxPopoverPopup>
                                <span [class]="p.arrow" rdxPopoverArrow></span>
                                <h2 [class]="p.title" rdxPopoverTitle>{{ activeItem()?.label }}</h2>
                                <p [class]="p.description" rdxPopoverDescription>
                                    The externally controlled trigger id is {{ triggerId() }}.
                                </p>
                                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                    <lucide-angular aria-hidden="true" name="x" size="14" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
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
